# Admin Panel Troubleshooting Guide

## Issue: "Access Denied - You do not have administrative privileges"

### Quick Fix (Most Common)

**The user MUST log out and log back in after being made an admin.**

Firebase tokens are cached and don't automatically refresh when the database is updated.

**Steps:**
1. Log out from the admin panel
2. Close all browser tabs
3. Clear browser cache (or use Incognito/Private mode)
4. Log in again

---

## Diagnostic Steps

### Step 1: Verify User Has Admin Role in Database

**On your VM:**

```bash
cd /var/www/o3-ttgifts/backend

# Check if user exists and their role
tsx src/scripts/check-user.ts o3shx.inc@gmail.com
```

**Expected output:**
```
✅ User found!

📋 User Details:
   Role: admin  ← Should say "admin", not "user"
```

**If role is NOT "admin":**
```bash
# Make the user an admin
tsx src/scripts/make-admin.ts o3shx.inc@gmail.com
```

---

### Step 2: Test Backend API Directly

**Test if backend recognizes you as admin:**

1. Get your Firebase token:
   - Open admin.o3-ttgifts.com
   - Open browser DevTools (F12)
   - Go to Console tab
   - Run this:
   ```javascript
   firebase.auth().currentUser.getIdToken().then(token => console.log(token))
   ```
   - Copy the long token string

2. Test API with curl:
   ```bash
   # Replace YOUR_TOKEN with the token from step 1
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://o3-ttgifts.com/api/admin/dashboard
   ```

**Expected responses:**
- ✅ **Success**: JSON with `{"success":true,"data":{...}}`
- ❌ **403 Error**: `{"success":false,"message":"Admin access required"}`
  - User is not admin in database
- ❌ **401 Error**: `{"success":false,"message":"No authentication token provided"}`
  - Token is invalid or expired

---

### Step 3: Check Backend Logs

**On your VM:**

```bash
pm2 logs o3-backend --lines 50
```

**Look for:**
- ✅ Admin access attempts
- ❌ `Non-admin user o3shx.inc@gmail.com attempted to access admin endpoint`
- ❌ `User not found`

---

## Common Issues & Solutions

### Issue 1: User Role Not Set in Database

**Symptom**: Backend logs show "Non-admin user attempted to access admin endpoint"

**Solution:**
```bash
cd /var/www/o3-ttgifts/backend
tsx src/scripts/make-admin.ts o3shx.inc@gmail.com

# Then user MUST log out and log back in
```

---

### Issue 2: User Not Found in Database

**Symptom**: Backend logs show "User not found"

**Possible causes:**
1. User signed up but wasn't created in database
2. Email mismatch (typo)

**Solution:**
```bash
# Check exact email in database
tsx src/scripts/check-user.ts o3shx.inc@gmail.com

# If not found, sign up first via the main app (o3-ttgifts.com)
# Then make admin
```

---

### Issue 3: Firebase Token Not Refreshed

**Symptom**: User is admin in database, but still gets "Access Denied"

**Solution - Force Token Refresh:**

**Method 1: Log Out & Back In (Easiest)**
1. Click "Logout" in admin panel
2. Close all browser tabs
3. Re-open admin panel
4. Log in again

**Method 2: Clear Browser Cache**
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Refresh page
5. Log in again

**Method 3: Use Incognito/Private Mode**
- This forces a fresh login without cached tokens

---

### Issue 4: Wrong API URL

**Symptom**: Admin panel can't connect to backend

**Check admin panel .env:**
```bash
cat /var/www/admin-o3-ttgifts/.env
```

Should be:
```
VITE_API_URL=https://o3-ttgifts.com/api
```

**NOT** `http://localhost:3001/api`

If wrong:
```bash
nano /var/www/admin-o3-ttgifts/.env
# Fix the URL
# Then rebuild admin panel
```

---

### Issue 5: Database Schema Not Updated

**Symptom**: Role field doesn't exist in database

**Solution - Update Database Schema:**

The User model has a default value, but old users might not have the field.

**Fix:**
```bash
cd /var/www/o3-ttgifts/backend

# Run migration script to add role field to all users
tsx src/scripts/migrate-add-roles.ts
```

**Or update manually in MongoDB:**
```javascript
// In MongoDB shell or Firestore console
db.users.updateMany(
  { role: { $exists: false } },
  { $set: { role: 'user' } }
)

// Then make specific user admin
db.users.updateOne(
  { email: 'o3shx.inc@gmail.com' },
  { $set: { role: 'admin' } }
)
```

---

## Manual Database Update (Alternative)

If scripts don't work, update manually:

### Via Firestore Console (if using Firestore)
1. Go to Firebase Console
2. Firestore Database
3. Find `users` collection
4. Find user by email: `o3shx.inc@gmail.com`
5. Edit document
6. Add field: `role` = `admin`
7. Save

### Via MongoDB Compass (if using MongoDB directly)
1. Connect to your MongoDB instance
2. Select database (probably `o3-tt-db`)
3. Select `users` collection
4. Find user: `{ "email": "o3shx.inc@gmail.com" }`
5. Edit document
6. Add/modify field: `"role": "admin"`
7. Save

**After manual update: User MUST log out and log back in**

---

## Testing Checklist

After making changes, test in order:

- [ ] User exists in database (check-user script)
- [ ] User role is "admin" (check-user script)
- [ ] Backend API responds to `/api/admin/dashboard` with your token
- [ ] Backend logs show successful admin access (no warnings)
- [ ] User logged out completely from admin panel
- [ ] Browser cache cleared (or using Incognito)
- [ ] User logged back in to admin panel
- [ ] Admin panel loads dashboard successfully

---

## Still Not Working?

### Enable Debug Logging

**Temporarily add logging to admin middleware:**

Edit `/var/www/o3-ttgifts/backend/src/middleware/adminAuth.ts`:

```typescript
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== ADMIN CHECK DEBUG ===');
    console.log('req.user:', req.user);

    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    console.log('Found user:', user?.email, 'Role:', user?.role);

    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.role !== 'admin') {
      console.log('❌ ROLE CHECK FAILED - Expected: admin, Got:', user.role);
      logger.warn(`Non-admin user ${user.email} attempted to access admin endpoint`);
      throw createError('Admin access required', 403);
    }

    console.log('✅ ADMIN CHECK PASSED');
    // ... rest of code
  }
};
```

Restart backend:
```bash
pm2 restart o3-backend
```

Try logging in again and check logs:
```bash
pm2 logs o3-backend
```

---

## Contact Support

If still having issues, provide:
1. Output of `tsx src/scripts/check-user.ts o3shx.inc@gmail.com`
2. Backend logs: `pm2 logs o3-backend --lines 100`
3. Browser console errors (F12 → Console tab)
4. Screenshot of error message
