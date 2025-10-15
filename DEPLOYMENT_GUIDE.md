# O3 TT Gifts - Production Deployment Guide

## What We've Built

### Backend (Node.js + Express + TypeScript)
✅ Complete REST API with:
- **Authentication System**: Firebase Admin SDK integration, JWT middleware
- **Stripe Payment Integration**: Checkout sessions with $500 deployment fee + monthly subscription
- **Webhook Handling**: Subscription lifecycle management
- **Database Models**: User, Subscription, Payment, TikTokAccount (MongoDB via Firestore)
- **API Endpoints**:
  - `/api/auth/*` - Authentication and user management
  - `/api/payments/*` - Checkout, billing history, invoices, webhooks
  - `/api/subscriptions/*` - Subscription management (get, cancel, reactivate, change plan)
  - `/api/accounts/*` - TikTok account management

### Frontend (Vue 3 + TypeScript + Tailwind)
✅ Core infrastructure:
- **Firebase SDK**: Authentication setup
- **Pinia Store**: Authentication state management
- **API Service Layer**: Axios with Firebase token interceptor
- **Authentication Pages**: Login, Signup (with Google OAuth)
- **Existing Landing Page**: Home, pricing, features, contact, legal pages

### Still To Build (Next Steps)
🔲 Checkout page with Stripe integration
🔲 Dashboard layout with navigation
🔲 Dashboard pages (overview, subscription, billing, accounts)
🔲 Route guards for protected routes
🔲 Update PricingSection to route to checkout

---

## Prerequisites

### Required Accounts & Keys

1. **Firebase Project** (https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Download service account JSON
   - Get Firebase config for web app

2. **Stripe Account** (https://dashboard.stripe.com)
   - Get API keys (test and live)
   - Configure webhook endpoint
   - Get webhook signing secret

3. **Domain Name** (e.g., Namecheap, GoDaddy)
   - For frontend: `o3-ttgifts.com`
   - For backend API: `api.o3-ttgifts.com`

4. **Hosting Provider** (choose one):
   - **Railway** (recommended): https://railway.app
   - **Render**: https://render.com
   - **DigitalOcean App Platform**: https://digitalocean.com

---

## Backend Deployment

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create `backend/.env` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database (already configured)
MONGODB_URI=mongodb://o3-tt-db-connect:e131lyTsECHQD8Dk5nySAxd9mtDr7yroHfR_jtQpR0mLe-op@ce390461-534f-47b7-a0c4-286af499a070.nam5.firestore.goog:443/o3-tt-db?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Stripe (CHANGE TO LIVE KEYS FOR PRODUCTION)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=https://o3-ttgifts.com

# JWT (generate strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Build Backend

```bash
cd backend
npm run build
```

### Step 4: Deploy to Railway (Recommended)

1. **Create Railway Account**: https://railway.app
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **Initialize Project**:
   ```bash
   cd backend
   railway init
   ```
4. **Add Environment Variables** in Railway dashboard or via CLI:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI="your_mongo_uri"
   railway variables set STRIPE_SECRET_KEY="sk_live_..."
   # ... add all other env vars
   ```
5. **Deploy**:
   ```bash
   railway up
   ```
6. **Get Deployment URL**: `https://your-app.railway.app`
7. **Add Custom Domain**: `api.o3-ttgifts.com`

### Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.o3-ttgifts.com/api/payments/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret and update `STRIPE_WEBHOOK_SECRET` env var

---

## Frontend Deployment

### Step 1: Install Dependencies

```bash
cd /path/to/project-root
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in project root:

```bash
# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# Backend API URL
VITE_API_URL=https://api.o3-ttgifts.com/api
```

### Step 3: Build Frontend

```bash
npm run build
```

### Step 4: Deploy to Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist`
   - Configure as single-page app: Yes
   - Set up automatic builds with GitHub: Optional

3. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

4. **Add Custom Domain**:
   - Go to Firebase Console → Hosting
   - Click "Add custom domain"
   - Enter `o3-ttgifts.com`
   - Follow DNS configuration instructions
   - SSL certificate will be provisioned automatically

---

## Post-Deployment Checklist

### Backend Verification
- [ ] Health check: `https://api.o3-ttgifts.com/health`
- [ ] MongoDB connection working
- [ ] Firebase Admin SDK initialized
- [ ] Stripe webhook receiving events
- [ ] CORS configured for frontend domain
- [ ] Rate limiting active

### Frontend Verification
- [ ] Landing page loads: `https://o3-ttgifts.com`
- [ ] Firebase authentication works
- [ ] API calls to backend successful
- [ ] Stripe checkout redirects work
- [ ] All routes accessible

### Security Checks
- [ ] All environment variables using production values
- [ ] Stripe using live keys (not test keys)
- [ ] Firebase rules configured
- [ ] HTTPS enforced on all domains
- [ ] Rate limiting configured
- [ ] CORS restricted to your domains

### Testing Payment Flow
1. Go to pricing page
2. Click "Subscribe" on a plan
3. Should redirect to checkout
4. Complete payment with test card: `4242 4242 4242 4242`
5. Verify subscription created in database
6. Check Stripe dashboard for payment
7. Test webhook by updating subscription

---

## Monitoring & Maintenance

### Logs
- **Backend**: Railway dashboard → Logs
- **Frontend**: Firebase Console → Hosting
- **Stripe**: Stripe Dashboard → Webhooks → View logs

### Database Backup
- MongoDB backups via Firebase Console
- Set up automated backups (daily recommended)

### Cost Monitoring
- Railway: ~$5-20/month
- Firebase Hosting: FREE tier (probably sufficient)
- Stripe fees: 2.9% + $0.30 per transaction

---

## Troubleshooting

### "Authentication failed"
- Check Firebase config in `.env`
- Verify Firebase Authentication enabled
- Check browser console for errors

### "Payment failed"
- Verify Stripe keys are correct (live vs test)
- Check Stripe Dashboard → Logs
- Ensure webhook endpoint is reachable

### "Cannot connect to API"
- Verify backend is running: `https://api.o3-ttgifts.com/health`
- Check CORS configuration
- Verify `VITE_API_URL` in frontend env

### "Database connection error"
- Check MongoDB URI is correct
- Verify Firestore database is active
- Check Railway logs for connection errors

---

## Next Steps After Deployment

1. **Complete Frontend Development**:
   - Finish checkout page
   - Build dashboard pages
   - Add route guards
   - Update pricing section links

2. **Testing**:
   - End-to-end payment flow
   - Subscription management
   - Account limits enforcement
   - Error handling

3. **Marketing**:
   - SEO optimization
   - Analytics (Google Analytics)
   - Social media integration

4. **Support**:
   - Set up email support
   - Create knowledge base
   - Add live chat (optional)

---

## Support

For issues, contact:
- Email: support@o3-ttgifts.com
- Phone: +971 4 258 2613

---

**Deployment Date**: _To be filled_
**Version**: 1.0.0
**Status**: ✅ Backend Complete | 🔄 Frontend In Progress
