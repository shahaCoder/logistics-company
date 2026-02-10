import prisma from '../../utils/prisma.js';
import bcrypt from 'bcrypt';
import { AdminRole } from '@prisma/client';
import { validatePassword } from '../../utils/password-validation.js';

const SALT_ROUNDS = 12;

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  createdAt: Date;
}

/**
 * List all admin users (no password hash). For SUPER_ADMIN only.
 */
export async function listAdmins(): Promise<AdminUserListItem[]> {
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return users;
}

/**
 * Create a new admin. Only SUPER_ADMIN may call. Role must be MANAGER or VIEWER (no new SUPER_ADMIN via API).
 */
export async function createAdmin(data: {
  email: string;
  password: string;
  role: AdminRole;
  name?: string | null;
}): Promise<AdminUserListItem> {
  const email = data.email.toLowerCase().trim();
  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });
  if (existing) {
    throw new Error('An admin with this email already exists');
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error ?? 'Invalid password');
  }

  if (data.role === 'SUPER_ADMIN') {
    throw new Error('Cannot create SUPER_ADMIN via API');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: data.name ?? null,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return admin;
}

/**
 * Update another admin (role, optional new password, optional name). Only SUPER_ADMIN.
 */
export async function updateAdmin(
  adminId: string,
  data: {
    role?: AdminRole;
    password?: string;
    name?: string | null;
  }
): Promise<AdminUserListItem> {
  const existing = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });
  if (!existing) {
    throw new Error('Admin not found');
  }

  const updateData: { role?: AdminRole; passwordHash?: string; name?: string | null } = {};
  if (data.role !== undefined) {
    updateData.role = data.role;
  }
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.password !== undefined && data.password.length > 0) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error ?? 'Invalid password');
    }
    updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const admin = await prisma.adminUser.update({
    where: { id: adminId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return admin;
}

/**
 * Update current user's own profile (name, password). Any authenticated admin.
 */
export async function updateMyProfile(
  adminId: string,
  data: {
    name?: string | null;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<{ id: string; email: string; name: string | null; role: AdminRole }> {
  const existing = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });
  if (!existing) {
    throw new Error('User not found');
  }

  const updateData: { name?: string | null; passwordHash?: string } = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.newPassword !== undefined && data.newPassword.length > 0) {
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error ?? 'Invalid new password');
    }
    if (!data.currentPassword) {
      throw new Error('Current password is required to set a new password');
    }
    const validCurrent = await bcrypt.compare(data.currentPassword, existing.passwordHash);
    if (!validCurrent) {
      throw new Error('Current password is incorrect');
    }
    updateData.passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  }

  const admin = await prisma.adminUser.update({
    where: { id: adminId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
  return admin;
}

/**
 * Delete an admin. Only SUPER_ADMIN. Clears reviewedById on applications, then deletes user (refresh tokens cascade).
 */
export async function deleteAdmin(adminId: string): Promise<void> {
  const existing = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });
  if (!existing) {
    throw new Error('Admin not found');
  }

  await prisma.$transaction([
    prisma.driverApplication.updateMany({
      where: { reviewedById: adminId },
      data: { reviewedById: null },
    }),
    prisma.adminUser.delete({
      where: { id: adminId },
    }),
  ]);
}
