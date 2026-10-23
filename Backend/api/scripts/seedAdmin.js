import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in Backend/api/.env first.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  await connectDatabase();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== 'Admin') {
      throw new Error('That email already belongs to a non-admin account. Choose a different ADMIN_EMAIL.');
    }
    console.log('The private Admin account already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: 'Admin' });
  console.log(`Private Admin account created for ${email}.`);
};

seedAdmin()
  .catch((error) => {
    console.error('Could not seed Admin account:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
