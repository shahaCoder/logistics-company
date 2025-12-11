import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { csrfProtection } from './middleware/csrf.middleware.js';
import driverApplicationRouter from './modules/driverApplication/driverApplication.controller.js';
import authRouter from './modules/auth/auth.controller.js';
import adminApplicationsRouter from './modules/admin-applications/admin-applications.controller.js';
import { publicRouter as requestsPublicRouter, adminRouter as requestsAdminRouter } from './modules/requests/requests.controller.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (can be configured later)
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  : ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

// Логируем конфигурацию CORS при старте
console.log('CORS configuration:', {
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  allowedOrigins,
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS: Blocked origin', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Trust proxy for accurate IP addresses (only first proxy)
// This is safer than 'true' and works correctly with rate limiting
app.set('trust proxy', 1);

// CSRF Protection (after CORS, before routes)
app.use(csrfProtection);

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
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS error',
      message: 'Request origin is not allowed',
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

