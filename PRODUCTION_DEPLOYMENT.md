# Production Deployment Guide - o3-ttgifts.com

**VM Details:**
- Provider: Google Cloud Platform (GCP)
- Instance Type: e2-medium
- OS: Debian 12 (Bookworm) - 6.1.148-1
- Public IP: 34.18.58.50
- Domain: o3-ttgifts.com

**Architecture:**
- Frontend: Vue.js (built static files) served by Nginx
- Backend: Node.js/Express API on port 3001 (PM2 managed)
- Reverse Proxy: Nginx on ports 80/443
- SSL: Let's Encrypt (Certbot)
- Process Manager: PM2

---

## Step 1: Initial SSH Connection and Setup

### 1.1 Connect to VM
```bash
# From your local machine
ssh your-username@34.18.58.50

# Or if using GCP console, use their SSH button
```

### 1.2 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

---

## Step 2: Install Required Software

### 2.1 Install Node.js 20.x (LTS)
```bash
# Install Node.js 20.x from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

### 2.2 Install Nginx
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 2.3 Install Git
```bash
sudo apt install -y git
```

### 2.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Set PM2 to start on boot
pm2 startup systemd
# Run the command it outputs (starts with: sudo env PATH=...)
```

### 2.5 Install Certbot (SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 3: Set Up Application Directory

### 3.1 Create Application User (Optional but Recommended)
```bash
# Create a dedicated user for the application
sudo adduser --disabled-password --gecos "" o3app

# Add to sudo group (if needed)
sudo usermod -aG sudo o3app

# Switch to the new user
sudo su - o3app
```

### 3.2 Clone Repository
```bash
# If using application user
cd ~
git clone https://github.com/o3-consultancy/tiktok-gift-tracker-landing.git
cd tiktok-gift-tracker-landing

# Or if staying as your current user
cd /var/www
sudo mkdir -p o3-ttgifts
sudo chown $USER:$USER o3-ttgifts
cd o3-ttgifts
git clone https://github.com/o3-consultancy/tiktok-gift-tracker-landing.git .
```

---

## Step 4: Configure Backend

### 4.1 Install Backend Dependencies
```bash
cd backend

# Install ALL dependencies (including devDependencies like tsx)
# We need tsx to run TypeScript directly in production
npm install

# Note: We use npm install (not --production) because we need tsx
# which is in devDependencies. Alternative would be to build with tsc.
```

### 4.2 Create Production Environment File
```bash
nano .env
```

**Add the following (replace with your actual values):**
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://o3-tt-db-connect:YOUR_PASSWORD@YOUR_FIRESTORE_HOST:443/o3-tt-db?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false

# JWT Configuration
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_CHANGE_THIS_NOW
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@o3-ttgifts.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_STRIPE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

# Frontend URL
FRONTEND_URL=https://o3-ttgifts.com

# Session Configuration
SESSION_SECRET=YOUR_SESSION_SECRET_KEY_CHANGE_THIS_NOW

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Save and exit** (Ctrl+X, Y, Enter)

### 4.3 Add Firebase Service Account Key
```bash
# Create the Firebase service account JSON file
nano o3-tt-subscription-firebase-adminsdk.json
```

**Paste your Firebase service account JSON**, then save and exit.

### 4.4 Update Backend env.ts if needed
The backend should automatically load the `.env` file. Verify:
```bash
cat src/env.ts
```

### 4.5 Test Backend
```bash
# Test run (tsx will compile TypeScript on-the-fly)
npm run dev

# You should see logs like:
# 🚀 Server running on http://0.0.0.0:3001
# 📝 Environment: production
# 🔗 Frontend URL: https://o3-ttgifts.com

# Press Ctrl+C to stop after confirming it works
```

---

## Step 5: Configure Frontend

### 5.1 Create Frontend Environment File
```bash
cd ..  # Back to project root
nano .env
```

**Add the following:**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=o3-tt-subscription.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=o3-tt-subscription
VITE_FIREBASE_STORAGE_BUCKET=o3-tt-subscription.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# API Configuration
VITE_API_URL=https://o3-ttgifts.com/api
```

**Save and exit**

### 5.2 Install Frontend Dependencies and Build
```bash
npm install
npm run build
```

This creates a `dist/` directory with optimized production files.

---

## Step 6: Configure Nginx

### 6.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/o3-ttgifts
```

**Add the following configuration:**
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name o3-ttgifts.com www.o3-ttgifts.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name o3-ttgifts.com www.o3-ttgifts.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/o3-ttgifts.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/o3-ttgifts.com/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Root directory for frontend
    root /var/www/o3-ttgifts/tiktok-gift-tracker-landing/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Reverse Proxy
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # File upload size limit (match backend MAX_FILE_SIZE)
    client_max_body_size 10M;
}
```

**Save and exit**

### 6.2 Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/o3-ttgifts /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Create directory for Let's Encrypt
sudo mkdir -p /var/www/certbot

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Step 7: Set Up SSL with Let's Encrypt

### 7.1 Obtain SSL Certificate
```bash
# Request certificate for both domain and www subdomain
sudo certbot --nginx -d o3-ttgifts.com -d www.o3-ttgifts.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to share email (optional)
# - Choose option 2: Redirect HTTP to HTTPS
```

### 7.2 Verify SSL
Visit https://o3-ttgifts.com in your browser - you should see a secure connection.

### 7.3 Set Up Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot should automatically set up a cron job
# Verify with:
sudo systemctl status certbot.timer
```

