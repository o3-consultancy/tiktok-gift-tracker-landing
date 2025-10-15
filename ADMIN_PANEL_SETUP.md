# Admin Panel Setup Guide

## Overview

Admin panel for O3 TT Gifts platform hosted at `admin.o3-ttgifts.com`

**Architecture:**
- Frontend: Vue 3 + TypeScript + Tailwind CSS
- Backend: Shared with main app (same Node.js API)
- Database: Shared MongoDB/Firestore
- Domain: admin.o3-ttgifts.com
- Server: Same VM as main app

**Key Features:**
1. User Management - View all users and subscriptions
2. TikTok Account Management - Assign Live URLs, update status
3. Analytics Dashboard - User metrics, revenue tracking
4. Admin Authentication - Role-based access control

---

## Part 1: Backend Setup (Add Admin Routes)

### Step 1: Add Admin Role to User Model

Update `backend/src/models/User.ts`:

```typescript
export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  role: 'user' | 'admin';  // ADD THIS
  lastLogin?: Date;
  isActive: boolean;
}

// Update schema
const userSchema = new Schema<IUser>({
  // ... existing fields
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // ... rest of fields
});
```

### Step 2: Create Admin Middleware

Create `backend/src/middleware/adminAuth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { createError } from './errorHandler.js';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user || user.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

### Step 3: Create Admin Routes

Create `backend/src/routes/admin.routes.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { TikTokAccount } from '../models/TikTokAccount.js';
import { Payment } from '../models/Payment.js';
import { logger } from '../utils/logger.js';

const router = Router();

// All admin routes require authentication AND admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments();
  const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
  const totalAccounts = await TikTokAccount.countDocuments();

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('email displayName createdAt');

  const revenueData = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeSubscriptions,
      totalAccounts,
      totalRevenue: revenueData[0]?.total || 0,
      recentUsers
    }
  });
}));

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await User.countDocuments();

  // Get subscription info for each user
  const usersWithSubscriptions = await Promise.all(
    users.map(async (user) => {
      const subscription = await Subscription.findOne({ userId: user._id });
      return {
        ...user.toObject(),
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd
        } : null
      };
    })
  );

  res.json({
    success: true,
    data: {
      users: usersWithSubscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

/**
 * GET /api/admin/users/:userId
 * Get detailed user information
 */
router.get('/users/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const subscription = await Subscription.findOne({ userId: user._id });
  const accounts = await TikTokAccount.find({ userId: user._id });
  const payments = await Payment.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      user,
      subscription,
      accounts,
      payments
    }
  });
}));

/**
 * GET /api/admin/accounts
 * Get all TikTok accounts across all users
 */
router.get('/accounts', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  const query = status ? { status } : {};

  const accounts = await TikTokAccount.find(query)
    .populate('userId', 'email displayName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await TikTokAccount.countDocuments(query);

  res.json({
    success: true,
    data: {
      accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

/**
 * PATCH /api/admin/accounts/:accountId
 * Update TikTok account (assign URL, change status)
 */
router.patch('/accounts/:accountId', asyncHandler(async (req: Request, res: Response) => {
  const { status, accessUrl } = req.body;

  const account = await TikTokAccount.findById(req.params.accountId);
  if (!account) {
    throw createError('Account not found', 404);
  }

  if (status) {
    account.status = status;
  }

  if (accessUrl !== undefined) {
    account.accessUrl = accessUrl;
    // Auto-update status when URL is assigned
    if (accessUrl && account.status === 'pending') {
      account.status = 'active';
    }
  }

  await account.save();

  logger.info(`Admin updated account ${account.accountId}: status=${status}, url=${accessUrl}`);

  res.json({
    success: true,
    data: account,
    message: 'Account updated successfully'
  });
}));

/**
 * POST /api/admin/users/:userId/make-admin
 * Promote user to admin
 */
router.post('/users/:userId/make-admin', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  user.role = 'admin';
  await user.save();

  logger.info(`User ${user.email} promoted to admin`);

  res.json({
    success: true,
    message: 'User promoted to admin successfully'
  });
}));

/**
 * GET /api/admin/analytics
 * Get analytics data
 */
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // New users last 30 days
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Revenue last 30 days
  const recentRevenue = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Subscription breakdown
  const subscriptionBreakdown = await Subscription.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      newUsersLast30Days: newUsers,
      revenueLast30Days: recentRevenue[0]?.total || 0,
      subscriptionBreakdown
    }
  });
}));

