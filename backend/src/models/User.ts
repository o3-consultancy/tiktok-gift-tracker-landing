import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: 'user' | 'admin';  // Added for admin panel
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    displayName: {
      type: String,
      trim: true
    },
    photoURL: {
      type: String
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'  // All existing users remain 'user'
    },
    lastLogin: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for quick lookups
userSchema.index({ firebaseUid: 1, email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
