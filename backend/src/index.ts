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
import trucksRouter from './modules/trucks/trucks.controller.js';
import oilChangeRouter from './modules/oil-change/oil-change.controller.js';
import { startSamsaraSyncJob } from './services/samsara-sync.service.js';

// Load environment variables
dotenv.config();

// Проверяем критичные переменные вручную (более мягкая валидация, не блокируем запуск)
const criticalVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

const missingCritical = Object.entries(criticalVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingCritical.length > 0) {
  console.error('❌ Missing critical environment variables:', missingCritical.join(', '));
  console.error('⚠️  Server will start but authentication and file uploads may not work.');
} else {
  // Проверяем длину JWT_SECRET если он установлен
  const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.warn('⚠️  JWT_SECRET is too short (less than 32 characters). This may cause security issues.');
  }
  
  // Пытаемся валидировать через Zod (не критично, не блокируем запуск)
  // Используем динамический import чтобы не блокировать запуск
  import('./config/env.js')
    .then(({ validateEnv }) => {
      try {
        validateEnv();
        console.log('✅ All environment variables are valid');
      } catch (error) {
        // Игнорируем ошибки валидации - критичные переменные уже проверены
        console.warn('⚠️  Some environment variables may not meet validation requirements, but critical ones are set.');
      }
    })
    .catch(() => {
      // Игнорируем ошибки импорта - модуль может быть недоступен
      console.warn('⚠️  Could not load env validation module, but critical variables are set.');
    });
}

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware - Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (can be configured later)
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const baseAllowedOrigins =
  process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    : ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

// Always allow api.glco.us in production for admin/API tools
const extraOrigins: string[] = [];
if (process.env.NODE_ENV === 'production') {
  extraOrigins.push('https://api.glco.us');
}

const allowedOrigins = Array.from(new Set([...baseAllowedOrigins, ...extraOrigins]));

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
// Admin trucks routes
app.use('/api/admin', trucksRouter);
// Admin oil-change routes
app.use('/api/admin', oilChangeRouter);

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
  // TODO: Temporarily disabled Samsara sync due to API error (400: Invalid stat type(s): odometer)
  // startSamsaraSyncJob();
});