import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const { displayName, photoURL } = req.body;

    const user = await User.findOne({ firebaseUid: req.user!.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile
    if (displayName !== undefined) {
      user.displayName = displayName;
    }
    if (photoURL !== undefined) {
      user.photoURL = photoURL;
    }

    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });
  })
);

/**
 * POST /api/auth/verify-token
 * Verify Firebase token (for frontend to validate tokens)
 */
router.post(
  '/verify-token',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    try {
      // The authenticate middleware already handles token verification
      // This is just a convenience endpoint
      const authHeader = `Bearer ${token}`;
      req.headers.authorization = authHeader;

      // Manually call authenticate middleware
      await new Promise((resolve, reject) => {
        authenticate(req, res, (err?: any) => {
          if (err) reject(err);
          else resolve(true);
        });
      });

      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          uid: req.user!.uid,
          email: req.user!.email
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  })
);

/**
 * DELETE /api/auth/account
 * Delete user account
 */
router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    logger.info(`User account deactivated: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  })
);

export default router;
