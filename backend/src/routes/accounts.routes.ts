import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { PRICING_PLANS } from '../config/stripe.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { TikTokAccount } from '../models/TikTokAccount.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/accounts
 * Get all TikTok accounts for the current user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const accounts = await TikTokAccount.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: accounts
    });
  })
);

/**
 * POST /api/accounts
 * Create a new TikTok account
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountName, accountHandle, accountId } = req.body;

    if (!accountName) {
      throw createError('Account name is required', 400);
    }

    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    // Check subscription and limits
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      throw createError('Active subscription required to add accounts', 403);
    }

    const planDetails = PRICING_PLANS[subscription.plan];
    const accountCount = await TikTokAccount.countDocuments({
      userId: user._id,
      status: 'active'
    });

    if (accountCount >= planDetails.accounts) {
      throw createError(
        `Account limit reached. Your ${planDetails.name} plan allows ${planDetails.accounts} accounts. Please upgrade your plan.`,
        403
      );
    }

    // Create new account
    const account = await TikTokAccount.create({
      userId: user._id,
      accountName,
      accountHandle,
      accountId,
      status: 'active'
    });

    logger.info(`New TikTok account created for user ${user.email}: ${accountName}`);

    res.status(201).json({
      success: true,
      message: 'TikTok account added successfully',
      data: account
    });
  })
);

/**
 * GET /api/accounts/:id
 * Get a specific TikTok account
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const account = await TikTokAccount.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!account) {
      throw createError('Account not found', 404);
    }

    res.json({
      success: true,
      data: account
    });
  })
);

/**
 * PUT /api/accounts/:id
 * Update a TikTok account
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { accountName, accountHandle, accountId, status } = req.body;

    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const account = await TikTokAccount.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!account) {
      throw createError('Account not found', 404);
    }

    // Update fields
    if (accountName !== undefined) account.accountName = accountName;
    if (accountHandle !== undefined) account.accountHandle = accountHandle;
    if (accountId !== undefined) account.accountId = accountId;
    if (status !== undefined) account.status = status;

    await account.save();

    logger.info(`TikTok account updated: ${account.accountName}`);

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account
    });
  })
);

/**
 * DELETE /api/accounts/:id
 * Delete a TikTok account
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const account = await TikTokAccount.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!account) {
      throw createError('Account not found', 404);
    }

    // Soft delete - mark as inactive
    account.status = 'inactive';
    await account.save();

    logger.info(`TikTok account deleted: ${account.accountName}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  })
);

/**
 * POST /api/accounts/:id/sync
 * Trigger sync for a TikTok account
 */
router.post(
  '/:id/sync',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const account = await TikTokAccount.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!account) {
      throw createError('Account not found', 404);
    }

    // Update last synced timestamp
    account.lastSyncedAt = new Date();
    await account.save();

    // TODO: Implement actual TikTok API sync logic here

    logger.info(`TikTok account sync triggered: ${account.accountName}`);

    res.json({
      success: true,
      message: 'Account sync initiated',
      data: {
        lastSyncedAt: account.lastSyncedAt
      }
    });
  })
);

export default router;
