import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICouponUsage {
  userId: Types.ObjectId;
  usedAt: Date;
  subscriptionId?: Types.ObjectId;
}

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: 'waive_deployment_fee';
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdBy: Types.ObjectId; // Admin who created it
  usageHistory: ICouponUsage[];
  createdAt: Date;
  updatedAt: Date;
}

const couponUsageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  }
}, { _id: false });

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['waive_deployment_fee'],
      default: 'waive_deployment_fee'
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usageHistory: [couponUsageSchema]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ createdAt: -1 });

// Virtual for checking if coupon is still valid
couponSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.usageCount >= this.usageLimit) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
});

// Method to check if user has already used this coupon
couponSchema.methods.hasBeenUsedBy = function (userId: string): boolean {
  return this.usageHistory.some(
    (usage) => usage.userId.toString() === userId.toString()
  );
};

// Method to record coupon usage
couponSchema.methods.recordUsage = async function (
  userId: Types.ObjectId,
  subscriptionId?: Types.ObjectId
): Promise<void> {
  this.usageCount += 1;
  this.usageHistory.push({
    userId,
    usedAt: new Date(),
    subscriptionId
  });
  await this.save();
};

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
