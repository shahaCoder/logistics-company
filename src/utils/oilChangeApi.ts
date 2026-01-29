/**
 * API functions for managing oil change status via pti-bot API
 * All requests require X-API-Key header for authentication
 */

const API_BASE = process.env.NEXT_PUBLIC_BOT_API_BASE || 'https://glco.us/api/bot';
const API_KEY = process.env.NEXT_PUBLIC_BOT_API_KEY || '';

export interface OilChangeTruck {
  vehicleName: string;
  currentMileage: number | null;
  lastOilChangeMileage: number;
  lastOilChangeDate: string;
  nextDueMileage: number;
  remainingMiles: number | null;
  status: 'OK' | 'WARNING' | 'OVERDUE';
}

export interface OilChangeListResponse {
  success: boolean;
  data: OilChangeTruck[];
  summary: {
    total: number;
    ok: number;
    warning: number;
    overdue: number;
  };
}

export interface OilChangeStatusResponse {
  success: boolean;
  data: OilChangeTruck;
}

export interface ResetOilChangeResponse {
  success: boolean;
  message: string;
  data: OilChangeTruck;
}

export interface Truck {
  name: string;
  vehicleId: string;
}

export interface TrucksListResponse {
  success: boolean;
  data: Truck[];
}

/**
 * Get list of all trucks with their oil change status
 */
export async function getOilChangeList(): Promise<OilChangeListResponse> {
  const response = await fetch(`${API_BASE}/oil-change/list`, {
    headers: {
      'X-API-Key': API_KEY,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get oil change status for a specific truck
 */
export async function getOilChangeStatus(truckName: string): Promise<OilChangeStatusResponse> {
  const encodedName = encodeURIComponent(truckName);
  const response = await fetch(`${API_BASE}/oil-change/${encodedName}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Truck not found: ${truckName}`);
    }
    const errorText = await response.text();
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Reset oil change for a truck
 */
export async function resetOilChange(
  truckName: string,
  mileage: number | null = null
): Promise<ResetOilChangeResponse> {
  const body: { truckName: string; mileage?: number } = { truckName };
  if (mileage !== null && mileage !== undefined) {
    body.mileage = mileage;
  }

  const response = await fetch(`${API_BASE}/oil-change/reset`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get list of all trucks (for dropdown)
 */
export async function getTrucksList(): Promise<TrucksListResponse> {
  const response = await fetch(`${API_BASE}/trucks`, {
    headers: {
      'X-API-Key': API_KEY,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
