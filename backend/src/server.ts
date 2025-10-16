// MUST be first - loads environment variables
import './env.js';

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import adminRoutes from './routes/admin.routes.js';  // Admin panel routes
import couponRoutes from './routes/coupon.routes.js';  // Coupon routes

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize Firebase Admin SDK
initializeFirebase();

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'https://o3-ttgifts.com',
  'https://www.o3-ttgifts.com',
  'https://admin.o3-ttgifts.com',
  'http://localhost:5173',  // Local frontend dev
  'http://localhost:5174',  // Local admin dev
  'http://localhost:3000'   // Alternative local port
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Raw body for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON body parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'O3 TT Gifts API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/payments', paymentRoutes); // No rate limiter on webhook endpoint
app.use('/api/subscriptions', apiLimiter, subscriptionRoutes);
app.use('/api/accounts', apiLimiter, accountsRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);  // Admin panel API
app.use('/api/coupons', apiLimiter, couponRoutes);  // Coupon API

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;
