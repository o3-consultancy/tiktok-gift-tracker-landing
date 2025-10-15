import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        userId: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using Firebase JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(token);

    // Find or create user in database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        lastLogin: new Date()
      });

      logger.info(`New user created: ${user.email}`);
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
      return;
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email!,
      userId: user._id.toString()
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await verifyFirebaseToken(token);

      const user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (user && user.isActive) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email!,
          userId: user._id.toString()
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without authentication
    logger.debug('Optional authentication failed, continuing without auth');
    next();
  }
};
