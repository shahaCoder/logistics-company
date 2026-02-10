"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getOilChangeList,
  resetOilChange,
  type OilChangeTruck,
  type OilChangeListResponse,
} from "@/utils/oilChangeApi";

type FilterType = "all" | "warning" | "overdue";

export default function OilChangePage() {
  const [trucks, setTrucks] = useState<OilChangeTruck[]>([]);
  const [summary, setSummary] = useState<OilChangeListResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [resettingTruck, setResettingTruck] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<OilChangeTruck | null>(null);
  const [resetMileage, setResetMileage] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "remaining" | "status">("remaining");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getOilChangeList();
      setTrucks(result.data);
      setSummary(result.summary);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load oil change data. Please try again.";
      setError(errorMessage);
      console.error("Error loading oil change data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const handleReset = useCallback(
    async (truck: OilChangeTruck, mileage: number | null = null) => {
      setResettingTruck(truck.vehicleName);
      try {
        await resetOilChange(truck.vehicleName, mileage);
        // Refresh data after reset
        await loadData();
        setShowResetModal(false);
        setSelectedTruck(null);
        setResetMileage("");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reset oil change. Please try again.";
        alert(errorMessage);
        console.error("Error resetting oil change:", err);
      } finally {
        setResettingTruck(null);
      }
    },
    [loadData]
  );

  const openResetModal = useCallback((truck: OilChangeTruck) => {
    setSelectedTruck(truck);
    setResetMileage(truck.currentMileage?.toString() || "");
    setShowResetModal(true);
  }, []);

  const handleResetSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTruck) return;

      const mileage = resetMileage.trim() ? parseInt(resetMileage, 10) : null;
      if (mileage !== null && (isNaN(mileage) || mileage < 0)) {
        alert("Please enter a valid mileage number");
        return;
      }

      handleReset(selectedTruck, mileage);
    },
    [selectedTruck, resetMileage, handleReset]
  );

  const filteredAndSortedTrucks = useMemo(() => {
    let filtered = trucks;

    // Apply filter
    if (filter === "warning") {
      filtered = filtered.filter((t) => t.status === "WARNING");
    } else if (filter === "overdue") {
      filtered = filtered.filter((t) => t.status === "OVERDUE");
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.vehicleName.localeCompare(b.vehicleName);
      } else if (sortBy === "remaining") {
        const aRemaining = a.remainingMiles ?? Infinity;
        const bRemaining = b.remainingMiles ?? Infinity;
        return aRemaining - bRemaining;
      } else if (sortBy === "status") {
        const statusOrder = { OVERDUE: 0, WARNING: 1, OK: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    return sorted;
  }, [trucks, filter, sortBy]);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "OK":
        return "bg-green-100 text-green-800 border-green-300";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }, []);

  const formatMiles = useCallback((miles: number | null): string => {
    if (miles === null) return "N/A";
    return miles.toLocaleString("en-US");
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }, []);

  if (loading && trucks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="text-center text-slate-500 text-xs">Loading oil change data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Oil Change Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage oil change status for all trucks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-red-600"
            />
            Auto-refresh (5 min)
          </label>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-0.5 text-xs">Error loading data</h3>
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 border-l-4 border-blue-500">
            <div className="text-xs text-slate-600">Total Trucks</div>
            <div className="text-lg font-bold text-slate-900">{summary.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 border-l-4 border-emerald-500">
            <div className="text-xs text-slate-600">OK</div>
            <div className="text-lg font-bold text-emerald-600">{summary.ok}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 border-l-4 border-amber-500">
            <div className="text-xs text-slate-600">Warning</div>
            <div className="text-lg font-bold text-amber-600">{summary.warning}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 border-l-4 border-red-500">
            <div className="text-xs text-slate-600">Overdue</div>
            <div className="text-lg font-bold text-red-600">{summary.overdue}</div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            All ({trucks.length})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === "warning"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            Warning ({summary?.warning || 0})
          </button>
          <button
            onClick={() => setFilter("overdue")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === "overdue"
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            Overdue ({summary?.overdue || 0})
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "remaining" | "status")}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="remaining">Remaining Miles</option>
            <option value="status">Status</option>
            <option value="name">Truck Name</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredAndSortedTrucks.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-center">
          <p className="text-xs text-slate-500">
            {filter === "all" ? "No trucks found." : `No trucks with ${filter} status.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Truck Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Current Mileage
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Oil Change
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Remaining Miles
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAndSortedTrucks.map((truck) => (
                  <tr key={truck.vehicleName} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-900">{truck.vehicleName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-900">{formatMiles(truck.currentMileage)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-900">
                        {formatMiles(truck.lastOilChangeMileage)} miles
                        <br />
                        <span className="text-xs text-slate-500">{formatDate(truck.lastOilChangeDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-900">{formatMiles(truck.nextDueMileage)} miles</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-900">
                        {truck.remainingMiles !== null
                          ? `${formatMiles(truck.remainingMiles)} miles`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(
                          truck.status
                        )}`}
                      >
                        {truck.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => openResetModal(truck)}
                        disabled={resettingTruck === truck.vehicleName}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          resettingTruck === truck.vehicleName
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {resettingTruck === truck.vehicleName ? "Resetting..." : "Reset"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && selectedTruck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-slate-900">Reset Oil Change</h2>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedTruck(null);
                    setResetMileage("");
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-600 mb-1.5">
                  Reset oil change for <strong>{selectedTruck.vehicleName}</strong>?
                </p>
                <p className="text-xs text-slate-500">
                  Current mileage: {formatMiles(selectedTruck.currentMileage)}
                  <br />
                  Last oil change: {formatMiles(selectedTruck.lastOilChangeMileage)} miles
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mileage (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={resetMileage}
                    onChange={(e) => setResetMileage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder={selectedTruck.currentMileage?.toString() || "Enter mileage"}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave empty to use current mileage ({formatMiles(selectedTruck.currentMileage)})
                  </p>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setSelectedTruck(null);
                      setResetMileage("");
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-xs font-medium"
                    disabled={resettingTruck === selectedTruck.vehicleName}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resettingTruck === selectedTruck.vehicleName}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    {resettingTruck === selectedTruck.vehicleName ? "Resetting..." : "Reset Oil Change"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
