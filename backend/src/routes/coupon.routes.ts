import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/coupons/validate
 * Validate a coupon code (public endpoint for checkout)
 */
router.post(
  '/validate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const userId = req.user!.userId;

    if (!code) {
      throw createError('Coupon code is required', 400);
    }

    // Find coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      throw createError('Invalid coupon code', 404);
    }

    // Check if expired
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw createError('This coupon has expired', 400);
    }

    // Check usage limit
    if (coupon.usageCount >= coupon.usageLimit) {
      throw createError('This coupon has reached its usage limit', 400);
    }

    // Check if user already used this coupon
    if (coupon.hasBeenUsedBy(userId)) {
      throw createError('You have already used this coupon', 400);
    }

    res.json({
      success: true,
      data: {
        valid: true,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discount: {
          waivesDeploymentFee: true,
          deploymentFeeAmount: 500 // $500
        }
      },
      message: 'Coupon is valid'
    });
  })
);

/**
 * Admin Routes
 * All routes below require admin authentication
 */
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/coupons
 * Get all coupons with pagination
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string; // 'active', 'inactive', 'expired'

    // Build query
    const query: any = {};

    if (status === 'active') {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.expiresAt = { $lte: new Date() };
    }

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'email displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Coupon.countDocuments(query);

    // Format response with computed fields
    const formattedCoupons = coupons.map(coupon => ({
      id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      remainingUses: coupon.usageLimit - coupon.usageCount,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
      isExpired: coupon.expiresAt ? coupon.expiresAt < new Date() : false,
      isValid: (coupon as any).isValid,
      createdBy: coupon.createdBy,
      createdAt: coupon.createdAt
    }));

    res.json({
      success: true,
      data: {
        coupons: formattedCoupons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

/**
 * POST /api/coupons
 * Create a new coupon
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, description, usageLimit, expiresAt } = req.body;
    const adminUserId = (req as any).adminUser._id;

    if (!code) {
      throw createError('Coupon code is required', 400);
    }

    if (!usageLimit || usageLimit < 1) {
      throw createError('Usage limit must be at least 1', 400);
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw createError('A coupon with this code already exists', 400);
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      usageLimit,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: adminUserId,
      discountType: 'waive_deployment_fee'
    });

    await coupon.populate('createdBy', 'email displayName');

    logger.info(`Admin created coupon: ${coupon.code}, limit: ${coupon.usageLimit}`);

    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully'
    });
  })
);

/**
 * GET /api/coupons/stats/summary
 * Get coupon usage statistics
 * NOTE: This route must be before /:couponId to avoid matching 'stats' as an ID
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    const totalUsage = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalRedemptions: { $sum: '$usageCount' }
        }
      }
    ]);

    const redemptions = totalUsage[0]?.totalRedemptions || 0;
    const totalFeesWaived = redemptions * 500; // $500 per coupon

    res.json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        totalRedemptions: redemptions,
        totalFeesWaived
      }
    });
  })
);

/**
 * GET /api/coupons/:couponId
 * Get coupon details with usage history
 */
router.get(
  '/:couponId',
  asyncHandler(async (req: Request, res: Response) => {
    const coupon = await Coupon.findById(req.params.couponId)
      .populate('createdBy', 'email displayName')
      .populate('usageHistory.userId', 'email displayName');

    if (!coupon) {
      throw createError('Coupon not found', 404);
    }

    // Format usage history
    const usageHistory = await Promise.all(
      coupon.usageHistory.map(async (usage) => {
        const user = usage.userId as any;
        return {
          userId: user._id,
          userEmail: user.email,
          userDisplayName: user.displayName,
          usedAt: usage.usedAt,
          subscriptionId: usage.subscriptionId
        };
      })
    );

    res.json({
      success: true,
      data: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        remainingUses: coupon.usageLimit - coupon.usageCount,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
        isExpired: coupon.expiresAt ? coupon.expiresAt < new Date() : false,
        isValid: (coupon as any).isValid,
        createdBy: coupon.createdBy,
        createdAt: coupon.createdAt,
        usageHistory
      }
    });
  })
);

/**
 * PATCH /api/coupons/:couponId
 * Update coupon (activate/deactivate, update limits)
 */
router.patch(
  '/:couponId',
  asyncHandler(async (req: Request, res: Response) => {
    const { isActive, usageLimit, description, expiresAt } = req.body;

    const coupon = await Coupon.findById(req.params.couponId);
    if (!coupon) {
      throw createError('Coupon not found', 404);
    }

    if (typeof isActive === 'boolean') {
      coupon.isActive = isActive;
      logger.info(`Admin ${isActive ? 'activated' : 'deactivated'} coupon: ${coupon.code}`);
    }

    if (usageLimit !== undefined) {
      if (usageLimit < coupon.usageCount) {
        throw createError(
          `Usage limit cannot be less than current usage count (${coupon.usageCount})`,
          400
        );
      }
      coupon.usageLimit = usageLimit;
    }

    if (description !== undefined) {
      coupon.description = description;
    }

    if (expiresAt !== undefined) {
      coupon.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    }

    await coupon.save();
    await coupon.populate('createdBy', 'email displayName');

    res.json({
      success: true,
      data: coupon,
      message: 'Coupon updated successfully'
    });
  })
);

/**
 * DELETE /api/coupons/:couponId
 * Delete a coupon (only if not used)
 */
router.delete(
  '/:couponId',
  asyncHandler(async (req: Request, res: Response) => {
    const coupon = await Coupon.findById(req.params.couponId);
    if (!coupon) {
      throw createError('Coupon not found', 404);
    }

    if (coupon.usageCount > 0) {
      throw createError(
        'Cannot delete coupon that has been used. Deactivate it instead.',
        400
      );
    }

    await coupon.deleteOne();
    logger.info(`Admin deleted unused coupon: ${coupon.code}`);

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  })
);

export default router;
