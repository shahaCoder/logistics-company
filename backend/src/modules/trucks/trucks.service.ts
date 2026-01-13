import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TruckWithStatus {
  id: string;
  name: string;
  samsaraVehicleId?: string | null;
  currentMiles: number;
  currentMilesUpdatedAt?: Date | null;
  lastOilChangeMiles?: number | null;
  lastOilChangeAt?: Date | null;
  oilChangeIntervalMiles: number;
  milesSinceLastOilChange: number;
  milesUntilNextOilChange: number;
  status: 'Good' | 'Soon' | 'Overdue';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate oil change status
 * - Good if milesUntilNextOilChange > 5000
 * - Soon if 1..5000
 * - Overdue if 0
 */
function calculateStatus(milesUntilNext: number): 'Good' | 'Soon' | 'Overdue' {
  if (milesUntilNext > 5000) {
    return 'Good';
  }
  if (milesUntilNext > 0) {
    return 'Soon';
  }
  return 'Overdue';
}

/**
 * Calculate computed fields for a truck
 */
function computeTruckFields(truck: any): {
  milesSinceLastOilChange: number;
  milesUntilNextOilChange: number;
  status: 'Good' | 'Soon' | 'Overdue';
} {
  const lastOilChangeMiles = truck.lastOilChangeMiles ?? truck.currentMiles;
  const milesSinceLastOilChange = Math.max(0, truck.currentMiles - lastOilChangeMiles);
  const milesUntilNextOilChange = Math.max(0, truck.oilChangeIntervalMiles - milesSinceLastOilChange);
  const status = calculateStatus(milesUntilNextOilChange);

  return {
    milesSinceLastOilChange,
    milesUntilNextOilChange,
    status,
  };
}

/**
 * Get all trucks with calculated status
 */
export async function getAllTrucks(): Promise<TruckWithStatus[]> {
  const trucks = await prisma.truck.findMany({
    orderBy: { name: 'asc' },
  });

  return trucks.map(truck => {
    const computed = computeTruckFields(truck);

    return {
      id: truck.id,
      name: truck.name,
      samsaraVehicleId: truck.samsaraVehicleId,
      currentMiles: truck.currentMiles,
      currentMilesUpdatedAt: truck.currentMilesUpdatedAt,
      lastOilChangeMiles: truck.lastOilChangeMiles,
      lastOilChangeAt: truck.lastOilChangeAt,
      oilChangeIntervalMiles: truck.oilChangeIntervalMiles,
      milesSinceLastOilChange: computed.milesSinceLastOilChange,
      milesUntilNextOilChange: computed.milesUntilNextOilChange,
      status: computed.status,
      createdAt: truck.createdAt,
      updatedAt: truck.updatedAt,
    };
  });
}

/**
 * Get truck by ID
 */
export async function getTruckById(id: string) {
  const truck = await prisma.truck.findUnique({
    where: { id },
  });

  if (!truck) {
    return null;
  }

  const computed = computeTruckFields(truck);

  return {
    ...truck,
    ...computed,
  };
}

/**
 * Create a new truck
 */
export async function createTruck(data: {
  name: string;
  samsaraVehicleId?: string | null;
  currentMiles?: number;
  expiresInMiles?: number;
  oilChangeIntervalMiles?: number;
}) {
  const currentMiles = data.currentMiles || 0;
  const oilChangeIntervalMiles = data.oilChangeIntervalMiles || 30000;
  
  // Calculate lastOilChangeMiles from expiresInMiles
  // expiresInMiles = oilChangeIntervalMiles - (currentMiles - lastOilChangeMiles)
  // lastOilChangeMiles = currentMiles + expiresInMiles - oilChangeIntervalMiles
  let lastOilChangeMiles: number | null = null;
  if (data.expiresInMiles !== undefined) {
    lastOilChangeMiles = currentMiles + data.expiresInMiles - oilChangeIntervalMiles;
  }
  
  return prisma.truck.create({
    data: {
      name: data.name,
      samsaraVehicleId: data.samsaraVehicleId || null,
      currentMiles,
      lastOilChangeMiles,
      oilChangeIntervalMiles,
    },
  });
}

/**
 * Reset oil change (set lastOilChangeMiles to currentMiles and lastOilChangeAt to now)
 */
export async function resetOilChange(id: string) {
  const truck = await prisma.truck.findUnique({
    where: { id },
  });

  if (!truck) {
    throw new Error('Truck not found');
  }

  return prisma.truck.update({
    where: { id },
    data: {
      lastOilChangeMiles: truck.currentMiles,
      lastOilChangeAt: new Date(),
    },
  });
}

/**
 * Update truck
 */
export async function updateTruck(
  id: string,
  data: {
    name?: string;
    samsaraVehicleId?: string | null;
    currentMiles?: number;
    oilChangeIntervalMiles?: number;
  }
) {
  return prisma.truck.update({
    where: { id },
    data,
  });
}

/**
 * Update truck odometer from Samsara
 */
export async function updateTruckOdometer(
  samsaraVehicleId: string,
  currentMiles: number
) {
  return prisma.truck.updateMany({
    where: { samsaraVehicleId },
    data: {
      currentMiles,
      currentMilesUpdatedAt: new Date(),
    },
  });
}

/**
 * Delete truck
 */
export async function deleteTruck(id: string) {
  return prisma.truck.delete({
    where: { id },
  });
}
