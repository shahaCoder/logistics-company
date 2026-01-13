import { Router, Response } from 'express';
import { z } from 'zod';
import { authRequired, AuthRequest } from '../auth/auth.middleware.js';
import {
  getAllTrucks,
  getTruckById,
  createTruck,
  resetOilChange,
  updateTruck,
  deleteTruck,
} from './trucks.service.js';
import { createAuditLog } from '../../services/audit.service.js';
import { AuditAction } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authRequired('MANAGER'));

const createTruckSchema = z.object({
  name: z.string().min(1, 'Truck name is required'),
  samsaraVehicleId: z.string().nullable().optional(),
  currentMiles: z.number().int().min(0).optional(),
  expiresInMiles: z.number().int().min(0).optional(),
  oilChangeIntervalMiles: z.number().int().min(1000).max(50000).optional(),
});

const updateTruckSchema = z.object({
  name: z.string().min(1).optional(),
  currentMiles: z.number().int().min(0).optional(),
  oilChangeIntervalMiles: z.number().int().min(1000).max(50000).optional(),
});

/**
 * GET /api/admin/trucks
 * Get all trucks
 */
router.get('/trucks', async (req: AuthRequest, res: Response) => {
  try {
    const trucks = await getAllTrucks();
    res.json(trucks);
  } catch (error) {
    console.error('Get trucks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/trucks/:id
 * Get truck by ID
 */
router.get('/trucks/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const truck = await getTruckById(id);

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    res.json(truck);
  } catch (error) {
    console.error('Get truck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/trucks
 * Create a new truck
 */
router.post('/trucks', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = createTruckSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const truck = await createTruck(validation.data);

    // Audit log
    await createAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: AuditAction.VIEW_APPLICATION, // Using existing action, can add TRUCK_CREATE later
      resourceId: truck.id,
      resourceType: 'Truck',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      details: {
        name: truck.name,
      },
    });

    res.status(201).json(truck);
  } catch (error) {
    console.error('Create truck error:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(400).json({ error: 'Truck with this name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/trucks/:id/oil/reset
 * Reset oil change (set lastOilChangeMiles to currentMiles and lastOilChangeAt to now)
 */
router.post('/trucks/:id/oil/reset', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
      await resetOilChange(id);
      const truck = await getTruckById(id);

      if (!truck) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      // Audit log
      await createAuditLog({
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: AuditAction.UPDATE_STATUS,
        resourceId: id,
        resourceType: 'Truck',
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        details: {
          action: 'reset_oil_change',
          newLastOilChangeMiles: truck.lastOilChangeMiles,
        },
      });

      res.json(truck);
    } catch (error) {
      if (error instanceof Error && error.message === 'Truck not found') {
        return res.status(404).json({ error: 'Truck not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Reset oil change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/trucks/:id/reset-oil-change (DEPRECATED - kept for compatibility)
 * Reset oil change - uses same logic as POST endpoint
 */
router.patch('/trucks/:id/reset-oil-change', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
      await resetOilChange(id);
      const truck = await getTruckById(id);

      if (!truck) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      // Audit log
      await createAuditLog({
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: AuditAction.UPDATE_STATUS,
        resourceId: id,
        resourceType: 'Truck',
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        details: {
          action: 'reset_oil_change',
          newLastOilChangeMiles: truck.lastOilChangeMiles,
        },
      });

      res.json(truck);
    } catch (error) {
      if (error instanceof Error && error.message === 'Truck not found') {
        return res.status(404).json({ error: 'Truck not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Reset oil change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/trucks/:id
 * Update truck
 */
router.patch('/trucks/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const validation = updateTruckSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const truck = await updateTruck(id, validation.data);

    res.json(truck);
  } catch (error) {
    console.error('Update truck error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/trucks/:id
 * Delete truck
 */
router.delete('/trucks/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await deleteTruck(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete truck error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
