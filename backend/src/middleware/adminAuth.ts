import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { createError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to check if authenticated user is an admin
 * Must be used after authenticate middleware
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Get user from database
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.role !== 'admin') {
      logger.warn(`Non-admin user ${user.email} attempted to access admin endpoint`);
      throw createError('Admin access required', 403);
    }

    // Attach user to request for use in routes
    (req as any).adminUser = user;

    next();
  } catch (error) {
    next(error);
  }
};
