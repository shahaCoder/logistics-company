import prisma from '../../utils/prisma.js';
import {
  fetchVehicleStatsSnapshot,
  getSamsaraApiToken,
  type SamsaraVehicleLiveStatus,
} from '../../services/samsara.service.js';

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

export interface TruckWithSamsaraStatus extends TruckWithStatus {
  samsaraStatus?: {
    engineState: 'On' | 'Off' | 'Idle';
    engineStateTime?: string;
    address?: string;
    speedMph?: number;
    fuelPercent?: number;
    odometerMiles?: number;
  } | null;
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
 * Get all trucks with Samsara live status (engine, GPS, fuel).
 * Includes DB trucks (enriched with Samsara) + Samsara-only vehicles not yet in DB.
 */
export async function getAllTrucksWithSamsaraStatus(): Promise<TruckWithSamsaraStatus[]> {
  const trucks = await getAllTrucks();
  const apiToken = getSamsaraApiToken();

  if (!apiToken) {
    return trucks.map(t => ({ ...t, samsaraStatus: null }));
  }

  let samsaraList: SamsaraVehicleLiveStatus[] = [];
  try {
    samsaraList = await fetchVehicleStatsSnapshot(apiToken);
  } catch (err) {
    console.error('[Trucks] Samsara fetch failed:', err);
    return trucks.map(t => ({ ...t, samsaraStatus: null }));
  }

  const samsaraMap = new Map<string, SamsaraVehicleLiveStatus>();
  for (const v of samsaraList) {
    samsaraMap.set(v.id, v);
  }

  const dbBySamsaraId = new Map<string | null, (typeof trucks)[0]>();
  for (const t of trucks) {
    if (t.samsaraVehicleId) dbBySamsaraId.set(t.samsaraVehicleId, t);
  }

  const result: TruckWithSamsaraStatus[] = [];

  for (const truck of trucks) {
    const samsara = truck.samsaraVehicleId ? samsaraMap.get(truck.samsaraVehicleId) : undefined;
    result.push({
      ...truck,
      samsaraStatus: samsara?.engineState
        ? {
            engineState: samsara.engineState,
            engineStateTime: samsara.engineStateTime,
            address: samsara.address,
            speedMph: samsara.speedMph,
            fuelPercent: samsara.fuelPercent,
            odometerMiles: samsara.odometerMiles,
          }
        : null,
    });
  }

  for (const v of samsaraList) {
    if (dbBySamsaraId.has(v.id)) continue;
    result.push({
      id: `samsara-${v.id}`,
      name: v.name ?? `Vehicle ${v.id}`,
      samsaraVehicleId: v.id,
      currentMiles: v.odometerMiles ?? 0,
      currentMilesUpdatedAt: null,
      lastOilChangeMiles: null,
      lastOilChangeAt: null,
      oilChangeIntervalMiles: 15000,
      milesSinceLastOilChange: 0,
      milesUntilNextOilChange: 15000,
      status: 'Good',
      createdAt: new Date(),
      updatedAt: new Date(),
      samsaraStatus: v.engineState
        ? {
            engineState: v.engineState,
            engineStateTime: v.engineStateTime,
            address: v.address,
            speedMph: v.speedMph,
            fuelPercent: v.fuelPercent,
            odometerMiles: v.odometerMiles,
          }
        : null,
    });
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
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
