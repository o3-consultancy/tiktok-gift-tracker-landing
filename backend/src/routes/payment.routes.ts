import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { stripe, PRICING_PLANS, DEPLOYMENT_FEE, isPlanType, PlanType } from '../config/stripe.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/payments/create-checkout-session
 * Create Stripe checkout session for deployment fee + subscription
 */
router.post(
  '/create-checkout-session',
  authenticate,
  paymentLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { plan, accountCount } = req.body;

    // Validate plan
    if (!plan || !isPlanType(plan)) {
      throw createError('Invalid plan selected', 400);
    }

    const selectedPlan = PRICING_PLANS[plan as PlanType];

    // Get user
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription) {
      throw createError('You already have an active subscription', 400);
    }

    // Create or get Stripe customer
    let stripeCustomerId: string;

    const existingCustomer = await Subscription.findOne({ userId: user._id });
    if (existingCustomer?.stripeCustomerId) {
      stripeCustomerId = existingCustomer.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || undefined,
        metadata: {
          userId: user._id.toString(),
          firebaseUid: user.firebaseUid
        }
      });
      stripeCustomerId = customer.id;
    }

    // Calculate additional account cost if needed
    const baseAccountCount = selectedPlan.accounts;
    const additionalAccounts = Math.max(0, (accountCount || baseAccountCount) - baseAccountCount);
    const additionalAccountCost = additionalAccounts * 1000; // $10 per additional account

    const totalMonthlyPrice = selectedPlan.monthlyPrice + additionalAccountCost;

    // Create checkout session with deployment fee + subscription
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        // One-time deployment fee
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'One-Time Deployment Fee',
              description: 'Setup and deployment of your O3 TT Gifts instance'
            },
            unit_amount: DEPLOYMENT_FEE
          },
          quantity: 1
        },
        // Monthly subscription
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPlan.name} Plan`,
              description: `${baseAccountCount + additionalAccounts} TikTok accounts, ${selectedPlan.giftGroups} gift groups`
            },
            unit_amount: totalMonthlyPrice,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan: plan,
          accountCount: (baseAccountCount + additionalAccounts).toString()
        }
      },
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: {
        userId: user._id.toString(),
        plan: plan,
        deploymentFee: 'true'
      }
    });

    // Create pending subscription record
    await Subscription.create({
      userId: user._id,
      stripeCustomerId: stripeCustomerId,
      plan: plan,
      status: 'incomplete',
      deploymentFeePaid: false
    });

    logger.info(`Checkout session created for user ${user.email}: ${session.id}`);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  })
);

/**
 * GET /api/payments/history
 * Get user's payment history
 */
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: payments
    });
  })
);

/**
 * GET /api/payments/invoices
 * Get user's Stripe invoices
 */
router.get(
  '/invoices',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      throw createError('User not found', 404);
    }

    const subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription?.stripeCustomerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 50
    });

    res.json({
      success: true,
      data: invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        created: new Date(invoice.created * 1000)
      }))
    });
  })
);

/**
 * POST /api/payments/webhook
 * Stripe webhook handler
 */
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    // In development mode without proper webhook secret, skip signature verification
    if (process.env.NODE_ENV === 'development' && (!webhookSecret || webhookSecret === 'whsec_your_webhook_secret')) {
      logger.warn('⚠️  DEVELOPMENT MODE: Webhook signature verification skipped');
      logger.warn('⚠️  To use signature verification, set up Stripe CLI or configure STRIPE_WEBHOOK_SECRET');

      // Parse the raw body as JSON for development
      event = JSON.parse(req.body.toString());
      logger.info(`📥 Received webhook event (dev mode): ${event.type}`);
    } else {
      // Production mode - require signature verification
      if (!sig) {
        throw createError('No signature provided', 400);
      }

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret!
        );
      } catch (err: any) {
        logger.error(`Webhook signature verification failed: ${err.message}`);
        throw createError(`Webhook Error: ${err.message}`, 400);
      }

      logger.info(`✅ Verified webhook event: ${event.type}`);
    }

    logger.info(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        logger.debug(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  })
);

// Webhook handler functions

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info(`🎯 handleCheckoutSessionCompleted called`);
  logger.info(`Session ID: ${session.id}`);
  logger.info(`Customer: ${session.customer}`);
  logger.info(`Subscription: ${session.subscription}`);
  logger.info(`Metadata: ${JSON.stringify(session.metadata)}`);

  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    logger.error('❌ Missing metadata in checkout session');
    logger.error(`userId: ${userId}, plan: ${plan}`);
    return;
  }

  logger.info(`Looking for subscription with userId: ${userId}, stripeCustomerId: ${session.customer}`);

  const subscription = await Subscription.findOne({
    userId: userId,
    stripeCustomerId: session.customer as string
  });

  if (!subscription) {
    logger.error(`❌ No subscription found for userId: ${userId}, customer: ${session.customer}`);
    return;
  }

  logger.info(`✅ Found subscription: ${subscription._id}`);

  subscription.stripeSubscriptionId = session.subscription as string;
  subscription.status = 'active';
  subscription.deploymentFeePaid = true;
  await subscription.save();

  logger.info(`✅ Subscription activated for user ${userId}`);
  logger.info(`Updated subscription status to: ${subscription.status}`);

  // Record deployment fee payment
  const payment = await Payment.create({
    userId: userId,
    subscriptionId: subscription._id,
    stripePaymentIntentId: session.payment_intent as string,
    type: 'deployment_fee',
    amount: DEPLOYMENT_FEE,
    currency: 'usd',
    status: 'succeeded',
    description: 'One-time deployment fee'
  });

  logger.info(`✅ Payment record created: ${payment._id}`);
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = stripeSubscription.status as any;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    if (stripeSubscription.canceled_at) {
      subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
    }

    await subscription.save();
    logger.info(`Subscription updated: ${stripeSubscription.id}`);
  }
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();
    logger.info(`Subscription canceled: ${stripeSubscription.id}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const subscription = await Subscription.findOne({
    stripeCustomerId: customerId
  });

  if (subscription) {
    await Payment.create({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      stripeInvoiceId: invoice.id,
      type: 'subscription',
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: `Monthly subscription payment - ${subscription.plan}`
    });

    logger.info(`Invoice payment succeeded: ${invoice.id}`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const subscription = await Subscription.findOne({
    stripeCustomerId: customerId
  });

  if (subscription) {
    await Payment.create({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      stripeInvoiceId: invoice.id,
      type: 'subscription',
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: `Failed payment - ${subscription.plan}`
    });

    logger.warn(`Invoice payment failed: ${invoice.id}`);
  }
}

export default router;
