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
  fuelPercent?: number;
  odometerMeters?: number;
  odometerMiles?: number;
}

interface SamsaraStatsSnapshotResponse {
  data?: Array<{
    id: string;
    name?: string;
    engineStates?: { time: string; value: string };
    gps?: {
      time: string;
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