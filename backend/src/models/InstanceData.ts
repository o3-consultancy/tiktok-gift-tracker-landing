import { Schema, model, Document, Types } from 'mongoose';

export type DataType = 'gift-groups' | 'config' | 'analytics';

export interface IInstanceData extends Document {
  accountId: Types.ObjectId;
  dataType: DataType;
  data: any; // Flexible schema for different data types
  createdAt: Date;
  updatedAt: Date;
}

const instanceDataSchema = new Schema<IInstanceData>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'TikTokAccount',
      required: true,
      index: true
    },
    dataType: {
      type: String,
      enum: ['gift-groups', 'config', 'analytics'],
      required: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index for unique dataType per account
instanceDataSchema.index({ accountId: 1, dataType: 1 }, { unique: true });

// Static method to get or create data for an account
instanceDataSchema.statics.findOrCreate = async function (
  accountId: Types.ObjectId,
  dataType: DataType,
  defaultData: any = {}
) {
  let data = await this.findOne({ accountId, dataType });

  if (!data) {
    data = await this.create({
      accountId,
      dataType,
      data: defaultData
    });
  }

  return data;
};

// Static method to upsert data
instanceDataSchema.statics.upsertData = async function (
  accountId: Types.ObjectId,
  dataType: DataType,
  newData: any
) {
  return await this.findOneAndUpdate(
    { accountId, dataType },
    { $set: { data: newData } },
    { upsert: true, new: true }
  );
};

export const InstanceData = model<IInstanceData>('InstanceData', instanceDataSchema);
