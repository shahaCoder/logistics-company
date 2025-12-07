import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyRefreshToken, generateToken, getAdminById } from './auth.service.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'MANAGER' | 'VIEWER';
  };
}

/**
 * Middleware to require authentication
 * @param requiredRole - Required role or 'ANY' for any authenticated user
 */
export function authRequired(requiredRole: 'SUPER_ADMIN' | 'MANAGER' | 'VIEWER' | 'ANY' = 'ANY') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get token from cookie
      let token = req.cookies?.token || req.cookies?.adminToken;
      let payload = token ? verifyToken(token) : null;

      // If access token is invalid/expired, try to refresh using refresh token
      if (!payload) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          const refreshPayload = await verifyRefreshToken(refreshToken);
          if (refreshPayload) {
            // Generate new access token
            const newAccessToken = generateToken(refreshPayload);
            payload = refreshPayload;
            
            // Set new access token cookie
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('token', newAccessToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'strict',
              path: '/',
              maxAge: 15 * 60 * 1000, // 15 minutes
            });
          }
        }
      }

      if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify user still exists
      const admin = await getAdminById(payload.id);
      if (!admin) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Check role if required
      if (requiredRole !== 'ANY') {
        const roleHierarchy: Record<string, number> = {
          VIEWER: 1,
          MANAGER: 2,
          SUPER_ADMIN: 3,
        };

        const userRoleLevel = roleHierarchy[admin.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      // Attach user to request
      req.user = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

