import { Router, Response, Request } from 'express';
import { authRequired, AuthRequest } from '../auth/auth.middleware.js';
import {
  createFreightRequest,
  createContactRequest,
  getFreightRequests,
  getContactRequests,
  deleteFreightRequest,
  deleteContactRequest,
} from './requests.service.js';
import { FreightRequestSchema, ContactRequestSchema } from './requests.types.js';

// Public router for creating requests
const publicRouter = Router();

/**
 * POST /api/requests/freight
 * Create freight request (public, but also saves to DB)
 */
publicRouter.post('/freight', async (req: Request, res: Response) => {
  try {
    const validation = FreightRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const meta = {
      ip: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('user-agent') || undefined,
    };

    await createFreightRequest(validation.data, meta);
    res.json({ success: true });
  } catch (error) {
    console.error('Create freight request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/requests/contact
 * Create contact request (public, but also saves to DB)
 */
publicRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const validation = ContactRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const meta = {
      ip: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('user-agent') || undefined,
    };

    await createContactRequest(validation.data, meta);
    res.json({ success: true });
  } catch (error) {
    console.error('Create contact request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin router for viewing/managing requests
const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(authRequired('MANAGER'));

/**
 * GET /api/admin/requests/freight
 * Get all freight requests (admin only)
 */
adminRouter.get('/freight', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await getFreightRequests({ page, limit, search });
    res.json(result);
  } catch (error) {
    console.error('Get freight requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/requests/contact
 * Get all contact requests (admin only)
 */
adminRouter.get('/contact', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await getContactRequests({ page, limit, search });
    res.json(result);
  } catch (error) {
    console.error('Get contact requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/requests/freight/:id
 * Delete freight request (admin only)
 */
adminRouter.delete('/freight/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await deleteFreightRequest(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete freight request error:', error);
    if (error instanceof Error && error.message === 'Freight request not found') {
      return res.status(404).json({ error: 'Freight request not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/requests/contact/:id
 * Delete contact request (admin only)
 */
adminRouter.delete('/contact/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await deleteContactRequest(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete contact request error:', error);
    if (error instanceof Error && error.message === 'Contact request not found') {
      return res.status(404).json({ error: 'Contact request not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { publicRouter, adminRouter };

