import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { TikTokAccount } from '../models/TikTokAccount.js';
import { Payment } from '../models/Payment.js';
import { PRICING_PLANS } from '../config/stripe.js';
import { logger } from '../utils/logger.js';

const router = Router();

// All admin routes require authentication AND admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get(
  '/dashboard',
  asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({
      status: { $in: ['active', 'trialing'] }
    });
    const totalAccounts = await TikTokAccount.countDocuments();
    const pendingAccounts = await TikTokAccount.countDocuments({ status: 'pending' });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email displayName createdAt role');

    // Calculate total revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Revenue last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalAccounts,
        pendingAccounts,
        totalRevenue: (revenueData[0]?.total || 0) / 100, // Convert cents to dollars
        revenueLast30Days: (recentRevenue[0]?.total || 0) / 100,
        recentUsers
      }
    });
  })
);

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
router.get(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await User.countDocuments(query);

    // Get subscription info for each user
    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({
          userId: user._id,
          status: { $in: ['active', 'trialing', 'past_due'] }
        });

        const accountCount = await TikTokAccount.countDocuments({ userId: user._id });

        return {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role || 'user',
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          subscription: subscription ? {
            id: subscription._id,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            deploymentFeePaid: subscription.deploymentFeePaid
          } : null,
          accountCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithSubscriptions,
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
 * GET /api/admin/users/:userId
 * Get detailed user information
 */
router.get(
  '/users/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({ userId: user._id });
    const accounts = await TikTokAccount.find({ userId: user._id });
    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          firebaseUid: user.firebaseUid,
          emailVerified: user.emailVerified,
          role: user.role || 'user',
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        subscription,
        accounts,
        payments: payments.map(p => ({
          id: p._id,
          type: p.type,
          amount: p.amount / 100,
          currency: p.currency,
          status: p.status,
          description: p.description,
          createdAt: p.createdAt
        }))
      }
    });
  })
);

/**
 * PATCH /api/admin/users/:userId
 * Update user (role, status, etc.)
 */
router.patch(
  '/users/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const { role, isActive } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
      logger.info(`Admin changed user ${user.email} role to ${role}`);
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
      logger.info(`Admin ${isActive ? 'activated' : 'deactivated'} user ${user.email}`);
    }

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  })
);

/**
 * GET /api/admin/accounts
 * Get all TikTok accounts across all users
 */
