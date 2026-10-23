import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['In progress', 'Completed', 'Cancelled'], default: 'In progress', required: true },
  },
  { timestamps: true }
);

export const Collaboration = mongoose.model('Collaboration', collaborationSchema);
