/**
 * Samsara API Client Service
 * Fetches vehicle odometer data from Samsara Fleet Management API
 */

const SAMSARA_API_BASE = 'https://api.samsara.com/v1';

export interface SamsaraVehicleStats {
  vehicleId: string;
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

/**
 * Fetch vehicle stats from Samsara API
 * Uses /fleet/vehicles/stats/feed endpoint
 */
export async function fetchVehicleStatsFeed(apiToken: string): Promise<SamsaraVehicleStats[]> {
  const url = `${SAMSARA_API_BASE}/fleet/vehicles/stats/feed`;
  
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

  const data: SamsaraStatsFeedResponse = await response.json();
  
  if (!data.data) {
    return [];
  }

  return data.data.map((vehicle) => {
    const odometerMeters = vehicle.odometerMeters || 0;
    const odometerMiles = Math.round(odometerMeters / 1609.344);
    
    return {
      vehicleId: vehicle.vehicleId,
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
