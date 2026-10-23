import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Set it in Backend/api/.env.');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');
};
