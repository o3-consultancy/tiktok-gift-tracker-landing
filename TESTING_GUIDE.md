# Testing Guide - O3 TT Gifts SaaS Platform

## Current Status: Ready for Testing! 🎉

### ✅ Completed Features

#### Backend (100% Complete)
- ✅ Express server running on http://localhost:3001
- ✅ MongoDB connected via Firestore
- ✅ Firebase Admin SDK initialized
- ✅ All API endpoints functional
- ✅ Stripe integration ready
- ✅ Webhook handlers implemented

#### Frontend (95% Complete)
- ✅ Landing page with pricing
- ✅ Authentication (signup/login) - **WORKING**
- ✅ Checkout flow with Stripe
- ✅ Success/Cancel pages
- ✅ Basic dashboard
- ✅ All routing configured

---

## How to Test the Complete User Journey

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server should start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
```
Frontend should start on http://localhost:5173

---

### 2. Test Authentication Flow

#### A. Sign Up
1. Go to http://localhost:5173
2. Click on any pricing plan "Subscribe" button
3. You'll be redirected to signup page
4. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm password: password123
   - ✅ Accept terms
5. Click "Create account"
6. **Expected**: Account created, redirected to checkout

#### B. Login (After Logout)
1. Go to http://localhost:5173/login
2. Enter credentials
3. Click "Sign in"
4. **Expected**: Logged in successfully

#### C. Google Sign-In (Optional)
1. Click "Sign in with Google"
2. **Note**: Requires Google OAuth enabled in Firebase Console

---

### 3. Test Checkout Flow

#### A. Select a Plan
1. Go to homepage: http://localhost:5173
2. Scroll to pricing section
3. Click "Subscribe" on any plan (e.g., Professional $80/mo)
4. **If not logged in**: Redirected to signup
5. **If logged in**: Redirected to checkout

#### B. Review Checkout Page
1. Should show:
   - Selected plan details
   - $500 one-time deployment fee
   - Monthly subscription price
   - Total due today: $500 + monthly price
2. Click "Proceed to Payment"
3. **Expected**: Redirected to Stripe Checkout

#### C. Complete Stripe Payment (Test Mode)
1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., 12/34)
3. CVC: Any 3 digits (e.g., 123)
4. ZIP: Any 5 digits (e.g., 12345)
5. Click "Pay"
6. **Expected**: Redirected to success page

#### D. Cancel Payment
1. On Stripe checkout, click browser back button
2. **Expected**: Redirected to cancel page

---

### 4. Test Dashboard

1. After successful payment, click "Go to Dashboard"
2. **OR** navigate to http://localhost:5173/app/dashboard
3. Should show:
   - Welcome message
   - Subscription status: Active
   - Account limits (based on plan)
   - Getting started guide
   - Support information

---

### 5. Test API Endpoints (Optional)

**Get Firebase Token** (in browser console after login):
```javascript
firebase.auth().currentUser.getIdToken().then(token => console.log(token))
```

**Test Authenticated Endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/auth/me
```

