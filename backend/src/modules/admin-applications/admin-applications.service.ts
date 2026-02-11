import { ApplicationStatus } from '@prisma/client';
import { decryptSensitive } from '../../utils/crypto.js';
import { authenticateAdmin } from '../auth/auth.service.js';
import prisma from '../../utils/prisma.js';
import { getCached, invalidateCache, deleteCache } from '../../services/cache.service.js';

/**
 * Get all applications with filters and pagination
 * Results are cached for 30 seconds to reduce database load
 */
export async function getApplications(filters: {
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  
  // Создаем ключ кэша на основе всех фильтров
  const cacheKey = `applications:${filters.status || 'all'}:${filters.search || ''}:${page}:${limit}`;
  
  return getCached(
    cacheKey,
    async () => {
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        // Search only by first name or last name
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [applications, total] = await Promise.all([
        prisma.driverApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            reviewedAt: true,
            ssnLast4: true,
            reviewedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.driverApplication.count({ where }),
      ]);

      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    30 // TTL 30 секунд
  );
}

/**
 * Get application by ID with all relations
 * Results are cached for 60 seconds
 */
export async function getApplicationById(id: string) {
  const cacheKey = `application:${id}`;
  
  return getCached(
    cacheKey,
    async () => {
      return prisma.driverApplication.findUnique({
        where: { id },
        include: {
          previousAddresses: true,
          license: true,
          medicalCard: true,
          employmentRecords: true,
          legalConsents: true,
          reviewedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    },
    60 // TTL 60 секунд
  );
}

/**
 * Update application status
 * Invalidates cache after update
 */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  internalNotes: string | undefined,
  reviewedById: string
) {
  await prisma.driverApplication.update({
    where: { id },
    data: {
      status,
      internalNotes,
      reviewedById,
      reviewedAt: new Date(),
    },
  });

  // Инвалидируем кэш для этого приложения и списков
  await Promise.all([
    deleteCache(`application:${id}`),
    invalidateCache('applications:*'),
  ]);

  return prisma.driverApplication.findUnique({
    where: { id },
    include: {
      reviewedBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Decrypt SSN (only for SUPER_ADMIN with password confirmation)
 */
export async function decryptSSN(
  applicationId: string,
  adminEmail: string,
  adminPassword: string
): Promise<string> {
  // Verify admin password
  const admin = await authenticateAdmin(adminEmail, adminPassword);
  if (!admin || admin.role !== 'SUPER_ADMIN') {
    throw new Error('Invalid credentials or insufficient permissions');
  }

  // Get application
  const application = await prisma.driverApplication.findUnique({
    where: { id: applicationId },
    select: { ssnEncrypted: true },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  // Decrypt SSN
  try {
    const decrypted = decryptSensitive(application.ssnEncrypted);
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt SSN');
  }
}

/**
 * Delete application by ID
 * This will cascade delete all related records (addresses, license, medical card, etc.)
 * Invalidates cache after deletion
 */
export async function deleteApplication(id: string) {
  const application = await prisma.driverApplication.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  // Delete application (cascade will handle related records)
  await prisma.driverApplication.delete({
    where: { id },
  });

  // Инвалидируем кэш для этого приложения и списков
  await Promise.all([
    deleteCache(`application:${id}`),
    invalidateCache('applications:*'),
  ]);

  return { success: true };
}

