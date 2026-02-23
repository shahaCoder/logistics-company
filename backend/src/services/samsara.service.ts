/**
 * Samsara API Client Service
 * Fetches vehicle data from Samsara Fleet Management API
 */

const SAMSARA_API_BASE = 'https://api.samsara.com';

export interface SamsaraVehicleStats {
  id: string;
  name?: string;
  odometerMeters?: number;
  odometerMiles?: number;
}

export interface SamsaraStatsFeedResponse {
  data?: Array<{
    vehicleId: string;
    name?: string;
    odometerMeters?: number;
  }>;
  pagination?: {
    endCursor?: string;
    hasNextPage?: boolean;
  };
}

/** Vehicle metadata from GET /fleet/vehicles (plate, year, make, model, serial) */
export interface SamsaraVehicleInfo {
  id: string;
  serial?: string;
  name?: string;
  licensePlate?: string;
  year?: string;
  make?: string;
  model?: string;
  vin?: string;
}

/** Map: look up by vehicle id OR by serial (e.g. G6RK-8YA-RYW from Assets page) */
export function buildVehicleLookup(vehicles: SamsaraVehicleInfo[]): Map<string, SamsaraVehicleInfo> {
  const map = new Map<string, SamsaraVehicleInfo>();
  for (const v of vehicles) {
    const idKey = String(v.id ?? '').trim();
    if (idKey) map.set(idKey, v);
    const serialKey = v.serial ? String(v.serial).trim() : '';
    if (serialKey) map.set(serialKey, v);
  }
  return map;
}

/** Driver assignment: vehicleId -> driver name */
export type VehicleDriverMap = Map<string, string>;

/** Live status from Samsara snapshot (engine, GPS, fuel, odometer) */
export interface SamsaraVehicleLiveStatus {
  id: string;
  name?: string;
  engineState?: 'On' | 'Off' | 'Idle';
  engineStateTime?: string;
  latitude?: number;
  longitude?: number;
  speedMph?: number;
  address?: string;
  gpsTime?: string;
  fuelPercent?: number;
  odometerMeters?: number;
  odometerMiles?: number;
}

/** vehicleId -> last trip end time (ms). Used for "Last trip X ago". */
export type LastTripMap = Map<string, number>;

interface SamsaraStatsSnapshotResponse {
  data?: Array<{
    id: string;
    name?: string;
    engineStates?: { time: string; value: string };
    gps?: {
      time?: string;
      latitude?: number;
      longitude?: number;
      speedMilesPerHour?: number;
      reverseGeo?: { formattedLocation?: string };
    };
    fuelPercents?: { time: string; value?: number };
    obdOdometerMeters?: { time: string; value?: number };
  }>;
  pagination?: {
    endCursor?: string;
    hasNextPage?: boolean;
  };
}

/**
 * Fetch vehicle list from Samsara API
 * GET /fleet/vehicles - returns id, serial, name, licensePlate, year, make, model, vin
 * (Same data as on Samsara Assets page; supports both id and serial for lookup)
 */
