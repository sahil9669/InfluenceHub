import mongoose from 'mongoose';

const brandProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    organizationName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    website: { type: String, trim: true, maxlength: 200, default: '' },
    bio: { type: String, trim: true, maxlength: 400, default: '' },
  },
  { timestamps: true }
);

export const BrandProfile = mongoose.model('BrandProfile', brandProfileSchema);