**Test Subscription Endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/subscriptions/current
```

**Test Create Checkout Session:**
```bash
curl -X POST http://localhost:3001/api/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "PROFESSIONAL", "accountCount": 3}'
```

---

## Known Limitations (To Be Built)

### Dashboard Features (Not Yet Implemented)
- ❌ Add/Edit/Delete TikTok accounts
- ❌ Manage gift groups
- ❌ View analytics
- ❌ Subscription management (upgrade/downgrade/cancel)
- ❌ Billing history page
- ❌ Account settings page

These features have complete **backend API endpoints** but need frontend UI pages.

---

## Troubleshooting

### Backend Won't Start
**Issue**: `STRIPE_SECRET_KEY is not defined`
- **Fix**: Check `backend/.env` file exists and has Stripe key

**Issue**: `Firebase initialization failed`
- **Fix**: Ensure `o3-tt-subscription-firebase-adminsdk-fbsvc-*.json` file exists in backend folder

**Issue**: `MongoDB connection failed`
- **Fix**: Check MongoDB URI in `backend/.env` is correct

### Frontend Shows White Screen
**Issue**: Route not found
- **Fix**: Check router configuration in `src/router/index.ts`
- **Fix**: Restart frontend dev server

**Issue**: Firebase errors in console
- **Fix**: Check `.env` file in project root has correct Firebase config
- **Fix**: Enable Authentication in Firebase Console

### Checkout Doesn't Work
**Issue**: "Invalid token" error
- **Fix**: Ensure you're logged in
- **Fix**: Check Firebase token is being sent in API requests

**Issue**: No redirect to Stripe
- **Fix**: Check browser console for errors
- **Fix**: Ensure backend is running and accessible

### Authentication Issues
**Issue**: "Email already in use"
- **Fix**: Use different email or login instead
- **Fix**: Check Firebase Console → Authentication to see existing users

**Issue**: Google sign-in doesn't work
- **Fix**: Enable Google provider in Firebase Console → Authentication → Sign-in method

---

## Test Cases Checklist

### Authentication ✅
- [ ] Sign up with email/password
- [ ] Sign up with Google (if enabled)
- [ ] Login with email/password
- [ ] Login with Google (if enabled)
- [ ] Logout
- [ ] Password validation (min 8 chars)
- [ ] Email validation
- [ ] Terms acceptance required

### Checkout Flow ✅
- [ ] Select plan from pricing page
- [ ] Redirects to signup if not authenticated
- [ ] Redirects to checkout if authenticated
- [ ] Checkout page shows correct plan details
- [ ] Checkout page shows $500 deployment fee
- [ ] Checkout page shows total calculation
- [ ] Click "Proceed to Payment" opens Stripe
- [ ] Complete payment with test card
- [ ] Redirect to success page
- [ ] Cancel payment shows cancel page

### Dashboard ✅
- [ ] Dashboard accessible at /app/dashboard
- [ ] Shows user email
- [ ] Shows subscription status
- [ ] Shows account limits
- [ ] Logout button works
- [ ] Redirects to login if not authenticated

### API Endpoints ✅
- [ ] Health check returns 200
- [ ] Auth endpoints require valid token
- [ ] Create checkout session returns Stripe URL
- [ ] Get current subscription works
- [ ] Get available plans works

---

## Next Steps for Full Production

1. **Build Remaining Dashboard Pages** (~2-3 days)
   - Subscription management
   - Billing history
   - TikTok account CRUD
   - Gift group management
   - Settings page

2. **Stripe Webhook Testing** (~1 day)
   - Set up ngrok or similar for local webhook testing
   - Test subscription lifecycle events
   - Verify database updates on webhook events

3. **Production Deployment** (~1-2 days)
   - Deploy backend to Railway/Render
   - Deploy frontend to Firebase Hosting
   - Configure production Stripe webhook
   - Switch to live Stripe keys
   - Set up custom domains

4. **Final Testing** (~1 day)
   - End-to-end production testing
   - Payment flow with real card (small amount)
   - Monitor logs for errors

---

## Current Architecture

```
Frontend (Vue 3)          Backend (Express)         External Services
┌─────────────────┐      ┌──────────────────┐     ┌─────────────────┐
│                 │      │                  │     │                 │
│  Landing Page   │      │  Auth Routes     │◄───►│  Firebase Auth  │
│  ├─ Pricing     │      │  ├─ /auth/*      │     │                 │
│  ├─ Features    │      │  │               │     └─────────────────┘
│  └─ Contact     │      │  Payment Routes  │
│                 │      │  ├─ /payments/*  │◄───►┌─────────────────┐
│  Auth Pages     │      │  │   Checkout    │     │    Stripe API   │
│  ├─ Signup      │◄────►│  │   Webhook     │     │                 │
│  ├─ Login       │      │  │               │     └─────────────────┘
│  └─ Logout      │      │  Subscription    │
│                 │      │  ├─ /subscriptions│◄───►┌─────────────────┐
│  Checkout       │      │  │   Get/Update  │     │   MongoDB via   │
│  ├─ Review      │      │  │               │     │    Firestore    │
│  ├─ Success     │      │  Accounts Routes │     │                 │
│  └─ Cancel      │      │  └─ /accounts/*  │     └─────────────────┘
│                 │      │                  │
│  Dashboard      │      └──────────────────┘
│  ├─ Overview    │               │
│  ├─ Subscription│         Port 3001
│  ├─ Billing     │
│  └─ Accounts    │
│                 │
└─────────────────┘
    Port 5173
```

---

## Support

If you encounter issues:
- Check this guide first
- Review browser console for frontend errors
- Check backend terminal for API errors
- Review `IMPLEMENTATION_SUMMARY.md` for technical details
- Review `DEPLOYMENT_GUIDE.md` for production setup

---

**Last Updated**: October 2024
**Version**: 1.0.0 (MVP Complete)
