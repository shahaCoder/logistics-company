import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import driverApplicationRouter from './modules/driverApplication/driverApplication.controller.js';
import authRouter from './modules/auth/auth.controller.js';
import adminApplicationsRouter from './modules/admin-applications/admin-applications.controller.js';
import { publicRouter as requestsPublicRouter, adminRouter as requestsAdminRouter } from './modules/requests/requests.controller.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses (only first proxy)
// This is safer than 'true' and works correctly with rate limiting
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/driver-applications', driverApplicationRouter);

// Requests routes (public endpoints for saving requests)
app.use('/api/requests', requestsPublicRouter);

// Auth routes
app.use('/api/auth', authRouter);

// Admin routes
app.use('/api/admin', adminApplicationsRouter);
// Admin requests routes
app.use('/api/admin/requests', requestsAdminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

