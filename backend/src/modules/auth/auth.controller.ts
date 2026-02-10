import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  authenticateAdmin, 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  getAdminById 
} from './auth.service.js';
import { authRequired, AuthRequest } from './auth.middleware.js';
import { createAuditLog } from '../../services/audit.service.js';
import { AuditAction } from '@prisma/client';

const router = Router();

// Rate limiter for login (5 attempts per 15 minutes)
// Note: trust proxy is set in index.ts, rate limiter will use req.ip automatically
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from rate limit count
  skipSuccessfulRequests: false,
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate
    const payload = await authenticateAdmin(email, password);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate access token (15 minutes) and refresh token (7 days)
    const accessToken = generateToken(payload);
    const refreshToken = await generateRefreshToken(payload.id);

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Audit log
    await createAuditLog({
      adminId: payload.id,
      adminEmail: payload.email,
      action: AuditAction.LOGIN,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (clear cookies and revoke refresh token)
 */
router.post('/logout', authRequired('ANY'), async (req: AuthRequest, res: Response) => {
  try {
    // Revoke refresh token if present
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    
    // Revoke all refresh tokens for this user (optional, for security)
    if (req.user?.id) {
      await revokeAllRefreshTokens(req.user.id);
    }

    // Audit log
    if (req.user) {
      await createAuditLog({
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: AuditAction.LOGOUT,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      });
    }

    // Clear cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authRequired('ANY'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const admin = await getAdminById(req.user.id);
    if (!admin) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name ?? undefined,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateToken(payload);

    // Set new access token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

