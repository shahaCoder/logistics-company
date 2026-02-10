"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Truck {
  id: string;
  name: string;
  make: string;
  model: string;
  vin: string;
  plate: string;
  plateState: string;
  driver: string | null;
  samsaraVehicleId: string | null;
  currentMiles: number;
  currentMilesUpdatedAt: string | null;
  lastOilChangeMiles: number | null;
  lastOilChangeAt: string | null;
  oilChangeIntervalMiles: number;
}

type SortField = "make" | "model" | "vin" | "plate" | "plateState" | null;
type SortDirection = "asc" | "desc";

export default function TrucksPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTrucks = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks`, {
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
      // For now, use static data if API doesn't return trucks
      if (data.trucks && data.trucks.length > 0) {
        setTrucks(data.trucks);
      } else {
        // Static demo data
        setTrucks([
          {
            id: "1",
            name: "Truck-001",
            make: "Volvo",
            model: "VNL 760",
            vin: "4V4NC9EH5KN123456",
            plate: "ABC-1234",
            plateState: "NY",
            driver: "John Smith",
            samsaraVehicleId: "123456789",
            currentMiles: 125000,
            currentMilesUpdatedAt: new Date().toISOString(),
            lastOilChangeMiles: 120000,
            lastOilChangeAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            oilChangeIntervalMiles: 15000,
          },
          {
            id: "2",
            name: "Truck-002",
            make: "Freightliner",
            model: "Cascadia",
            vin: "1FUJGHDV5DSH98765",
            plate: "XYZ-5678",
            plateState: "CA",
            driver: "Mike Johnson",
            samsaraVehicleId: "987654321",
            currentMiles: 98000,
            currentMilesUpdatedAt: new Date().toISOString(),
            lastOilChangeMiles: 95000,
            lastOilChangeAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            oilChangeIntervalMiles: 15000,
          },
          {
            id: "3",
            name: "Truck-003",
            make: "Peterbilt",
            model: "579",
            vin: "1NP5DB0X9NN456789",
            plate: "DEF-9012",
            plateState: "TX",
            driver: "Robert Williams",
            samsaraVehicleId: "456789123",
            currentMiles: 156000,
            currentMilesUpdatedAt: new Date().toISOString(),
            lastOilChangeMiles: 150000,
            lastOilChangeAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            oilChangeIntervalMiles: 15000,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching trucks:", error);
      // Use static data on error
      setTrucks([
        {
          id: "1",
          name: "Truck-001",
          make: "Volvo",
          model: "VNL 760",
          vin: "4V4NC9EH5KN123456",
          plate: "ABC-1234",
          plateState: "NY",
          driver: "John Smith",
          samsaraVehicleId: "123456789",
          currentMiles: 125000,
          currentMilesUpdatedAt: new Date().toISOString(),
          lastOilChangeMiles: 120000,
          lastOilChangeAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          oilChangeIntervalMiles: 15000,
        },
        {
          id: "2",
          name: "Truck-002",
          make: "Freightliner",
          model: "Cascadia",
          vin: "1FUJGHDV5DSH98765",
          plate: "XYZ-5678",
          plateState: "CA",
          driver: "Mike Johnson",
          samsaraVehicleId: "987654321",
          currentMiles: 98000,
          currentMilesUpdatedAt: new Date().toISOString(),
          lastOilChangeMiles: 95000,
          lastOilChangeAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          oilChangeIntervalMiles: 15000,
        },
        {
          id: "3",
          name: "Truck-003",
          make: "Peterbilt",
          model: "579",
          vin: "1NP5DB0X9NN456789",
          plate: "DEF-9012",
          plateState: "TX",
          driver: "Robert Williams",
          samsaraVehicleId: "456789123",
          currentMiles: 156000,
          currentMilesUpdatedAt: new Date().toISOString(),
          lastOilChangeMiles: 150000,
          lastOilChangeAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          oilChangeIntervalMiles: 15000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const filteredTrucks = trucks.filter((truck) =>
    truck.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    truck.make.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    truck.model.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    truck.vin.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    truck.plate.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (truck.driver && truck.driver.toLowerCase().includes(debouncedSearch.toLowerCase()))
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
    
    let aValue: string | number = "";
    let bValue: string | number = "";
    
    switch (sortField) {
      case "make":
        aValue = a.make;
        bValue = b.make;
        break;
      case "model":
        aValue = a.model;
        bValue = b.model;
        break;
      case "vin":
        aValue = a.vin;
        bValue = b.vin;
        break;
      case "plate":
        aValue = a.plate;
        bValue = b.plate;
        break;
      case "plateState":
        aValue = a.plateState;
        bValue = b.plateState;
        break;
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Trucks</h1>
        <p className="mt-1 text-xs text-slate-500">
          View and manage all trucks in the fleet
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
        <div>
          <label htmlFor="trucks-search" className="block text-xs font-medium text-slate-700 mb-1.5">
            Search
          </label>
          <input
            id="trucks-search"
            name="trucks-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by make, model, VIN, plate, or driver..."
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading...</div>
        ) : filteredTrucks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No trucks found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("make")}
                    >
                      <div className="flex items-center">
                        MAKE
                        <SortIcon field="make" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("model")}
                    >
                      <div className="flex items-center">
                        MODEL
                        <SortIcon field="model" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("vin")}
                    >
                      <div className="flex items-center">
                        VIN
                        <SortIcon field="vin" />
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
                      onClick={() => handleSort("plateState")}
                    >
                      <div className="flex items-center">
                        PLATE STATE
                        <SortIcon field="plateState" />
                      </div>
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      DRIVER
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
                        <div className="text-xs font-medium text-slate-900">{truck.make}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-900">{truck.model}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-900 font-mono">{truck.vin}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-900 font-medium">{truck.plate}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-900">{truck.plateState}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-900">{truck.driver || "Unassigned"}</div>
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
          </>
        )}
      </div>
    </div>
  );
}
