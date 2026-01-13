import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TruckWithStatus {
  id: string;
  name: string;
  currentMiles: number;
  lastOilChangeMiles: number;
  oilChangeIntervalMiles: number;
  milesSinceLastOilChange: number;
  milesUntilNextOilChange: number;
  status: 'good' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate oil change status
 * Returns 'good' if miles since last oil change < interval, 'overdue' otherwise
 */
function calculateStatus(milesSince: number, interval: number): 'good' | 'overdue' {
  if (milesSince >= interval) {
    return 'overdue';
  }
  return 'good';
}

/**
 * Get all trucks with calculated status
 */
export async function getAllTrucks(): Promise<TruckWithStatus[]> {
  const trucks = await prisma.truck.findMany({
    orderBy: { name: 'asc' },
  });

  return trucks.map(truck => {
    const milesSinceLastOilChange = truck.currentMiles - truck.lastOilChangeMiles;
    const milesUntilNextOilChange = Math.max(0, truck.oilChangeIntervalMiles - milesSinceLastOilChange);
    const status = calculateStatus(milesSinceLastOilChange, truck.oilChangeIntervalMiles);

    return {
      id: truck.id,
      name: truck.name,
      currentMiles: truck.currentMiles,
      lastOilChangeMiles: truck.lastOilChangeMiles,
      oilChangeIntervalMiles: truck.oilChangeIntervalMiles,
      milesSinceLastOilChange,
      milesUntilNextOilChange,
      status,
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

  const milesSinceLastOilChange = truck.currentMiles - truck.lastOilChangeMiles;
  const milesUntilNextOilChange = Math.max(0, truck.oilChangeIntervalMiles - milesSinceLastOilChange);
  const status = calculateStatus(milesSinceLastOilChange, truck.oilChangeIntervalMiles);

  return {
    ...truck,
    milesSinceLastOilChange,
    milesUntilNextOilChange,
    status,
  };
}

/**
 * Create a new truck
 */
export async function createTruck(data: {
  name: string;
  currentMiles?: number;
  lastOilChangeMiles?: number;
  oilChangeIntervalMiles?: number;
}) {
  return prisma.truck.create({
    data: {
      name: data.name,
      currentMiles: data.currentMiles || 0,
      lastOilChangeMiles: data.lastOilChangeMiles || data.currentMiles || 0,
      oilChangeIntervalMiles: data.oilChangeIntervalMiles || 10000,
    },
  });
}

/**
 * Reset oil change (set lastOilChangeMiles to currentMiles)
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
 * Delete truck
 */
export async function deleteTruck(id: string) {
  return prisma.truck.delete({
    where: { id },
  });
}
