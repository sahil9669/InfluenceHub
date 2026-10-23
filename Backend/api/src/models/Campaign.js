import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    productCategory: { type: String, required: true, trim: true },
    creatorType: { type: String, required: true, trim: true },
    objective: { type: String, required: true, trim: true, maxlength: 500 },
    minFollowers: { type: Number, required: true, min: 0 },
    maxFollowers: { type: Number, required: true, min: 0 },
    budget: { type: Number, min: 0, default: null },
    status: { type: String, enum: ['Draft', 'Open', 'Paused'], default: 'Draft', required: true },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model('Campaign', campaignSchema);
