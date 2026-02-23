"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Truck {
  id: string;
  name: string;
  samsaraVehicleId: string | null;
  plate: string | null;
  driver: string | null;
  year: string | null;
  displayStatus: "Good" | "Needs attention";
  engineState?: string | null;
  location?: string | null;
  locationTime?: string | null;
  lastTripEndMs?: number | null;
}

function formatLastTripAgo(ms: number | null | undefined): string {
  if (ms == null) return "—";
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (mins > 0) return `${mins} min ago`;
  return "Just now";
}

function formatLocationTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (mins > 0) return `${mins} min ago`;
  return "Just now";
}

type SortField = "name" | "plate" | "driver" | "year" | "engine" | "status" | null;
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

  const filteredTrucks = trucks.filter((truck) => {
    const q = debouncedSearch.toLowerCase();
    return (
      truck.name.toLowerCase().includes(q) ||
      (truck.plate?.toLowerCase().includes(q) ?? false) ||
      (truck.driver?.toLowerCase().includes(q) ?? false) ||
      (truck.year?.toLowerCase().includes(q) ?? false) ||
      (truck.location?.toLowerCase().includes(q) ?? false)
    );
  });

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
      case "plate":
        aVal = a.plate ?? "";
        bVal = b.plate ?? "";
        break;
      case "driver":
        aVal = a.driver ?? "";
        bVal = b.driver ?? "";
        break;
      case "year":
        aVal = a.year ?? "";
        bVal = b.year ?? "";
        break;
      case "engine":
        aVal = a.engineState ?? "";
        bVal = b.engineState ?? "";
        break;
      case "status":
        aVal = a.displayStatus;
        bVal = b.displayStatus;
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

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Trucks</h1>
        <p className="mt-1 text-xs text-slate-500">
          Fleet list with data from Samsara (plate, driver, year, status, location, last trip)
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
          placeholder="Search by truck name, plate, driver, or year..."
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
                    onClick={() => handleSort("plate")}
                  >
                    <div className="flex items-center">
                      PLATE
                      <SortIcon field="plate" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("driver")}
                  >
                    <div className="flex items-center">
                      DRIVER
                      <SortIcon field="driver" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("year")}
                  >
                    <div className="flex items-center">
                      YEAR
                      <SortIcon field="year" />
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
                    LAST TRIP
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      STATUS
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
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {truck.plate ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {truck.driver ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {truck.year ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {truck.engineState ? (
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                            truck.engineState === "On"
                              ? "bg-emerald-100 text-emerald-800"
                              : truck.engineState === "Idle"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {truck.engineState}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="text-xs text-slate-900 truncate" title={truck.location ?? undefined}>
                        {truck.location ?? "—"}
                      </div>
                      {truck.locationTime && (
                        <div className="text-[10px] text-slate-400">
                          {formatLocationTime(truck.locationTime)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900">
                      {formatLastTripAgo(truck.lastTripEndMs)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          truck.displayStatus === "Needs attention"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {truck.displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
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
