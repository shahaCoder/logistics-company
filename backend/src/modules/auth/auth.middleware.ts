import { Request, Response, NextFunction } from 'express';
import { verifyToken, getAdminById } from './auth.service.js';

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
      const token = req.cookies?.token || req.cookies?.adminToken;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify token
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
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

