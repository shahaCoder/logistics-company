import { Request, Response, NextFunction } from 'express';

/**
 * CSRF Protection Middleware
 * 
 * Since we're using SameSite=Strict cookies, we have basic CSRF protection.
 * This middleware adds additional checks:
 * 1. Verify Origin header matches allowed origins
 * 2. Verify Referer header (if present) matches allowed origins
 * 
 * Note: For production, consider implementing proper CSRF tokens if needed.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Only check POST, PUT, PATCH, DELETE requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for health check and public endpoints that don't use cookies
  const publicPaths = ['/health', '/api/driver-applications', '/api/requests'];
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  // For public paths that use cookies (like driver-applications), we still check
  // But we're more lenient since they're public endpoints
  
  const origin = req.get('origin');
  const referer = req.get('referer');
  
  // Get allowed origins from environment
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    : ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

  // Логируем для отладки в production
  if (process.env.NODE_ENV === 'production') {
    console.log('CSRF check:', {
      origin,
      referer,
      allowedOrigins,
      path: req.path,
    });
  }

  // Check Origin header
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const originHost = `${originUrl.protocol}//${originUrl.host}`;
      
      if (!allowedOrigins.includes(originHost)) {
        console.warn('CSRF: Invalid origin', { originHost, allowedOrigins });
        return res.status(403).json({ 
          error: 'CSRF protection: Invalid origin',
          message: 'Request origin is not allowed',
        });
      }
    } catch (urlError) {
      console.error('CSRF: Invalid origin URL format', { origin, error: urlError });
      return res.status(403).json({ 
        error: 'CSRF protection: Invalid origin format',
      });
    }
  }

  // Check Referer header (if present)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererHost = `${refererUrl.protocol}//${refererUrl.host}`;
      
      if (!allowedOrigins.includes(refererHost)) {
        return res.status(403).json({ error: 'CSRF protection: Invalid referer' });
      }
    } catch (error) {
      // Invalid referer URL, but we don't fail if Origin is valid
      if (!origin) {
        return res.status(403).json({ error: 'CSRF protection: Invalid referer' });
      }
    }
  }

  // For admin endpoints (which use cookies), require either Origin or Referer
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
    if (!origin && !referer) {
      return res.status(403).json({ error: 'CSRF protection: Missing origin/referer' });
    }
  }

  next();
}

