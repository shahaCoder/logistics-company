import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET or JWT_SECRET must be set in environment variables');
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'VIEWER';
}

/**
 * Authenticate admin user by email and password
 */
export async function authenticateAdmin(email: string, password: string): Promise<JWTPayload | null> {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 days
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get admin user by ID
 */
export async function getAdminById(id: string) {
  return prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

