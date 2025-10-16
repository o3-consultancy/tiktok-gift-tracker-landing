import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export type InstanceStatus = 'active' | 'inactive';

export interface ITrackerInstance extends Document {
  accountId: Types.ObjectId;
  userId: Types.ObjectId;
  apiKey: string;
  instanceUrl?: string;
  status: InstanceStatus;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trackerInstanceSchema = new Schema<ITrackerInstance>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'TikTokAccount',
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    instanceUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    lastAccessedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Static method to generate API key
trackerInstanceSchema.statics.generateApiKey = function (): string {
  return randomUUID();
};

// Instance method to update last accessed time
trackerInstanceSchema.methods.updateLastAccessed = async function () {
  this.lastAccessedAt = new Date();
  await this.save();
};

// Virtual to check if instance is active
trackerInstanceSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});

export const TrackerInstance = model<ITrackerInstance>('TrackerInstance', trackerInstanceSchema);
