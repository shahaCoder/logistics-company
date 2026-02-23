"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface TruckDetails {
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
  plate?: string | null;
  driver?: string | null;
  year?: string | null;
  make?: string | null;
  model?: string | null;
  vin?: string | null;
  engineState?: string | null;
  location?: string | null;
  locationTime?: string | null;
  lastTripEndMs?: number | null;
}

function formatAgo(ms: number | null | undefined): string {
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

export default function TruckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [truck, setTruck] = useState<TruckDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTruckDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks/${id}?live=1`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (response.status === 404) {
        setError("Truck not found");
        setTruck(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load truck");
      }

      const data = await response.json();
      setTruck(data);
    } catch (err) {
      console.error("Error fetching truck details:", err);
      setError(err instanceof Error ? err.message : "Failed to load truck");
      setTruck(null);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTruckDetails();
  }, [fetchTruckDetails]);

  const formatMiles = (miles: number) => miles.toLocaleString();

  const displayStatus = truck?.status === "Overdue" || truck?.status === "Soon" ? "Needs attention" : "Good";

  if (loading) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <div className="text-center text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !truck) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <Link
          href="/internal-driver-portal-7v92nx/trucks"
          className="text-xs text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-1"
        >
          ← Back to Trucks
        </Link>
        <div className="text-center text-red-600 text-sm mt-8">{error ?? "Truck not found"}</div>
      </div>
    );
  }

  const title = [truck.make, truck.model].filter(Boolean).join(" ") || truck.name;

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <Link
        href="/internal-driver-portal-7v92nx/trucks"
        className="text-xs text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-1"
      >
        ← Back to Trucks
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
              <span>Name: {truck.name}</span>
              {truck.vin && <span className="font-mono">{truck.vin}</span>}
              {truck.plate && <span>{truck.plate}</span>}
              {truck.year && <span>Year: {truck.year}</span>}
              {truck.samsaraVehicleId && (
                <span className="text-slate-400 font-mono">Samsara: {truck.samsaraVehicleId}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">Current miles</div>
              <div className="text-2xl font-bold text-slate-900">{formatMiles(truck.currentMiles)}</div>
              {truck.currentMilesUpdatedAt && (
                <div className="text-[10px] text-slate-400">
                  Updated {new Date(truck.currentMilesUpdatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <span
              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                displayStatus === "Needs attention" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {displayStatus}
            </span>
            {truck.driver && (
              <div className="text-right">
                <div className="text-xs text-slate-500">Driver</div>
                <div className="text-sm font-semibold text-slate-900">{truck.driver}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Oil change – real data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Oil change</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Last change (miles)</span>
                  <span className="font-semibold text-slate-900">
                    {truck.lastOilChangeMiles != null ? formatMiles(truck.lastOilChangeMiles) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Interval (miles)</span>
                  <span className="font-semibold text-slate-900">{formatMiles(truck.oilChangeIntervalMiles)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Miles since last change</span>
                  <span className="font-semibold text-slate-900">{formatMiles(truck.milesSinceLastOilChange)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Miles until next</span>
                  <span className="font-semibold text-slate-900">{formatMiles(truck.milesUntilNextOilChange)}</span>
                </div>
              </div>
              {truck.lastOilChangeAt && (
                <p className="text-xs text-slate-500">
                  Last oil change date: {new Date(truck.lastOilChangeAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle info sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Vehicle info</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Make</span>
                <span className="text-slate-900">{truck.make ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model</span>
                <span className="text-slate-900">{truck.model ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Year</span>
                <span className="text-slate-900">{truck.year ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plate</span>
                <span className="text-slate-900">{truck.plate ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VIN</span>
                <span className="text-slate-900 font-mono text-xs">{truck.vin ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Live status (Samsara)</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Engine</span>
                <span className="text-slate-900">
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
                    "—"
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Location</span>
                <span className="text-slate-900">{truck.location ?? "—"}</span>
                {truck.locationTime && (
                  <div className="text-[10px] text-slate-400 mt-0.5">{formatLocationTime(truck.locationTime)}</div>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Last trip</span>
                <span className="text-slate-900">{formatAgo(truck.lastTripEndMs)}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Plate, driver, year, make, model and VIN come from Samsara when Samsara Vehicle ID is set. If they are missing, check the truck’s Samsara link and API token.
          </p>
        </div>
      </div>
    </div>
  );
}
