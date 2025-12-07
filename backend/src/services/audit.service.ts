import { PrismaClient, AuditAction } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  adminId?: string;
  adminEmail?: string;
  action: AuditAction;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: data.adminId,
        adminEmail: data.adminEmail,
        action: data.action,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should not break the application
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  adminId?: string;
  action?: AuditAction;
  resourceId?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.action) where.action = filters.action;
  if (filters.resourceId) where.resourceId = filters.resourceId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

