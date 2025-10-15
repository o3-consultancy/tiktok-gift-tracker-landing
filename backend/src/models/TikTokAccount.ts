import mongoose, { Document, Schema, Types } from 'mongoose';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface ITikTokAccount extends Document {
  userId: Types.ObjectId;
  accountName: string;
  accountHandle?: string;
  accountId?: string;
  status: AccountStatus;
  giftGroupsCount: number;
  lastSyncedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const tiktokAccountSchema = new Schema<ITikTokAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountHandle: {
      type: String,
      trim: true
    },
    accountId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    giftGroupsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastSyncedAt: {
      type: Date
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
tiktokAccountSchema.index({ userId: 1, status: 1 });
tiktokAccountSchema.index({ userId: 1, createdAt: -1 });

// Virtual for checking if account is active
tiktokAccountSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});

export const TikTokAccount = mongoose.model<ITikTokAccount>('TikTokAccount', tiktokAccountSchema);
