import mongoose from 'mongoose';
import { creatorTypes } from '../config/marketplace.js';



const creatorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    creatorName: { type: String, trim: true, maxlength: 100, default: '' },
    influencerType: { type: String, enum: creatorTypes, required: true },
    instagramUsername: {
      type: String,
      trim: true,
      lowercase: true,
      validate: (value) => value === '' || /^[a-z0-9._]{1,30}$/.test(value),
      default: '',
    },
    website: { type: String, trim: true, maxlength: 200, default: '' },
    bio: { type: String, trim: true, maxlength: 400, default: '' },
    instagramFollowerCount: { type: Number, min: 0, default: null },
    instagramFollowerCountUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);