---

## Step 8: Start Backend with PM2

### 8.1 Start Backend Application
```bash
cd /var/www/o3-ttgifts/tiktok-gift-tracker-landing/backend

# Start with PM2 using tsx interpreter
pm2 start src/server.ts --name o3-backend --interpreter ./node_modules/.bin/tsx

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot (if not done earlier)
pm2 startup
# Run the command it outputs (it will show something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-username --hp /home/your-username
```

### 8.2 Monitor Backend
```bash
# Check status
pm2 status

# View logs
pm2 logs o3-backend

# Monitor in real-time
pm2 monit
```

---

## Step 9: Configure Stripe Webhooks

### 9.1 Create Production Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://o3-ttgifts.com/api/payments/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update your backend `.env` file:
   ```bash
   cd /var/www/o3-ttgifts/tiktok-gift-tracker-landing/backend
   nano .env
   # Update STRIPE_WEBHOOK_SECRET with the new value
   ```
8. Restart backend:
   ```bash
   pm2 restart o3-backend
   ```

---

## Step 10: Final Verification

### 10.1 Test Frontend
Visit https://o3-ttgifts.com
- ✅ Should load without errors
- ✅ Should redirect HTTP to HTTPS
- ✅ Should show valid SSL certificate

### 10.2 Test Backend API
```bash
curl https://o3-ttgifts.com/api/health
# Should return: {"success":true,"message":"O3 TT Gifts API is running",...}
```

### 10.3 Test Full Flow
1. Sign up for an account
2. Select a pricing plan
3. Complete checkout with Stripe test card
4. Verify webhook receives events (check backend logs: `pm2 logs o3-backend`)
5. Check dashboard shows subscription
6. Add a TikTok account
7. Test upgrade plan functionality

---

## Step 11: Monitoring and Maintenance

### 11.1 Check Application Logs
```bash
# Backend logs
pm2 logs o3-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### 11.2 Monitor System Resources
```bash
# Check CPU and memory
htop

# Check disk space
df -h

# Check PM2 processes
pm2 monit
```

### 11.3 Set Up Automatic Backups (Recommended)
```bash
# Create backup script
sudo nano /usr/local/bin/backup-o3.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/o3-app-$DATE.tar.gz /var/www/o3-ttgifts/tiktok-gift-tracker-landing

# Keep only last 7 days of backups
find $BACKUP_DIR -name "o3-app-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-o3.sh
```

Add to crontab:
```bash
sudo crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-o3.sh >> /var/log/backup-o3.log 2>&1
```

---

## Step 12: Security Hardening

### 12.1 Configure Firewall
```bash
# Install ufw
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 12.2 Update Stripe to Production Keys
Make sure you're using **live** Stripe keys in:
- Backend `.env`: `STRIPE_SECRET_KEY=sk_live_...`
- Frontend `.env`: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`

Rebuild frontend after changing:
```bash
cd /var/www/o3-ttgifts/tiktok-gift-tracker-landing
npm run build
```

Restart backend:
```bash
pm2 restart o3-backend
```

---

## Troubleshooting

### Issue: Nginx won't start
```bash
# Check configuration
sudo nginx -t

# Check logs
sudo journalctl -u nginx -n 50
```

### Issue: Backend not responding
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs o3-backend --lines 100

# Restart backend
pm2 restart o3-backend
```

### Issue: SSL certificate issues
```bash
# Renew certificates manually
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: Stripe webhooks not working
```bash
# Check webhook endpoint is accessible
curl https://o3-ttgifts.com/api/payments/webhook

# Check backend logs for webhook events
pm2 logs o3-backend | grep webhook

# Verify webhook secret in .env matches Stripe dashboard
```

### Issue: Database connection errors
```bash
# Check MongoDB URI is correct
cd /var/www/o3-ttgifts/tiktok-gift-tracker-landing/backend
cat .env | grep MONGODB_URI

# Check backend logs for database errors
pm2 logs o3-backend | grep -i mongo
```

---

## Quick Commands Reference

```bash
# Restart backend
pm2 restart o3-backend

# View backend logs
pm2 logs o3-backend

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# Rebuild frontend
cd /var/www/o3-ttgifts/tiktok-gift-tracker-landing
npm run build

# Update application from Git
git pull origin main
npm install  # Frontend dependencies
cd backend && npm install  # Backend dependencies
cd .. && npm run build  # Rebuild frontend
pm2 restart o3-backend  # Restart backend

# Check SSL certificate expiry
sudo certbot certificates
```

---

## Post-Deployment Checklist

- [ ] Domain resolves to correct IP (34.18.58.50)
- [ ] HTTPS working with valid certificate
- [ ] HTTP redirects to HTTPS
- [ ] Frontend loads correctly at https://o3-ttgifts.com
- [ ] Backend API responding at https://o3-ttgifts.com/api/health
- [ ] User signup/login working
- [ ] Stripe checkout flow working
- [ ] Stripe webhooks receiving events
- [ ] Dashboard showing subscription status
- [ ] Settings page upgrade/cancel working
- [ ] TikTok accounts can be added
- [ ] PM2 set to restart on reboot
- [ ] SSL auto-renewal configured
- [ ] Firewall configured
- [ ] Backups scheduled (optional)
- [ ] Production Stripe keys configured

---

**Deployment completed successfully! 🚀**

Your SaaS platform should now be live at https://o3-ttgifts.com
