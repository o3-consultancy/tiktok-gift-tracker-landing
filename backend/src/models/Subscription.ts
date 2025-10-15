import mongoose, { Document, Schema, Types } from 'mongoose';
import { PlanType } from '../config/stripe.js';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  deploymentFeePaid: boolean;
  deploymentFeePaymentId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true
    },
    stripeSubscriptionId: {
      type: String,
      index: true
    },
    plan: {
      type: String,
      enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'],
      default: 'incomplete'
    },
    currentPeriodStart: {
      type: Date
    },
    currentPeriodEnd: {
      type: Date
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    canceledAt: {
      type: Date
    },
    trialStart: {
      type: Date
    },
    trialEnd: {
      type: Date
    },
    deploymentFeePaid: {
      type: Boolean,
      default: false
    },
    deploymentFeePaymentId: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1, stripeSubscriptionId: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
