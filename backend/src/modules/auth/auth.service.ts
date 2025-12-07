import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET + '_refresh';
if (!JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET or JWT_SECRET must be set in environment variables');
}

// Type assertion: we've already checked that JWT_SECRET is not undefined
const JWT_SECRET_STRING: string = JWT_SECRET;
const REFRESH_TOKEN_SECRET_STRING: string = REFRESH_TOKEN_SECRET;

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
 * Generate JWT access token (short-lived: 15 minutes)
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET_STRING, {
    expiresIn: '15m', // 15 minutes
  });
}

/**
 * Generate refresh token and store in database
 */
export async function generateRefreshToken(adminId: string): Promise<string> {
  // Generate random token
  const token = crypto.randomBytes(64).toString('hex');
  
  // Store in database with 7 days expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await prisma.refreshToken.create({
    data: {
      token,
      adminId,
      expiresAt,
    },
  });
  
  return token;
}

/**
 * Verify and get refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    // Check if token exists and is not revoked
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    if (!refreshToken || refreshToken.revokedAt) {
      return null;
    }
    
    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      return null;
    }
    
    return {
      id: refreshToken.admin.id,
      email: refreshToken.admin.email,
      role: refreshToken.admin.role,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      token,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Revoke all refresh tokens for an admin
 */
export async function revokeAllRefreshTokens(adminId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      adminId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_STRING);
    // Type guard to ensure decoded has the expected structure
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded && 'role' in decoded) {
      return decoded as JWTPayload;
    }
    return null;
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

