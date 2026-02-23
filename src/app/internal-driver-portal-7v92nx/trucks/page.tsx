"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SamsaraStatus {
  engineState: "On" | "Off" | "Idle";
  engineStateTime?: string;
  address?: string;
  speedMph?: number;
  fuelPercent?: number;
  odometerMiles?: number;
}

interface Truck {
  id: string;
  name: string;
  samsaraVehicleId: string | null;
  currentMiles: number;
  currentMilesUpdatedAt: string | null;
  lastOilChangeMiles: number | null;
  lastOilChangeAt: string | null;
  oilChangeIntervalMiles: number;
  milesSinceLastOilChange: number;
  milesUntilNextOilChange: number;
  status: "Good" | "Soon" | "Overdue";
  samsaraStatus?: SamsaraStatus | null;
}

function getTruckStatus(truck: Truck): "good" | "needs attention" {
  if (truck.status === "Overdue") return "needs attention";
  if (truck.status === "Soon") return "needs attention";
  return "good";
}

type SortField = "name" | "engine" | "status" | null;
type SortDirection = "asc" | "desc";

export default function TrucksPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTrucks = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks?live=1`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch trucks");
      }

      const data = await response.json();
      const list = data.trucks ?? (Array.isArray(data) ? data : []);
      setTrucks(list);
    } catch (error) {
      console.error("Error fetching trucks:", error);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (truck.samsaraStatus?.address?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false)
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (!sortField) return 0;
    let aVal: string | number = "";
    let bVal: string | number = "";
    switch (sortField) {
      case "name":
        aVal = a.name;
        bVal = b.name;
        break;
      case "engine":
        aVal = a.samsaraStatus?.engineState ?? "";
        bVal = b.samsaraStatus?.engineState ?? "";
        break;
      case "status":
        aVal = getTruckStatus(a);
        bVal = getTruckStatus(b);
        break;
    }
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <div className="inline-flex flex-col ml-1">
          <svg className="w-2 h-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
          </svg>
          <svg className="w-2 h-2 text-slate-400 -mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 8a1 1 0 102 0v5.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 13.586V8z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="inline-flex flex-col ml-1">
        {sortDirection === "asc" ? (
          <svg className="w-2 h-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
          </svg>
        ) : (
          <svg className="w-2 h-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 8a1 1 0 102 0v5.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 13.586V8z" />
          </svg>
        )}
      </div>
    );
  };

  const engineBadge = (s: SamsaraStatus | null | undefined) => {
    if (!s?.engineState) return <span className="text-slate-400 text-xs">—</span>;
    const colors =
      s.engineState === "On"
        ? "bg-emerald-100 text-emerald-800"
        : s.engineState === "Idle"
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-100 text-slate-600";
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${colors}`}>
        {s.engineState}
      </span>
    );
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Trucks</h1>
        <p className="mt-1 text-xs text-slate-500">
          Fleet list with live status from Samsara (engine, location, fuel)
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
        <label htmlFor="trucks-search" className="block text-xs font-medium text-slate-700 mb-1.5">
          Search
        </label>
        <input
          id="trucks-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by truck name or location..."
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading trucks...</div>
        ) : filteredTrucks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No trucks found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      TRUCK
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("engine")}
                  >
                    <div className="flex items-center">
                      ENGINE
                      <SortIcon field="engine" />
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    LOCATION
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    MILES
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    FUEL
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      OIL STATUS
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedTrucks.map((truck) => (
                  <tr key={truck.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-900">{truck.name}</div>
                      {truck.samsaraVehicleId && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Samsara: {truck.samsaraVehicleId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{engineBadge(truck.samsaraStatus)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-900 max-w-[180px] truncate" title={truck.samsaraStatus?.address}>
                        {truck.samsaraStatus?.address ?? "—"}
                      </div>
                      {truck.samsaraStatus?.speedMph != null && truck.samsaraStatus.speedMph > 0 && (
                        <div className="text-[10px] text-slate-500">{truck.samsaraStatus.speedMph} mph</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-900 font-medium">
                        {truck.samsaraStatus?.odometerMiles ?? truck.currentMiles}
                      </div>
                      {truck.currentMilesUpdatedAt && (
                        <div className="text-[10px] text-slate-400">
                          Updated {new Date(truck.currentMilesUpdatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {truck.samsaraStatus?.fuelPercent != null ? (
                        <span className="text-xs text-slate-900">{truck.samsaraStatus.fuelPercent}%</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          getTruckStatus(truck) === "needs attention"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {truck.status === "Overdue" ? "Overdue" : truck.status === "Soon" ? "Soon" : "Good"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {!truck.id.startsWith("samsara-") ? (
                        <Link
                          href={`/internal-driver-portal-7v92nx/trucks/${truck.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Samsara only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