export default router;
```

### Step 4: Add Admin Routes to Server

Update `backend/src/server.ts`:

```typescript
// Import admin routes
import adminRoutes from './routes/admin.routes.js';

// Add after other routes
app.use('/api/admin', apiLimiter, adminRoutes);
```

### Step 5: Update TikTok Account Model

Make sure `backend/src/models/TikTokAccount.ts` has these fields:

```typescript
export interface ITikTokAccount extends Document {
  userId: Types.ObjectId;
  accountId: string;
  accountName: string;
  accountHandle?: string;
  status: 'pending' | 'active' | 'inactive';
  accessUrl?: string;  // ADD THIS FIELD
  // ... other fields
}

const tiktokAccountSchema = new Schema<ITikTokAccount>({
  // ... existing fields
  accessUrl: {
    type: String,
    default: ''
  },
  // ... rest of fields
});
```

### Step 6: Create Initial Admin User

On your VM, create an admin user manually in MongoDB:

```bash
# Connect to your MongoDB (adjust connection as needed)
# Or use Firestore console

# You'll need to:
# 1. Sign up a regular user account via the app
# 2. Then manually update that user's role to 'admin' in the database
```

Or create a one-time script `backend/src/scripts/create-admin.ts`:

```typescript
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

async function createAdmin() {
  await connectDatabase();

  const email = 'admin@o3-ttgifts.com'; // Change this
  const firebaseUid = 'YOUR_FIREBASE_UID'; // Get this from Firebase Console

  const admin = await User.create({
    firebaseUid,
    email,
    displayName: 'Admin User',
    emailVerified: true,
    role: 'admin',
    isActive: true
  });

  console.log('Admin user created:', admin.email);
  process.exit(0);
}

createAdmin();
```

---

## Part 2: Admin Frontend Setup

### Step 1: Create Admin Frontend Directory

On your local machine:

```bash
cd /path/to/tiktok-gift-tracker-landing

# Create admin directory
npm create vite@latest admin-panel -- --template vue-ts

cd admin-panel

# Install dependencies
npm install
npm install vue-router pinia axios firebase tailwindcss @tailwindcss/forms
```

### Step 2: Initialize Tailwind

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Step 3: Project Structure

Create this structure in `admin-panel/src/`:

```
src/
├── assets/
├── components/
│   ├── Sidebar.vue
│   ├── Header.vue
│   └── UserTable.vue
├── views/
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── UsersView.vue
│   ├── AccountsView.vue
│   └── AnalyticsView.vue
├── stores/
│   └── adminAuth.ts
├── services/
│   └── adminApi.ts
├── router/
│   └── index.ts
├── App.vue
└── main.ts
```

---

## Part 3: Deploy Admin Panel

### Step 1: Build Admin Frontend

```bash
cd admin-panel
npm run build
```

### Step 2: Upload to Server

```bash
# From your local machine
scp -r dist/* user@34.18.58.50:/var/www/admin-o3-ttgifts/
```

### Step 3: Configure Nginx for Admin Subdomain

On the VM:

```bash
sudo nano /etc/nginx/sites-available/admin-o3-ttgifts
```

Add:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name admin.o3-ttgifts.com;

    root /var/www/admin-o3-ttgifts;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy (same as main site)
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/admin-o3-ttgifts /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Get SSL Certificate

```bash
sudo certbot --nginx -d admin.o3-ttgifts.com
```

---

## Quick Start Commands

**On VM - Backend:**
```bash
cd /var/www/o3-ttgifts/backend
# Admin routes already added
pm2 restart o3-backend
```

**Local - Build Admin:**
```bash
cd admin-panel
npm run build
```

**Deploy Admin:**
```bash
scp -r dist/* user@34.18.58.50:/var/www/admin-o3-ttgifts/
```

---

## Next Steps

1. Implement the admin frontend UI components
2. Add authentication flow
3. Create the accounts management page with URL assignment
4. Add user management features
5. Deploy and test

Would you like me to create the complete admin frontend code now?
