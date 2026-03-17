"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getOilChangeList,
  resetOilChange,
  type OilChangeTruck,
  type OilChangeListResponse,
} from "@/utils/oilChangeApi";

const PAGE_SIZE = 10;
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
  const [currentPage, setCurrentPage] = useState(1);

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
    // Оставляем поле пустым, по умолчанию используем текущий пробег
    setResetMileage("");
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
    return [...filtered].sort((a, b) => {
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
  }, [trucks, filter, sortBy]);

  const totalFiltered = filteredAndSortedTrucks.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const paginatedTrucks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedTrucks.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedTrucks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy]);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "OK":
        return "border-emerald-500 text-emerald-700";
      case "WARNING":
        return "border-amber-500 text-amber-700";
      case "OVERDUE":
        return "border-red-600 text-red-700";
      default:
        return "border-slate-300 text-slate-700";
    }
  }, []);

  const getDisplayStatus = useCallback((status: string): string => {
    if (status === "OK") return "GOOD";
    return status;
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-500 text-xs">
            Loading oil change data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Oil Change Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track and manage oil change status for all trucks
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <label
              htmlFor="oil-change-auto-refresh"
              className="flex items-center gap-1.5 text-slate-700"
            >
              <input
                id="oil-change-auto-refresh"
                name="oil-change-auto-refresh"
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <span>Auto refresh 5 min</span>
            </label>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
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

        {/* Error */}
        {error && (
          <div className="mb-4 border-l-4 border-red-600 bg-red-50 px-3 py-3 rounded-md">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="mb-0.5 text-xs font-semibold text-red-800">
                  Error loading data
                </h3>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary strip */}
        {summary && (
          <div className="mb-6 rounded-md bg-white px-4 py-3 border border-slate-200">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Total trucks
                </span>
                <span className="mt-1 text-xl font-semibold text-slate-900">
                  {summary.total}
                </span>
              </div>
              <div className="flex flex-col md:border-l md:border-slate-100 md:pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Good
                </span>
                <span className="mt-1 text-xl font-semibold text-emerald-700">
                  {summary.ok}
                </span>
              </div>
              <div className="flex flex-col md:border-l md:border-slate-100 md:pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Warning
                </span>
                <span className="mt-1 text-xl font-semibold text-amber-700">
                  {summary.warning}
                </span>
              </div>
              <div className="flex flex-col md:border-l md:border-slate-100 md:pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Overdue
                </span>
                <span className="mt-1 text-xl font-semibold text-red-700">
                  {summary.overdue}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters and sort */}
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] ${
                filter === "all"
                  ? "bg-red-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              All ({trucks.length})
            </button>
            <button
              onClick={() => setFilter("warning")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] ${
                filter === "warning"
                  ? "bg-amber-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Warning ({summary?.warning || 0})
            </button>
            <button
              onClick={() => setFilter("overdue")}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] ${
                filter === "overdue"
                  ? "bg-red-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Overdue ({summary?.overdue || 0})
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Sort by</span>
            <select
              id="oil-change-sort"
              name="oil-change-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "remaining" | "status")
              }
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="remaining">Remaining miles</option>
              <option value="status">Status</option>
              <option value="name">Truck name</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredAndSortedTrucks.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <p className="text-xs text-slate-500">
              {filter === "all"
                ? "No trucks found."
                : `No trucks with ${filter} status.`}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Truck name
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Current mileage
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Last oil change
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Next due
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Remaining miles
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedTrucks.map((truck) => (
                    <tr
                      key={truck.vehicleName}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-xs font-medium text-slate-900">
                          {truck.vehicleName}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-xs text-slate-900">
                          {formatMiles(truck.currentMileage)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-xs text-slate-900">
                          {formatMiles(truck.lastOilChangeMileage)} miles
                          <br />
                          <span className="text-[11px] text-slate-500">
                            {formatDate(truck.lastOilChangeDate)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-xs text-slate-900">
                          {formatMiles(truck.nextDueMileage)} miles
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-xs font-medium text-slate-900">
                          {truck.remainingMiles !== null
                            ? `${formatMiles(truck.remainingMiles)} miles`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getStatusColor(
                            truck.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {getDisplayStatus(truck.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => openResetModal(truck)}
                          disabled={resettingTruck === truck.vehicleName}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            resettingTruck === truck.vehicleName
                              ? "cursor-not-allowed bg-slate-200 text-slate-500"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {resettingTruck === truck.vehicleName
                            ? "Resetting..."
                            : "Reset"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalFiltered > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="text-xs text-slate-600">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, totalFiltered)} of{" "}
                  {totalFiltered} trucks
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reset Modal */}
        {showResetModal && selectedTruck && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            style={{
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl">
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Reset Oil Change
                  </h2>
                  <button
                    onClick={() => {
                      setShowResetModal(false);
                      setSelectedTruck(null);
                      setResetMileage("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                  <p className="mb-1.5 text-xs text-slate-600">
                    Reset oil change for{" "}
                    <strong className="text-slate-900">
                      {selectedTruck.vehicleName}
                    </strong>
                    ?
                  </p>
                  <p className="text-xs text-slate-500">
                    Current mileage: {formatMiles(selectedTruck.currentMileage)}
                    <br />
                    Last oil change:{" "}
                    {formatMiles(selectedTruck.lastOilChangeMileage)} miles
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="oil-change-reset-mileage"
                      className="mb-1 block text-xs font-medium text-slate-700"
                    >
                      Mileage (optional)
                    </label>
                    <input
                      id="oil-change-reset-mileage"
                      name="oil-change-reset-mileage"
                      type="number"
                      min="0"
                      value={resetMileage}
                      onChange={(e) => setResetMileage(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder={
                        selectedTruck.currentMileage?.toString() || "Enter mileage"
                      }
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      If empty, current mileage (
                      {formatMiles(selectedTruck.currentMileage)}) will be used
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
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      disabled={resettingTruck === selectedTruck.vehicleName}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resettingTruck === selectedTruck.vehicleName}
                      className="flex-1 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {resettingTruck === selectedTruck.vehicleName
                        ? "Resetting..."
                        : "Reset oil change"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
