import { Router, Response } from 'express';
import { z } from 'zod';
import { authRequired, AuthRequest } from '../auth/auth.middleware.js';
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  updateMyProfile,
  deleteAdmin,
} from './admin-users.service.js';
import { createAuditLog } from '../../services/audit.service.js';
import { AuditAction } from '@prisma/client';

const router = Router();

const createAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['MANAGER', 'VIEWER']),
  name: z.string().max(200).nullable().optional(),
});

const updateAdminSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'VIEWER']).optional(),
  password: z.string().min(0).optional(),
  name: z.string().max(200).nullable().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().max(200).nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

/**
 * GET /api/admin/users
 * List all admins. SUPER_ADMIN only.
 */
router.get('/users', authRequired('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await listAdmins();
    res.json({ success: true, users });
  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/users
 * Create a new admin. SUPER_ADMIN only.
 */
router.post('/users', authRequired('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message ?? 'Validation failed',
        details: parsed.error.flatten(),
      });
    }

    const admin = await createAdmin(parsed.data);

    await createAuditLog({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: AuditAction.CREATE_ADMIN,
      resourceId: admin.id,
      resourceType: 'AdminUser',
      details: { email: admin.email, role: admin.role },
      ipAddress: req.ip ?? undefined,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(201).json({ success: true, user: admin });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('already exists')) {
      return res.status(409).json({ error: message });
    }
    // Password validation and other business rules: return 400 with actual message
    if (
      message.includes('Password') ||
      message.includes('Invalid password') ||
      message.includes('Cannot create')
    ) {
      return res.status(400).json({ error: message });
    }
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update an admin (role, password, name). SUPER_ADMIN only.
 */
router.patch('/users/:id', authRequired('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message ?? 'Validation failed',
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    if (data.password === '') {
      delete data.password;
    }

    const admin = await updateAdmin(id, data);

    await createAuditLog({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: AuditAction.UPDATE_ADMIN,
      resourceId: admin.id,
      resourceType: 'AdminUser',
      details: { email: admin.email, role: admin.role },
      ipAddress: req.ip ?? undefined,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.json({ success: true, user: admin });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('not found')) {
      return res.status(404).json({ error: message });
    }
    if (message.includes('Invalid password')) {
      return res.status(400).json({ error: message });
    }
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/me
 * Update current user's profile (name, password). Any authenticated admin.
 */
router.patch('/me', authRequired('ANY'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0]?.message ?? 'Validation failed',
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    if (data.newPassword && !data.currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password' });
    }

    const admin = await updateMyProfile(req.user.id, {
      name: data.name,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    await createAuditLog({
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: AuditAction.UPDATE_PROFILE,
      resourceId: admin.id,
      resourceType: 'AdminUser',
      ipAddress: req.ip ?? undefined,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.json({ success: true, user: admin });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('not found')) {
      return res.status(404).json({ error: message });
    }
    if (message.includes('password') || message.includes('Invalid')) {
      return res.status(400).json({ error: message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete an admin. SUPER_ADMIN only. Cannot delete yourself.
 */
router.delete('/users/:id', authRequired('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await deleteAdmin(id);

    await createAuditLog({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: AuditAction.DELETE_ADMIN,
      resourceId: id,
      resourceType: 'AdminUser',
      ipAddress: req.ip ?? undefined,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('not found')) {
      return res.status(404).json({ error: message });
    }
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
