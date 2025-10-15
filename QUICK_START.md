# Quick Start Guide - O3 TT Gifts

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ installed
- MongoDB connection string (you already have this in `backend/.env`)
- Firebase project (needs to be set up)
- Stripe account (needs to be configured)

---

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ..  # Back to project root
npm install
```

---

## Step 2: Configure Environment Variables

### Backend Environment
The backend `.env` file already exists with MongoDB configured. You need to add:

```bash
# Add these to backend/.env:
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'  # Get from Firebase Console
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...  # Get after setting up webhook
```

**To get Firebase Service Account:**
1. Go to https://console.firebase.google.com
2. Select/create your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the entire JSON and paste as a single-line string

**To get Stripe Keys:**
1. Go to https://dashboard.stripe.com
2. Go to Developers → API Keys
3. Copy "Secret key" (starts with `sk_test_` for testing)

### Frontend Environment
Create `.env` file in project root:

```bash
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

**To get Firebase Web Config:**
1. Firebase Console → Project Settings
2. Scroll to "Your apps" → Web app (⚙️ icon)
3. If no web app exists, click "Add app" and select web
4. Copy the config values

**To get Stripe Publishable Key:**
1. Stripe Dashboard → Developers → API Keys
2. Copy "Publishable key" (starts with `pk_test_`)

---

## Step 3: Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable sign-in methods:
   - ✅ Email/Password
   - ✅ Google
4. For Google sign-in:
   - Click on Google provider
   - Enable it
   - Add your local domain: `localhost` (for development)

---

## Step 4: Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Server should start on http://localhost:3001

**Verify it's working:**
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "success": true,
  "message": "O3 TT Gifts API is running",
  "timestamp": "2024-10-14T...",
  "environment": "development"
}
```

### Terminal 2 - Frontend
```bash
# From project root
npm run dev
```

Frontend should start on http://localhost:5173

---

## Step 5: Test the Application

### Test Landing Page
1. Open http://localhost:5173
2. Should see O3 TT Gifts landing page
3. Navigate through:
   - ✅ Home page with features and pricing
   - ✅ Contact page
   - ✅ Privacy Policy, Terms, Cookie Policy

### Test Authentication
1. Click "Get Started" or navigate to http://localhost:5173/signup
2. Try signing up:
   - Enter name, email, password
   - Accept terms
   - Click "Create account"
3. Should see account created (check browser console and backend logs)
4. Try logging out and logging in again at http://localhost:5173/login
5. Try Google sign-in (requires Google OAuth configured in Firebase)

### Test API Endpoints (using curl or Postman)

**Note:** You need a Firebase token for authenticated endpoints. Get it from browser console after logging in:
```javascript
// In browser console after logging in:
firebase.auth().currentUser.getIdToken().then(token => console.log(token))
```

**Test Auth Endpoint:**
```bash
# Replace YOUR_TOKEN with actual Firebase token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/auth/me
```

**Test Get Current Subscription:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/subscriptions/current
```

**Test Get Available Plans:**
```bash
# This endpoint doesn't require authentication
curl http://localhost:3001/api/subscriptions/plans
```

---

## Step 6: Test Stripe Integration (Without Frontend UI)

Since the checkout page isn't built yet, you can test the API directly:

```bash
# 1. First, log in to get a Firebase token (use browser console)
# 2. Create a checkout session:

curl -X POST http://localhost:3001/api/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "PROFESSIONAL",
    "accountCount": 3
  }'
```

Response will include a Stripe checkout URL. Open it in your browser to test the payment flow.

**Stripe Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

---

## Common Issues & Solutions

### Backend won't start
**Error:** "MONGODB_URI is not defined"
- **Solution:** Check `backend/.env` file exists and has MongoDB connection string

**Error:** "Failed to initialize Firebase"
- **Solution:** Add `FIREBASE_SERVICE_ACCOUNT` to `backend/.env`

### Frontend won't start
**Error:** "Cannot find module '@/config/firebase'"
- **Solution:** Run `npm install` in project root

**Error:** Firebase errors in browser console
- **Solution:** Create `.env` file in project root with Firebase config

### Authentication not working
**Issue:** "FirebaseError: Firebase: Error (auth/...)"
- **Solution:** Check Firebase Authentication is enabled in Firebase Console
- Verify email/password provider is enabled

### API calls failing
**Error:** "Network Error" or "CORS error"
- **Solution:** Ensure backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env` is correct
- Verify CORS is configured in backend (should be automatic)

### Stripe checkout not working
**Issue:** "Invalid API key"
- **Solution:** Check `STRIPE_SECRET_KEY` in `backend/.env` is set correctly
- Ensure key starts with `sk_test_` for test mode

---

## Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `backend/src/`
2. Server auto-restarts (using tsx watch)
3. Check terminal for errors

**Frontend Changes:**
1. Edit files in `src/`
2. Browser auto-refreshes (Vite HMR)
3. Check browser console for errors

### Debugging

**Backend Logs:**
- Console output in terminal
- Log files in `backend/logs/` (if created)

**Frontend Logs:**
- Browser Developer Console (F12)
- Network tab for API calls

**Database:**
- Check MongoDB via Firebase Console
- Go to Firestore Database
- View collections: users, subscriptions, payments, tiktokaccounts

---

## Next Steps

Now that the backend and core frontend are working:

1. **Build Checkout Page** - Create Stripe checkout UI
2. **Build Dashboard** - Create dashboard layout and pages
3. **Add Route Guards** - Protect dashboard routes
4. **Update Pricing Section** - Add click handlers to route to checkout
5. **Test End-to-End** - Complete user journey from signup to subscription

See `IMPLEMENTATION_SUMMARY.md` for detailed next steps.

---

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Firebase
firebase login       # Login to Firebase
firebase init        # Initialize Firebase project
firebase deploy      # Deploy to Firebase Hosting

# Railway (Backend Deployment)
railway login        # Login to Railway
railway init         # Initialize Railway project
railway up           # Deploy backend
```

---

## Project Structure Quick Reference

```
/backend
  /src
    /config       - Database, Firebase, Stripe configs
    /middleware   - Auth, error handling, rate limiting
    /models       - Mongoose schemas
    /routes       - API endpoints
    /utils        - Logger, helpers
    server.ts     - Express server

/src
  /config       - Firebase client config
  /services     - API service layer
  /stores       - Pinia stores
  /views        - Pages
  /components   - Reusable components
  /router       - Vue Router config
  main.ts       - App entry point
```

---

## Support

If you encounter issues:
1. Check the error message in terminal/console
2. Review this Quick Start guide
3. Check `IMPLEMENTATION_SUMMARY.md` for detailed info
4. Check `DEPLOYMENT_GUIDE.md` for production setup

---

**Happy Coding!** 🚀
