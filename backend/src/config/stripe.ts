import '../env.js';
import Stripe from 'stripe';
import { logger } from '../utils/logger.js';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

if (stripeKey) {
  logger.info('Stripe SDK initialized successfully');
} else {
  logger.warn('Stripe SDK initialized without API key - payment features will not work');
}

// Pricing plan configurations
export const PRICING_PLANS = {
  STARTER: {
    name: 'Starter',
    monthlyPrice: 3000, // $30.00 in cents
    accounts: 1,
    giftGroups: 5,
    features: [
      'Real-time Analytics',
      'Basic Overlay Styles',
      'Email Support',
      '7-day Data Retention'
    ]
  },
  PROFESSIONAL: {
    name: 'Professional',
    monthlyPrice: 8000, // $80.00 in cents
    accounts: 3,
    giftGroups: 15,
    features: [
      'Advanced Analytics',
      'All Overlay Styles',
      'Chat Monitoring',
      'Priority Support',
      '30-day Data Retention',
      'Custom Reports'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: 23000, // $230.00 in cents
    accounts: 20,
    giftGroups: 50,
    features: [
      'AI-Powered Analytics',
      'Custom Overlay Designs',
      'Team Collaboration',
      '24/7 Phone Support',
      'Unlimited Data Retention',
      'API Access',
      'White-label Options'
    ]
  }
} as const;

export const DEPLOYMENT_FEE = 50000; // $500.00 in cents

export type PlanType = keyof typeof PRICING_PLANS;

export const isPlanType = (plan: string): plan is PlanType => {
  return plan in PRICING_PLANS;
};
