/**
 * API functions for managing oil change status via pti-bot API
 * All requests require X-API-Key header for authentication
 */

// Используем API route Next.js для проксирования запросов
// Это безопаснее, так как API ключ не попадает в клиентский код
const API_BASE = '/api/oil-change';

// Debug: проверка переменных (удалить после отладки)
if (typeof window !== 'undefined') {
  console.log('[OilChangeAPI] Using Next.js API route:', API_BASE);
}

// Вспомогательная функция для проверки HTML ответа
function checkHtmlResponse(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<!');
}

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
  const response = await fetch(`${API_BASE}?path=oil-change/list`, {
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  // Проверяем, не вернулся ли HTML вместо JSON
  if (checkHtmlResponse(responseText)) {
    throw new Error('API returned HTML instead of JSON. Check Caddy configuration or use NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api');
  }

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(responseText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = responseText.substring(0, 200) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Проверяем, что ответ действительно JSON
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected content type: ${contentType}. API may not be configured correctly.`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Get oil change status for a specific truck
 */
export async function getOilChangeStatus(truckName: string): Promise<OilChangeStatusResponse> {
  const encodedName = encodeURIComponent(truckName);
  const response = await fetch(`${API_BASE}?path=oil-change/${encodedName}`, {
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (checkHtmlResponse(responseText)) {
    throw new Error('API returned HTML instead of JSON. Check Caddy configuration.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Truck not found: ${truckName}`);
    }
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(responseText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = responseText.substring(0, 200) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response`);
  }
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

  const response = await fetch(`${API_BASE}?path=oil-change/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (checkHtmlResponse(responseText)) {
    throw new Error('API returned HTML instead of JSON. Check Caddy configuration.');
  }

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(responseText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = responseText.substring(0, 200) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response`);
  }
}

/**
 * Get list of all trucks (for dropdown)
 */
export async function getTrucksList(): Promise<TrucksListResponse> {
  const response = await fetch(`${API_BASE}?path=trucks`, {
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (checkHtmlResponse(responseText)) {
    throw new Error('API returned HTML instead of JSON. Check Caddy configuration.');
  }

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorJson = JSON.parse(responseText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = responseText.substring(0, 200) || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response`);
  }
}
