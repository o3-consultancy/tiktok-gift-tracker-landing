import mongoose, { Document, Schema, Types } from 'mongoose';

export type PaymentType = 'deployment_fee' | 'subscription' | 'refund';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  type: PaymentType;
  amount: number; // in cents
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true
    },
    stripePaymentIntentId: {
      type: String,
      index: true
    },
    stripeInvoiceId: {
      type: String,
      index: true
    },
    type: {
      type: String,
      enum: ['deployment_fee', 'subscription', 'refund'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'usd',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending'
    },
    description: {
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

// Indexes for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, type: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
