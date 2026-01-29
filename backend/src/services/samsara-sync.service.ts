/**
 * Samsara Odometer Sync Service
 * Syncs vehicle odometer readings from Samsara API to database
 */

import { fetchVehicleStatsFeed, getSamsaraApiToken } from './samsara.service.js';
import prisma from '../utils/prisma.js';

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

/**
 * Sync odometer data from Samsara for all trucks with samsaraVehicleId
 * TODO: Temporarily disabled due to Samsara API error (400: Invalid stat type(s): odometer)
 */
export async function syncSamsaraOdometer(): Promise<void> {
  // Temporarily disabled - Samsara API returning 400 error
  console.log('[Samsara Sync] Sync disabled - API error needs to be fixed');
  return;
  
  /* COMMENTED OUT - Samsara API error
  if (isSyncing) {
    console.log('[Samsara Sync] Sync already in progress, skipping...');
    return;
  }

  const apiToken = getSamsaraApiToken();
  if (!apiToken) {
    console.warn('[Samsara Sync] SAMSARA_API_TOKEN not found, skipping sync');
    return;
  }

  isSyncing = true;
  console.log('[Samsara Sync] Starting odometer sync...');

  try {
    // Fetch vehicle stats from Samsara
    const vehicleStats = await fetchVehicleStatsFeed(apiToken);
    console.log(`[Samsara Sync] Fetched ${vehicleStats.length} vehicles from Samsara`);

    // Get all trucks with samsaraVehicleId
    const trucks = await prisma.truck.findMany({
      where: {
        samsaraVehicleId: {
          not: null,
        },
      },
      select: {
        id: true,
        samsaraVehicleId: true,
        name: true,
      },
    });

    console.log(`[Samsara Sync] Found ${trucks.length} trucks with Samsara IDs`);

    // Create a map of samsaraVehicleId -> odometerMiles
    const odometerMap = new Map<string, number>();
    for (const vehicle of vehicleStats) {
      if (vehicle.id && vehicle.odometerMiles !== undefined) {
        odometerMap.set(vehicle.id, vehicle.odometerMiles);
      }
    }

    // Update trucks using batch operations (much faster than individual updates)
    const updates: Array<{ samsaraVehicleId: string; odometerMiles: number; truckName: string }> = [];
    
    for (const truck of trucks) {
      if (truck.samsaraVehicleId) {
        const odometerMiles = odometerMap.get(truck.samsaraVehicleId);
        if (odometerMiles !== undefined) {
          updates.push({
            samsaraVehicleId: truck.samsaraVehicleId,
            odometerMiles,
            truckName: truck.name,
          });
        } else {
          console.warn(`[Samsara Sync] No odometer data found for truck ${truck.name} (${truck.samsaraVehicleId})`);
        }
      }
    }

    // Execute all updates in parallel using Promise.all
    if (updates.length > 0) {
      const updatePromises = updates.map(({ samsaraVehicleId, odometerMiles, truckName }) =>
        prisma.truck.updateMany({
          where: { samsaraVehicleId },
          data: {
            currentMiles: odometerMiles,
            currentMilesUpdatedAt: new Date(),
          },
        }).then(() => {
          console.log(`[Samsara Sync] Updated ${truckName} (${samsaraVehicleId}): ${odometerMiles} miles`);
        })
      );

      await Promise.all(updatePromises);
      console.log(`[Samsara Sync] Completed: updated ${updates.length} trucks in batch`);
    } else {
      console.log('[Samsara Sync] No trucks to update');
    }
  } catch (error) {
    console.error('[Samsara Sync] Error syncing odometer:', error);
    // Don't throw - we want the sync to continue even if one sync fails
  } finally {
    isSyncing = false;
  }
  */
}

/**
 * Start the Samsara sync job (runs every 6 hours)
 * TODO: Temporarily disabled due to Samsara API error
 */
export function startSamsaraSyncJob(): void {
  // Temporarily disabled - Samsara API returning 400 error
  console.log('[Samsara Sync] Sync job disabled - API error needs to be fixed');
  return;
  
  /* COMMENTED OUT - Samsara API error
  const apiToken = getSamsaraApiToken();
  if (!apiToken) {
    console.warn('[Samsara Sync] SAMSARA_API_TOKEN not found, sync job will not start');
    return;
  }

  // Run immediately on startup (after a short delay to let server initialize)
  setTimeout(() => {
    syncSamsaraOdometer().catch((error) => {
      console.error('[Samsara Sync] Error in initial sync:', error);
    });
  }, 30000); // 30 seconds delay

  // Then run every 6 hours
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  syncInterval = setInterval(() => {
    syncSamsaraOdometer().catch((error) => {
      console.error('[Samsara Sync] Error in scheduled sync:', error);
    });
  }, SIX_HOURS_MS);

  console.log('[Samsara Sync] Sync job started (runs every 6 hours)');
  */
}

/**
 * Stop the Samsara sync job
 */
export function stopSamsaraSyncJob(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[Samsara Sync] Sync job stopped');
  }
}
