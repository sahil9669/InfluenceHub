import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorProfile', required: true },
    message: { type: String, required: true, trim: true, minlength: 2, maxlength: 1000 },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending', required: true },
  },
  { timestamps: true }
);

applicationSchema.index({ campaign: 1, creator: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
