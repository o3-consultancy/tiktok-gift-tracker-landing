import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { stripe, PRICING_PLANS, PlanType, isPlanType } from '../config/stripe.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { TikTokAccount } from '../models/TikTokAccount.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/subscriptions/current
 * Get current user's subscription details
 */
router.get(
  '/current',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'trialing', 'past_due'] }
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription found'
      });
    }

    // Get account usage
    const accountCount = await TikTokAccount.countDocuments({
      userId: user._id,
      status: 'active'
    });

    const planDetails = PRICING_PLANS[subscription.plan];

    res.json({
      success: true,
      data: {
        id: subscription._id,
        plan: subscription.plan,
        planDetails: {
          name: planDetails.name,
          monthlyPrice: planDetails.monthlyPrice / 100,
          accounts: planDetails.accounts,
          giftGroups: planDetails.giftGroups,
          features: planDetails.features
        },
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        deploymentFeePaid: subscription.deploymentFeePaid,
        usage: {
          accountsUsed: accountCount,
          accountsLimit: planDetails.accounts
        }
      }
    });
  })
);

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription at period end
 */
router.post(
  '/cancel',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw createError('No active subscription found', 404);
    }

    // Cancel subscription at period end in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    // Update local subscription
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    logger.info(`Subscription canceled at period end for user ${user.email}`);

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      data: {
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      }
    });
  })
);

/**
 * POST /api/subscriptions/reactivate
 * Reactivate a canceled subscription
 */
router.post(
  '/reactivate',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      cancelAtPeriodEnd: true
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw createError('No cancelable subscription found', 404);
    }

    // Reactivate subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update local subscription
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    logger.info(`Subscription reactivated for user ${user.email}`);

    res.json({
      success: true,
      message: 'Subscription has been reactivated'
    });
  })
);

/**
 * POST /api/subscriptions/change-plan
 * Change subscription plan
 */
router.post(
  '/change-plan',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { newPlan } = req.body;

    if (!newPlan || !isPlanType(newPlan)) {
      throw createError('Invalid plan selected', 400);
    }

    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw createError('No active subscription found', 404);
    }

    if (subscription.plan === newPlan) {
      throw createError('You are already on this plan', 400);
    }

    // Get current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const newPlanDetails = PRICING_PLANS[newPlan as PlanType];

    // Create a product and price for the new plan
    const product = await stripe.products.create({
      name: `O3 TT Gifts - ${newPlanDetails.name} Plan`,
      metadata: {
        accounts: newPlanDetails.accounts.toString(),
        giftGroups: newPlanDetails.giftGroups.toString()
      }
    });

    const newPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: newPlanDetails.monthlyPrice,
      recurring: {
        interval: 'month'
      },
      product: product.id
    });

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPrice.id
          }
        ],
        proration_behavior: 'always_invoice' // Charge/credit immediately
      }
    );

    // Update local subscription
    subscription.plan = newPlan as PlanType;
    subscription.currentPeriodStart = new Date(updatedSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000);
    await subscription.save();

    logger.info(`Plan changed from ${subscription.plan} to ${newPlan} for user ${user.email}`);

    res.json({
      success: true,
      message: `Plan changed to ${newPlanDetails.name}`,
      data: {
        newPlan: newPlan,
        planDetails: newPlanDetails
      }
    });
  })
);

/**
 * GET /api/subscriptions/plans
 * Get all available pricing plans
 */
router.get(
  '/plans',
  asyncHandler(async (req: Request, res: Response) => {
    const plans = Object.entries(PRICING_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice / 100,
      accounts: plan.accounts,
      giftGroups: plan.giftGroups,
      features: plan.features
    }));

    res.json({
      success: true,
      data: plans
    });
  })
);

/**
 * GET /api/subscriptions/usage
 * Get current usage statistics
 */
router.get(
  '/usage',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      throw createError('No active subscription found', 404);
    }

    const planDetails = PRICING_PLANS[subscription.plan];

    // Get account count
    const accountCount = await TikTokAccount.countDocuments({
      userId: user._id,
      status: 'active'
    });

    // Get gift groups count
    const giftGroupsCount = await TikTokAccount.aggregate([
      { $match: { userId: user._id, status: 'active' } },
      { $group: { _id: null, totalGiftGroups: { $sum: '$giftGroupsCount' } } }
    ]);

    const totalGiftGroups = giftGroupsCount[0]?.totalGiftGroups || 0;

    res.json({
      success: true,
      data: {
        accounts: {
          used: accountCount,
          limit: planDetails.accounts,
          percentage: (accountCount / planDetails.accounts) * 100
        },
        giftGroups: {
          used: totalGiftGroups,
          limit: planDetails.giftGroups,
          percentage: (totalGiftGroups / planDetails.giftGroups) * 100
        }
      }
    });
  })
);

export default router;
