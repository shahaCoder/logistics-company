import { FreightRequestDTO, ContactRequestDTO } from './requests.types.js';
import prisma from '../../utils/prisma.js';

export async function createFreightRequest(
  dto: FreightRequestDTO,
  meta: { ip?: string; userAgent?: string }
) {
  return await prisma.freightRequest.create({
    data: {
      companyName: dto.companyName || null,
      contactName: dto.contactName,
      email: dto.email,
      phone: dto.phone,
      isBroker: dto.isBroker,
      equipment: dto.equipment || null,
      cargo: dto.cargo || null,
      weight: dto.weight || null,
      pallets: dto.pallets || null,
      pickupAddress: dto.pickupAddress,
      pickupDate: dto.pickupDate || null,
      pickupTime: dto.pickupTime || null,
      deliveryAddress: dto.deliveryAddress || null,
      deliveryDate: dto.deliveryDate || null,
      deliveryTime: dto.deliveryTime || null,
      referenceId: dto.referenceId || null,
      notes: dto.notes || null,
      applicantIp: meta.ip || null,
      userAgent: meta.userAgent || null,
    },
  });
}

export async function createContactRequest(
  dto: ContactRequestDTO,
  meta: { ip?: string; userAgent?: string }
) {
  return await prisma.contactRequest.create({
    data: {
      name: dto.name,
      email: dto.email,
      message: dto.message,
      applicantIp: meta.ip || null,
      userAgent: meta.userAgent || null,
    },
  });
}

export async function getFreightRequests(filters: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { contactName: { contains: filters.search, mode: 'insensitive' } },
      { companyName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.freightRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.freightRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getContactRequests(filters: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { message: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function deleteFreightRequest(id: string) {
  const request = await prisma.freightRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Freight request not found');
  }

  await prisma.freightRequest.delete({
    where: { id },
  });

  return { success: true };
}

export async function deleteContactRequest(id: string) {
  const request = await prisma.contactRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Contact request not found');
  }

  await prisma.contactRequest.delete({
    where: { id },
  });

  return { success: true };
}