router.get(
  '/accounts',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build query
    const query: any = {};
    if (status === 'disconnection') {
      // Filter for accounts with disconnection requests
      query.disconnectionRequested = true;
    } else if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { accountId: { $regex: search, $options: 'i' } },
        { accountName: { $regex: search, $options: 'i' } },
        { accountHandle: { $regex: search, $options: 'i' } }
      ];
    }

    const accounts = await TikTokAccount.find(query)
      .populate('userId', 'email displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TikTokAccount.countDocuments(query);

    // Get subscription for each account's user
    const accountsWithDetails = await Promise.all(
      accounts.map(async (account) => {
        const subscription = await Subscription.findOne({
          userId: account.userId,
          status: { $in: ['active', 'trialing'] }
        });

        return {
          id: account._id,
          accountId: account.accountId,
          accountName: account.accountName,
          accountHandle: account.accountHandle,
          status: account.status,
          accessUrl: account.accessUrl || '',
          disconnectionRequested: account.disconnectionRequested || false,
          disconnectionRequestedAt: account.disconnectionRequestedAt,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
          user: account.userId ? {
            id: (account.userId as any)._id,
            email: (account.userId as any).email,
            displayName: (account.userId as any).displayName
          } : null,
          subscription: subscription ? {
            plan: subscription.plan,
            status: subscription.status
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: {
        accounts: accountsWithDetails,
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
 * PATCH /api/admin/accounts/:accountId
 * Update TikTok account (assign URL, change status)
 */
router.patch(
  '/accounts/:accountId',
  asyncHandler(async (req: Request, res: Response) => {
    const { status, accessUrl } = req.body;

    const account = await TikTokAccount.findById(req.params.accountId);
    if (!account) {
      throw createError('Account not found', 404);
    }

    let updated = false;

    if (status && ['pending', 'active', 'inactive'].includes(status)) {
      account.status = status;
      updated = true;
    }

    if (accessUrl !== undefined) {
      account.accessUrl = accessUrl;
      updated = true;

      // Auto-update status when URL is assigned
      if (accessUrl && account.status === 'pending') {
        account.status = 'active';
      }
    }

    if (!updated) {
      throw createError('No valid fields to update', 400);
    }

    await account.save();

    logger.info(`Admin updated account ${account.accountId}: status=${status}, url=${accessUrl ? 'assigned' : 'not changed'}`);

    // Return populated account
    const updatedAccount = await TikTokAccount.findById(account._id)
      .populate('userId', 'email displayName');

    res.json({
      success: true,
      data: updatedAccount,
      message: 'Account updated successfully'
    });
  })
);

/**
 * POST /api/admin/accounts/:accountId/disconnect
 * Disconnect tracker instance and delete account
 */
router.post(
  '/accounts/:accountId/disconnect',
  asyncHandler(async (req: Request, res: Response) => {
    const account = await TikTokAccount.findById(req.params.accountId);
    if (!account) {
      throw createError('Account not found', 404);
    }

    // Import TrackerInstance model
    const { TrackerInstance } = await import('../models/TrackerInstance.js');
    const { InstanceData } = await import('../models/InstanceData.js');

    // Delete tracker instance and all related data
    await TrackerInstance.deleteOne({ accountId: account._id });
    await InstanceData.deleteMany({ accountId: account._id });

    // Delete the account
    await account.deleteOne();

    logger.info(`Admin disconnected and deleted account ${account.accountId}`);

    res.json({
      success: true,
      message: 'Account disconnected and deleted successfully'
    });
  })
);

/**
 * DELETE /api/admin/accounts/:accountId
 * Delete a TikTok account
 */
router.delete(
  '/accounts/:accountId',
  asyncHandler(async (req: Request, res: Response) => {
    const account = await TikTokAccount.findById(req.params.accountId);
    if (!account) {
      throw createError('Account not found', 404);
    }

    await account.deleteOne();

    logger.info(`Admin deleted account ${account.accountId}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  })
);

/**
 * GET /api/admin/analytics
 * Get analytics data
 */
router.get(
  '/analytics',
  asyncHandler(async (req: Request, res: Response) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // New users last 30 days
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // New subscriptions last 30 days
    const newSubscriptions = await Subscription.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ['active', 'trialing'] }
    });

    // Revenue last 30 days
    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Subscription breakdown by plan
    const subscriptionBreakdown = await Subscription.aggregate([
      {
        $match: { status: { $in: ['active', 'trialing'] } }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Account status breakdown
    const accountStatusBreakdown = await TikTokAccount.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily revenue for last 30 days
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        newUsersLast30Days: newUsers,
        newSubscriptionsLast30Days: newSubscriptions,
        revenueLast30Days: (recentRevenue[0]?.total || 0) / 100,
        subscriptionBreakdown: subscriptionBreakdown.map(item => ({
          plan: item._id,
          count: item.count,
          planDetails: PRICING_PLANS[item._id]
        })),
        accountStatusBreakdown,
        dailyRevenue: dailyRevenue.map(item => ({
          date: item._id,
          amount: item.amount / 100
        }))
      }
    });
  })
);

/**
 * GET /api/admin/recent-activity
 * Get recent system activity
 */
router.get(
  '/recent-activity',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('email createdAt');

    // Recent subscriptions
    const recentSubscriptions = await Subscription.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Recent payments
    const recentPayments = await Payment.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Recent accounts
    const recentAccounts = await TikTokAccount.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: {
        recentUsers,
        recentSubscriptions,
        recentPayments: recentPayments.map(p => ({
          ...p.toObject(),
          amount: p.amount / 100
        })),
        recentAccounts
      }
    });
  })
);

/**
 * GET /api/admin/instances/:accountId
 * Get tracker instance data for an account
 */
router.get(
  '/instances/:accountId',
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Import TrackerInstance model
    const { TrackerInstance } = await import('../models/TrackerInstance.js');

    // Find instance
    const instance = await TrackerInstance.findOne({ accountId });

    if (!instance) {
      return res.json({
        success: true,
        data: {
          hasInstance: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasInstance: true,
        accountId: instance.accountId,
        apiKey: instance.apiKey,
        instanceUrl: instance.instanceUrl,
        status: instance.status,
        lastAccessedAt: instance.lastAccessedAt
      }
    });
  })
);

/**
 * POST /api/admin/instances/generate-key
 * Generate API key for an account
 */
router.post(
  '/instances/generate-key',
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.body;

    if (!accountId) {
      throw createError('Account ID is required', 400);
    }

    // Import TrackerInstance model
    const { TrackerInstance } = await import('../models/TrackerInstance.js');
    const { TikTokAccount } = await import('../models/TikTokAccount.js');

    // Verify account exists
    const account = await TikTokAccount.findById(accountId);
    if (!account) {
      throw createError('Account not found', 404);
    }

    // Check if instance already exists
    const existingInstance = await TrackerInstance.findOne({ accountId });
    if (existingInstance) {
      throw createError('API key already exists for this account. Use regenerate endpoint.', 400);
    }

    // Generate API key
    const apiKey = (TrackerInstance as any).generateApiKey();

    // Create tracker instance
    const instance = await TrackerInstance.create({
      accountId: account._id,
      userId: account.userId,
      apiKey,
      status: 'active'
    });

    logger.info(`API key generated for account ${accountId}`);

    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        accountId: instance.accountId,
        apiKey: instance.apiKey,
        instanceUrl: instance.instanceUrl,
        status: instance.status
      }
    });
  })
);

/**
 * POST /api/admin/instances/regenerate-key
 * Regenerate API key for an account
 */
router.post(
  '/instances/regenerate-key',
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.body;

    if (!accountId) {
      throw createError('Account ID is required', 400);
    }

    // Import TrackerInstance model
    const { TrackerInstance } = await import('../models/TrackerInstance.js');

    // Find existing instance
    const instance = await TrackerInstance.findOne({ accountId });
    if (!instance) {
      throw createError('No API key found for this account. Use generate endpoint.', 404);
    }

    // Generate new API key
    const newApiKey = (TrackerInstance as any).generateApiKey();

    // Update instance
    instance.apiKey = newApiKey;
    await instance.save();

    logger.info(`API key regenerated for account ${accountId}`);

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      data: {
        accountId: instance.accountId,
        apiKey: instance.apiKey,
        instanceUrl: instance.instanceUrl,
        status: instance.status
      }
    });
  })
);

/**
 * PATCH /api/admin/instances/:accountId/url
 * Update instance URL for an account
 */
router.patch(
  '/instances/:accountId/url',
  asyncHandler(async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const { instanceUrl } = req.body;

    if (!instanceUrl) {
      throw createError('Instance URL is required', 400);
    }

    // Import TrackerInstance model
    const { TrackerInstance } = await import('../models/TrackerInstance.js');

    // Find instance
    const instance = await TrackerInstance.findOne({ accountId });
    if (!instance) {
      throw createError('No instance found for this account', 404);
    }

    // Update URL
    instance.instanceUrl = instanceUrl;
    await instance.save();

    logger.info(`Instance URL updated for account ${accountId}`);

    res.json({
      success: true,
      message: 'Instance URL updated successfully',
      data: {
        accountId: instance.accountId,
        instanceUrl: instance.instanceUrl
      }
    });
  })
);

export default router;
