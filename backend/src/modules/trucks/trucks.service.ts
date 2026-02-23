import prisma from '../../utils/prisma.js';
import {
  fetchVehicleList,
  fetchDriverAssignments,
  fetchVehicleStatsSnapshot,
  fetchLastTrips,
  getSamsaraApiToken,
  buildVehicleLookup,
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
  plate?: string | null;
  driver?: string | null;
  year?: string | null;
  /** Good or Needs attention (oil overdue/soon or other issues) */
  displayStatus: 'Good' | 'Needs attention';
  /** Engine: On / Off / Idle (from vehicle stats) */
  engineState?: string | null;
  /** Location string (from gps.reverseGeo.formattedLocation) */
  location?: string | null;
  /** When location was updated (gps.time) */
  locationTime?: string | null;
  /** Last trip end time in ms (for "X hours ago") */
  lastTripEndMs?: number | null;
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
 * Get all trucks (DB only) enriched with Samsara: plate, driver, year.
 * Status: Good or Needs attention (oil overdue/soon).
 */
export async function getAllTrucksWithSamsaraStatus(): Promise<TruckWithSamsaraStatus[]> {
  const trucks = await getAllTrucks();
  const apiToken = getSamsaraApiToken();

  let vehicleMap = new Map<string, import('../../services/samsara.service.js').SamsaraVehicleInfo>();
  let driverMap = new Map<string, string>();

  let statsMap = new Map<string, { engineState?: string; address?: string; gpsTime?: string }>();
  let lastTripMap = new Map<string, number>();

  if (apiToken) {
    try {
      const vehicles = await fetchVehicleList(apiToken);
      vehicleMap = buildVehicleLookup(vehicles);
      const vehicleIds = vehicles.map((v) => v.id).filter(Boolean);

      const [drivers, stats, lastTrips] = await Promise.all([
        fetchDriverAssignments(apiToken, vehicleIds),
        fetchVehicleStatsSnapshot(apiToken, 'engineStates,gps').catch(() => []),
        fetchLastTrips(apiToken, vehicleIds).catch(() => new Map()),
      ]);
      driverMap = drivers;
      lastTripMap = lastTrips;
      for (const s of stats) {
        statsMap.set(s.id, {
          engineState: s.engineState,
          address: s.address,
          gpsTime: s.gpsTime,
        });
      }
    } catch (err) {
      console.error('[Trucks] Samsara fetch failed:', err);
    }
  }

  return trucks.map(truck => {
    const info = truck.samsaraVehicleId ? vehicleMap.get(truck.samsaraVehicleId) : undefined;
    const driver = info ? driverMap.get(info.id) : (truck.samsaraVehicleId ? driverMap.get(truck.samsaraVehicleId) : undefined);
    const displayStatus: 'Good' | 'Needs attention' =
      truck.status === 'Overdue' || truck.status === 'Soon' ? 'Needs attention' : 'Good';

    const sid = info?.id ?? truck.samsaraVehicleId ?? '';
    const statsRow = sid ? statsMap.get(sid) : undefined;
    const lastTripEndMs = sid ? lastTripMap.get(sid) ?? null : null;

    return {
      ...truck,
      plate: info?.licensePlate ?? null,
      driver: driver ?? null,
      year: info?.year ?? null,
      displayStatus,
      engineState: statsRow?.engineState ?? null,
      location: statsRow?.address ?? null,
      locationTime: statsRow?.gpsTime ?? null,
      lastTripEndMs: lastTripEndMs ?? null,
    };
  });
}

/**
 * Get truck by ID (optionally with Samsara: plate, driver, year, make, model, vin)
 */
export async function getTruckById(id: string): Promise<Awaited<ReturnType<typeof getTruckByIdInternal>> | null> {
  return getTruckByIdInternal(id, false);
}

export async function getTruckByIdWithSamsara(id: string) {
  return getTruckByIdInternal(id, true);
}

async function getTruckByIdInternal(
  id: string,
  withSamsara: boolean
): Promise<{
  id: string;
  name: string;
  samsaraVehicleId: string | null;
  currentMiles: number;
  currentMilesUpdatedAt: Date | null;
  lastOilChangeMiles: number | null;
  lastOilChangeAt: Date | null;
  oilChangeIntervalMiles: number;
  milesSinceLastOilChange: number;
  milesUntilNextOilChange: number;
  status: 'Good' | 'Soon' | 'Overdue';
  plate?: string | null;
  driver?: string | null;
  year?: string | null;
  make?: string | null;
  model?: string | null;
  vin?: string | null;
  engineState?: string | null;
  location?: string | null;
  locationTime?: string | null;
  lastTripEndMs?: number | null;
} | null> {
  const truck = await prisma.truck.findUnique({
    where: { id },
  });

  if (!truck) {
    return null;
  }

  const computed = computeTruckFields(truck);
  const base = {
    ...truck,
    ...computed,
  };

  if (!withSamsara || !truck.samsaraVehicleId) {
    return base;
  }

  const apiToken = getSamsaraApiToken();
  if (!apiToken) return base;

  try {
    const vehicles = await fetchVehicleList(apiToken);
    const vehicleLookup = buildVehicleLookup(vehicles);
    const vehicle = vehicleLookup.get(truck.samsaraVehicleId!);
    const vehicleIds = vehicle ? [vehicle.id] : [truck.samsaraVehicleId!];

    const [drivers, stats, lastTrips] = await Promise.all([
      fetchDriverAssignments(apiToken, vehicleIds),
      fetchVehicleStatsSnapshot(apiToken, 'engineStates,gps').catch(() => []),
      fetchLastTrips(apiToken, vehicleIds).catch(() => new Map()),
    ]);
    const driver = vehicle ? drivers.get(vehicle.id) : drivers.get(truck.samsaraVehicleId!);
    const sid = vehicle?.id ?? truck.samsaraVehicleId!;
    const stat = stats.find((s) => s.id === sid);
    const lastTripEndMs = lastTrips.get(sid) ?? null;

    return {
      ...base,
      plate: vehicle?.licensePlate ?? null,
      driver: driver ?? null,
      year: vehicle?.year ?? null,
      make: vehicle?.make ?? null,
      model: vehicle?.model ?? null,
      vin: vehicle?.vin ?? null,
      engineState: stat?.engineState ?? null,
      location: stat?.address ?? null,
      locationTime: stat?.gpsTime ?? null,
      lastTripEndMs: lastTripEndMs ?? null,
    };
  } catch (err) {
    console.error('[Trucks] Samsara fetch for truck detail failed:', err);
    return base;
  }
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
