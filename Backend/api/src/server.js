import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT || 5000);
const app = createApp();
let server;
let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Closing API server...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.disconnect();
  process.exitCode = 0;
};

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET in Backend/api/.env to a random value at least 32 characters long.');
  }

  await connectDatabase();
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(port, () => resolve(listener));
    listener.once('error', reject);
  });
  console.log(`InfluenceHub API listening on port ${port}.`);
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

start().catch(async (error) => {
  console.error('Could not start InfluenceHub API:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
