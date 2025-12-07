import { Router, Response } from 'express';
import { z } from 'zod';
import { authRequired, AuthRequest } from '../auth/auth.middleware.js';
import {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  decryptSSN,
  deleteApplication,
} from './admin-applications.service.js';
import { ApplicationStatus, AuditAction } from '@prisma/client';
import { createAuditLog } from '../../services/audit.service.js';

const router = Router();

// All routes require authentication
router.use(authRequired('MANAGER'));

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'APPROVED', 'REJECTED']),
  internalNotes: z.string().optional(),
});

const decryptSSNSchema = z.object({
  password: z.string().min(1),
});

/**
 * GET /api/admin/applications
 * Get all applications with filters
 */
router.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as ApplicationStatus | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getApplications({
      status,
      search,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/applications/:id
 * Get application by ID
 */
router.get('/applications/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const application = await getApplicationById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/applications/:id/status
 * Update application status
 */
router.patch('/applications/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { status, internalNotes } = validation.data;

    const updated = await updateApplicationStatus(
      id,
      status,
      internalNotes,
      req.user.id
    );

    // Audit log
    await createAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: AuditAction.UPDATE_STATUS,
      resourceId: id,
      resourceType: 'DriverApplication',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      details: {
        status,
        hasNotes: !!internalNotes,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/applications/:id/decrypt-ssn
 * Decrypt SSN (SUPER_ADMIN only)
 */
router.post(
  '/applications/:id/decrypt-ssn',
  authRequired('SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const validation = decryptSSNSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Password is required',
        });
      }

      const { password } = validation.data;

      // Decrypt SSN
      const decryptedSSN = await decryptSSN(id, req.user.email, password);

      // Format SSN for display (XXX-XX-XXXX)
      const formatted = decryptedSSN.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');

      // Audit log (critical action)
      await createAuditLog({
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: AuditAction.DECRYPT_SSN,
        resourceId: id,
        resourceType: 'DriverApplication',
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        details: {
          timestamp: new Date().toISOString(),
        },
      });

      res.json({
        success: true,
        ssn: formatted,
      });
    } catch (error) {
      console.error('Decrypt SSN error:', error instanceof Error ? error.message : 'Unknown error');
      res.status(401).json({
        error: 'Invalid password or insufficient permissions',
      });
    }
  }
);

/**
 * DELETE /api/admin/applications/:id
 * Delete application
 */
router.delete('/applications/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await deleteApplication(id);

    // Audit log
    await createAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: AuditAction.DELETE_APPLICATION,
      resourceId: id,
      resourceType: 'DriverApplication',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete application error:', error);
    if (error instanceof Error && error.message === 'Application not found') {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