export async function fetchVehicleList(apiToken: string): Promise<SamsaraVehicleInfo[]> {
  const all: SamsaraVehicleInfo[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams();
    if (cursor) params.set('after', cursor);
    const url = `${SAMSARA_API_BASE}/fleet/vehicles${params.toString() ? '?' + params : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Samsara] GET /fleet/vehicles failed:', response.status, errorText);
      throw new Error(`Samsara API error (${response.status}): ${errorText}`);
    }

    const raw = (await response.json()) as Record<string, unknown>;
    const data = raw?.data ?? raw?.vehicles ?? raw;
    const list = Array.isArray(data) ? data : [];

    if (list.length === 0 && !cursor) {
      console.warn('[Samsara] GET /fleet/vehicles returned no vehicles. Keys:', Object.keys(raw || {}));
    }

    for (const v of list) {
      const plate = v.licensePlate ?? v.license_plate ?? v.licensePlateNumber;
      const year = v.year != null ? String(v.year) : undefined;
      const id = v.id != null ? String(v.id) : '';
      const serial = v.serial != null ? String(v.serial) : undefined;
      if (!id && !serial) continue;
      all.push({
        id,
        serial: serial || undefined,
        name: v.name,
        licensePlate: plate,
        year,
        make: v.make,
        model: v.model,
        vin: v.vin,
      });
    }

    const pagination = (raw?.pagination ?? raw?.nextPageToken) as { hasNextPage?: boolean; endCursor?: string } | undefined;
    cursor = pagination?.hasNextPage ? pagination.endCursor : undefined;
  } while (cursor);

  return all;
}

/**
 * Fetch current driver assignments (vehicleId -> driver name)
 * GET /fleet/vehicles/driver-assignments with vehicleIds (comma-separated); optional startTime/endTime
 * Response: data[] with vehicleId and driver: { id, name }
 */
export async function fetchDriverAssignments(
  apiToken: string,
  vehicleIds?: string[]
): Promise<VehicleDriverMap> {
  const map: VehicleDriverMap = new Map();

  try {
    const params = new URLSearchParams();
    if (vehicleIds?.length) params.set('vehicleIds', vehicleIds.join(','));
    const qs = params.toString();
    const url = `${SAMSARA_API_BASE}/fleet/vehicles/driver-assignments${qs ? '?' + qs : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return map;

    const data = (await response.json()) as {
      data?: Array<{
        vehicleId?: string;
        driver?: { id: string; name?: string };
      }>;
    };

    if (!data.data) return map;

    for (const row of data.data) {
      const vehicleId = row.vehicleId;
      const driverName = row.driver?.name ?? row.driver?.id ?? null;
      if (vehicleId && driverName) {
        map.set(String(vehicleId), driverName);
      }
    }
  } catch {
    // ignore
  }
  return map;
}

/**
 * Fetch last trip end time per vehicle (for "Last trip X ago").
 * GET /fleet/trips with vehicleIds, startMs, endMs. Response: data[] with vehicleId, endMs.
 * Returns map vehicleId -> endMs of the most recent trip.
 */
export async function fetchLastTrips(
  apiToken: string,
  vehicleIds: string[]
): Promise<LastTripMap> {
  const map: LastTripMap = new Map();
  if (!vehicleIds.length) return map;

  try {
    const endMs = Date.now();
    const startMs = endMs - 30 * 24 * 60 * 60 * 1000; // last 30 days
    const params = new URLSearchParams({
      vehicleIds: vehicleIds.join(','),
      startMs: String(startMs),
      endMs: String(endMs),
    });
    const url = `${SAMSARA_API_BASE}/fleet/trips?${params}`;
    const v1Url = `${SAMSARA_API_BASE}/v1/fleet/trips?${params}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    const response = res.ok ? res : await fetch(v1Url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return map;

    const raw = (await response.json()) as Record<string, unknown>;
    const data = (raw?.data ?? raw?.trips ?? []) as Array<{ vehicleId?: string; id?: string; endMs?: number }>;
    const list = Array.isArray(data) ? data : [];

    for (const trip of list) {
      const vid = trip.vehicleId ?? trip.id;
      const end = trip.endMs;
      if (vid && typeof end === 'number') {
        const key = String(vid);
        const current = map.get(key);
        if (current == null || end > current) map.set(key, end);
      }
    }
  } catch {
    // ignore
  }
  return map;
}

/**
 * Fetch vehicle stats snapshot from Samsara API
 * GET /fleet/vehicles/stats - returns last known engine state, GPS, fuel, odometer for all vehicles
 */
export async function fetchVehicleStatsSnapshot(
  apiToken: string,
  types: string = 'engineStates,gps,fuelPercents,obdOdometerMeters'
): Promise<SamsaraVehicleLiveStatus[]> {
  const all: SamsaraVehicleLiveStatus[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ types });
    if (cursor) params.set('after', cursor);
    const url = `${SAMSARA_API_BASE}/fleet/vehicles/stats?${params}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Samsara API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SamsaraStatsSnapshotResponse;
    if (!data.data) break;

    for (const v of data.data) {
      const odometerMeters = v.obdOdometerMeters?.value;
      all.push({
        id: v.id,
        name: v.name,
        engineState: v.engineStates?.value as 'On' | 'Off' | 'Idle' | undefined,
        engineStateTime: v.engineStates?.time,
        latitude: v.gps?.latitude,
        longitude: v.gps?.longitude,
        speedMph: v.gps?.speedMilesPerHour,
        address: v.gps?.reverseGeo?.formattedLocation,
        gpsTime: v.gps?.time,
        fuelPercent: v.fuelPercents?.value,
        odometerMeters,
        odometerMiles: odometerMeters != null ? Math.round(odometerMeters / 1609.344) : undefined,
      });
    }

    cursor = data.pagination?.hasNextPage ? data.pagination.endCursor : undefined;
  } while (cursor);

  return all;
}

/**
 * Fetch vehicle stats from Samsara API
 * Uses /fleet/vehicles/stats/feed endpoint
 */
export async function fetchVehicleStatsFeed(apiToken: string): Promise<SamsaraVehicleStats[]> {
    const url = `${SAMSARA_API_BASE}/fleet/vehicles/stats/feed?types=odometer`;

  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Samsara API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as SamsaraStatsFeedResponse;
  
  if (!data.data) {
    return [];
  }

  return data.data.map((vehicle) => {
    const odometerMeters = vehicle.odometerMeters || 0;
    const odometerMiles = Math.round(odometerMeters / 1609.344);
    
    return {
      id: vehicle.vehicleId,
      name: vehicle.name,
      odometerMeters,
      odometerMiles,
    };
  });
}

/**
 * Get Samsara API token from environment
 */
export function getSamsaraApiToken(): string | null {
  return process.env.SAMSARA_API_TOKEN || null;
}