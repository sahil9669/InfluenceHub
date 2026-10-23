
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

const parseAllowedOrigins = () => {
  const configuredOrigins = process.env.CLIENT_ORIGINS;

  if (!configuredOrigins) {
    return ['http://localhost:5173'];
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(cors({
    origin: parseAllowedOrigins(),
    credentials: true
  }));

  app.use(express.json({ limit: '1mb' }));  
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
      status: databaseConnected ? 'ok' : 'degraded',
      service: 'influencehub-api',
      database: databaseConnected ? 'connected' : 'disconnected'
    });
  });

  // Authentication routes
  app.use('/api/auth', authRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/collaborations', collaborationRoutes);
  app.use('/api/recommendations', recommendationRoutes);

  // Handle unknown API routes
  app.use('/api', (req, res) => {
    res.status(404).json({
      error: 'API route not found.'
    });
  });

  // Error handling
  app.use((error, req, res, next) => {
    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      'body' in error
    ) {
      return res.status(400).json({
        error: 'Request body must contain valid JSON.'
      });
    }

    console.error('Unhandled API error:', error);

    return res.status(500).json({
      error: 'An unexpected server error occurred.'
    });
  });

  return app;
};


