"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface TirePressure {
  position: string;
  pressure: number; // PSI
  temperature: number; // Celsius
  status: "normal" | "warning" | "critical";
  lastUpdated: string;
}

interface SafetyMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface TruckDetails {
  id: string;
  name: string;
  samsaraVehicleId: string | null;
  currentMiles: number;
  currentMilesUpdatedAt: string | null;
  lastOilChangeMiles: number | null;
  lastOilChangeAt: string | null;
  oilChangeIntervalMiles: number;
  tirePressures: TirePressure[];
  safetyMetrics: SafetyMetric[];
  engineHours: number;
  fuelLevel: number; // percentage
  batteryVoltage: number;
  coolantTemperature: number;
}

export default function TruckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [truck, setTruck] = useState<TruckDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTruckDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks/${id}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      // For now, use static data
      const staticData: TruckDetails = {
        id: id,
        name: `Truck-${id.padStart(3, "0")}`,
        samsaraVehicleId: "123456789",
        currentMiles: 125000,
        currentMilesUpdatedAt: new Date().toISOString(),
        lastOilChangeMiles: 120000,
        lastOilChangeAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        oilChangeIntervalMiles: 15000,
        tirePressures: [
          {
            position: "Front Left",
            pressure: 105,
            temperature: 45,
            status: "normal",
            lastUpdated: new Date().toISOString(),
          },
          {
            position: "Front Right",
            pressure: 103,
            temperature: 47,
            status: "normal",
            lastUpdated: new Date().toISOString(),
          },
          {
            position: "Rear Left Outer",
            pressure: 95,
            temperature: 52,
            status: "warning",
            lastUpdated: new Date().toISOString(),
          },
          {
            position: "Rear Left Inner",
            pressure: 98,
            temperature: 50,
            status: "normal",
            lastUpdated: new Date().toISOString(),
          },
          {
            position: "Rear Right Outer",
            pressure: 100,
            temperature: 48,
            status: "normal",
            lastUpdated: new Date().toISOString(),
          },
          {
            position: "Rear Right Inner",
            pressure: 97,
            temperature: 51,
            status: "normal",
            lastUpdated: new Date().toISOString(),
          },
        ],
        safetyMetrics: [
          {
            name: "Hard Braking Events",
            value: 2,
            unit: "events",
            status: "good",
            trend: "down",
          },
          {
            name: "Hard Acceleration",
            value: 5,
            unit: "events",
            status: "good",
            trend: "stable",
          },
          {
            name: "Speeding Incidents",
            value: 1,
            unit: "incidents",
            status: "good",
            trend: "down",
          },
          {
            name: "Idle Time",
            value: 8.5,
            unit: "hours",
            status: "warning",
            trend: "up",
          },
          {
            name: "Fuel Efficiency",
            value: 6.8,
            unit: "mpg",
            status: "good",
            trend: "up",
          },
        ],
        engineHours: 3420,
        fuelLevel: 65,
        batteryVoltage: 12.6,
        coolantTemperature: 195,
      };

      setTruck(staticData);
    } catch (error) {
      console.error("Error fetching truck details:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTruckDetails();
  }, [fetchTruckDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
      case "normal":
        return "text-emerald-700 bg-emerald-100";
      case "warning":
        return "text-amber-700 bg-amber-100";
      case "critical":
        return "text-red-700 bg-red-100";
      default:
        return "text-slate-700 bg-slate-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return (
          <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
      case "down":
        return (
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const formatMiles = (miles: number) => {
    return miles.toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="text-center text-slate-500 text-xs">Loading...</div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="text-center text-red-600 text-xs">Truck not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-5">
        <Link
          href="/internal-driver-portal-7v92nx/trucks"
          className="text-xs text-slate-600 hover:text-slate-900 mb-3 inline-flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Trucks
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">{truck.name}</h1>
        <p className="text-xs text-slate-500 mt-1">
          Samsara ID: {truck.samsaraVehicleId || "N/A"} • {formatMiles(truck.currentMiles)} miles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tire Pressure */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Tire Pressure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {truck.tirePressures.map((tire, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md border ${
                    tire.status === "critical"
                      ? "border-red-300 bg-red-50"
                      : tire.status === "warning"
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-900">{tire.position}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                        tire.status
                      )}`}
                    >
                      {tire.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Pressure:</span>
                      <span className="text-xs font-semibold text-slate-900">{tire.pressure} PSI</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tire.pressure < 95
                            ? "bg-red-500"
                            : tire.pressure < 100
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${(tire.pressure / 110) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-600">Temperature:</span>
                      <span className="text-xs font-semibold text-slate-900">{tire.temperature}°C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Metrics */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Safety Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {truck.safetyMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-900">{metric.name}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                          metric.status
                        )}`}
                      >
                        {metric.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {metric.value} <span className="text-xs font-normal text-slate-600">{metric.unit}</span>
                  </div>
                  {/* Simple bar chart */}
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === "critical"
                          ? "bg-red-500"
                          : metric.status === "warning"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min((metric.value / 10) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Vehicle Information</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Current Miles:</span>
                <span className="font-medium text-slate-900">{formatMiles(truck.currentMiles)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Engine Hours:</span>
                <span className="font-medium text-slate-900">{truck.engineHours.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fuel Level:</span>
                <span className="font-medium text-slate-900">{truck.fuelLevel}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${
                    truck.fuelLevel < 20
                      ? "bg-red-500"
                      : truck.fuelLevel < 40
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${truck.fuelLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Engine Status */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Engine Status</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Battery Voltage</span>
                  <span className="text-xs font-medium text-slate-900">{truck.batteryVoltage}V</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      truck.batteryVoltage < 12.0
                        ? "bg-red-500"
                        : truck.batteryVoltage < 12.4
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${(truck.batteryVoltage / 14) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Coolant Temperature</span>
                  <span className="text-xs font-medium text-slate-900">{truck.coolantTemperature}°F</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      truck.coolantTemperature > 220
                        ? "bg-red-500"
                        : truck.coolantTemperature > 210
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${((truck.coolantTemperature - 160) / 80) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Oil Change Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Oil Change</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Last Change:</span>
                <span className="font-medium text-slate-900">
                  {truck.lastOilChangeMiles
                    ? formatMiles(truck.lastOilChangeMiles)
                    : "N/A"}{" "}
                  miles
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Next Due:</span>
                <span className="font-medium text-slate-900">
                  {truck.lastOilChangeMiles
                    ? formatMiles(truck.lastOilChangeMiles + truck.oilChangeIntervalMiles)
                    : "N/A"}{" "}
                  miles
                </span>
              </div>
              {truck.lastOilChangeMiles && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Remaining:</span>
                    <span className="font-medium text-slate-900">
                      {formatMiles(
                        Math.max(
                          0,
                          truck.lastOilChangeMiles +
                            truck.oilChangeIntervalMiles -
                            truck.currentMiles
                        )
                      )}{" "}
                      miles
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        truck.currentMiles - truck.lastOilChangeMiles >
                        truck.oilChangeIntervalMiles * 0.9
                          ? "bg-red-500"
                          : truck.currentMiles - truck.lastOilChangeMiles >
                            truck.oilChangeIntervalMiles * 0.75
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          ((truck.currentMiles - truck.lastOilChangeMiles) /
                            truck.oilChangeIntervalMiles) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
