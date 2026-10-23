import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    collaboration: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaboration', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: true }
);

messageSchema.index({ collaboration: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
