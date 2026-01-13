# Samsara Odometer Sync Integration

## Summary

Implemented Samsara odometer sync for the Trucks & Oil Change Status feature. Current miles are now automatically synced from Samsara API every 6 hours, and the reset functionality properly sets lastOilChangeMiles = currentMiles.

## Files Changed

### Backend

1. **`backend/prisma/schema.prisma`**
   - Added fields to Truck model:
     - `samsaraVehicleId: String? @unique`
     - `currentMilesUpdatedAt: DateTime?`
     - `lastOilChangeAt: DateTime?`
     - Updated `oilChangeIntervalMiles` default to 30000

2. **`backend/src/services/samsara.service.ts`** (NEW)
   - Samsara API client
   - Fetches vehicle stats from `/fleet/vehicles/stats/feed`
   - Converts odometer from meters to miles

3. **`backend/src/services/samsara-sync.service.ts`** (NEW)
   - Sync job that runs every 6 hours
   - Updates truck odometer from Samsara data
   - Handles errors gracefully

4. **`backend/src/modules/trucks/trucks.service.ts`**
   - Updated status calculation: Good/Soon/Overdue (thresholds: >5000, 1-5000, 0)
   - Handles null lastOilChangeMiles
   - New computed fields logic
   - Reset function now sets lastOilChangeAt

5. **`backend/src/modules/trucks/trucks.controller.ts`**
   - New endpoint: POST `/api/admin/trucks/:id/oil/reset`
   - Kept backward compatibility: PATCH `/api/admin/trucks/:id/reset-oil-change`

6. **`backend/src/index.ts`**
   - Starts Samsara sync job on server startup

### Frontend

7. **`src/app/internal-driver-portal-7v92nx/trucks/page.tsx`**
   - Updated status type: "Good" | "Soon" | "Overdue"
   - Updated reset endpoint to POST `/trucks/:id/oil/reset`
   - Status colors: Good (green), Soon (yellow), Overdue (red)

## Deployment Instructions

### 1. Database Migration

```bash
cd backend
npx prisma migrate dev --name add_samsara_fields
npx prisma generate
```

For production:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 2. Environment Variables

Add to `.env` (backend):
```env
SAMSARA_API_TOKEN=your_samsara_api_token_here
```

### 3. Build Backend

```bash
cd backend
npm run build
```

### 4. Restart Server

```bash
# For PM2
pm2 restart <app-name> --update-env

# Or if using npm start
npm run start
```

## API Changes

### GET /api/admin/trucks

Response now includes:
- `status`: "Good" | "Soon" | "Overdue"
- `milesSinceLastOilChange`: number
- `milesUntilNextOilChange`: number
- `samsaraVehicleId`: string | null
- `currentMilesUpdatedAt`: string | null
- `lastOilChangeAt`: string | null

### POST /api/admin/trucks/:id/oil/reset (NEW)

Sets `lastOilChangeMiles = currentMiles` and `lastOilChangeAt = now()`.

### PATCH /api/admin/trucks/:id/reset-oil-change (DEPRECATED but still works)

Kept for backward compatibility.

## Example API Response

```json
[
  {
    "id": "clx123...",
    "name": "714",
    "samsaraVehicleId": "123456",
    "currentMiles": 15600,
    "currentMilesUpdatedAt": "2025-01-13T12:00:00.000Z",
    "lastOilChangeMiles": 15600,
    "lastOilChangeAt": "2025-01-13T10:00:00.000Z",
    "oilChangeIntervalMiles": 30000,
    "milesSinceLastOilChange": 0,
    "milesUntilNextOilChange": 30000,
    "status": "Good",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-13T12:00:00.000Z"
  }
]
```

## Status Calculation Logic

- **Good**: milesUntilNextOilChange > 5000
- **Soon**: milesUntilNextOilChange 1-5000
- **Overdue**: milesUntilNextOilChange = 0

If `lastOilChangeMiles` is null, it defaults to `currentMiles` for calculations (status = Good).

## Sync Job

- Runs every 6 hours
- Only syncs trucks with `samsaraVehicleId` set
- Logs warnings if API token is missing (doesn't crash)
- Handles API errors gracefully (logs but continues)
- First sync runs 30 seconds after server startup

## Notes

- The Samsara API endpoint structure may need adjustment based on actual API documentation
- The sync job runs in the same process (not suitable for PM2 cluster mode without leader election)
- If running in cluster mode, consider running sync in a separate single-instance worker process
