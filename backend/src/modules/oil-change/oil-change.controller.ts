import { Router, Response } from 'express';
import { authRequired, AuthRequest } from '../auth/auth.middleware.js';
import { proxyGetRequest, proxyPostRequest } from './oil-change.service.js';

const router = Router();

// All routes require authentication (admin only)
router.use(authRequired('MANAGER'));

/**
 * GET /api/admin/oil-change/list
 * Get list of all trucks with their oil change status
 */
router.get('/oil-change/list', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyGetRequest('oil-change/list');
    res.json(data);
  } catch (error) {
    console.error('Error getting oil change list:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/admin/oil-change/:truckName
 * Get oil change status for a specific truck
 */
router.get('/oil-change/:truckName', async (req: AuthRequest, res: Response) => {
  try {
    const { truckName } = req.params;
    const encodedName = encodeURIComponent(truckName);
    const data = await proxyGetRequest(`oil-change/${encodedName}`);
    res.json(data);
  } catch (error) {
    console.error('Error getting oil change status:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    if (message.includes('not found') || message.includes('404')) {
      return res.status(404).json({ error: message });
    }
    
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/admin/oil-change/reset
 * Reset oil change for a truck
 */
router.post('/oil-change/reset', async (req: AuthRequest, res: Response) => {
  try {
    const { truckName, mileage } = req.body;
    
    if (!truckName) {
      return res.status(400).json({ error: 'truckName is required' });
    }

    const body: { truckName: string; mileage?: number } = { truckName };
    if (mileage !== null && mileage !== undefined) {
      body.mileage = mileage;
    }

    const data = await proxyPostRequest('oil-change/reset', body);
    res.json(data);
  } catch (error) {
    console.error('Error resetting oil change:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/admin/oil-change/trucks
 * Get list of all trucks (for dropdown)
 */
router.get('/oil-change/trucks', async (req: AuthRequest, res: Response) => {
  try {
    const data = await proxyGetRequest('trucks');
    res.json(data);
  } catch (error) {
    console.error('Error getting trucks list:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export default router;
