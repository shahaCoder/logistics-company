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
      <div className="mb-6">
        <Link
          href="/internal-driver-portal-7v92nx/trucks"
          className="text-xs text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Trucks
        </Link>
        
        {/* Truck Header Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{truck.make} {truck.model}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{truck.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-mono">{truck.vin}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{truck.plate} ({truck.plateState})</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Current Miles</div>
              <div className="text-3xl font-bold">{formatMiles(truck.currentMiles)}</div>
              {truck.driver && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Assigned Driver</div>
                  <div className="text-sm font-semibold">{truck.driver}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tire Pressure - Enhanced Design */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-slate-900">Tire Pressure & Temperature</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {truck.tirePressures.map((tire, idx) => (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      tire.status === "critical"
                        ? "border-red-300 bg-gradient-to-br from-red-50 to-red-100/50"
                        : tire.status === "warning"
                        ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50"
                        : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">{tire.position}</span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          Updated {new Date(tire.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          tire.status
                        )}`}
                      >
                        {tire.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Pressure */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-600">Pressure</span>
                          <span className="text-base font-bold text-slate-900">{tire.pressure} <span className="text-xs font-normal text-slate-500">PSI</span></span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              tire.pressure < 95
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : tire.pressure < 100
                                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                            }`}
                            style={{ width: `${Math.min((tire.pressure / 110) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-slate-400">80</span>
                          <span className="text-xs text-slate-400">110 PSI</span>
                        </div>
                      </div>
                      
                      {/* Temperature */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600">Temperature</span>
                          <span className="text-sm font-semibold text-slate-900">{tire.temperature}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Metrics - Enhanced Design */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-slate-900">Safety Performance Metrics</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {truck.safetyMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="group relative p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-900 pr-2">{metric.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getTrendIcon(metric.trend)}
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            metric.status
                          )}`}
                        >
                          {metric.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-slate-900">
                        {metric.value}
                        <span className="text-sm font-normal text-slate-500 ml-1">{metric.unit}</span>
                      </div>
                    </div>
                    {/* Enhanced bar chart */}
                    <div className="relative">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            metric.status === "critical"
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : metric.status === "warning"
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          }`}
                          style={{
                            width: `${Math.min((metric.value / 10) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Vehicle Info - Enhanced */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Vehicle Information</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Current Miles</span>
                  <span className="text-sm font-bold text-slate-900">{formatMiles(truck.currentMiles)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Engine Hours</span>
                  <span className="text-sm font-bold text-slate-900">{truck.engineHours.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Fuel Level - Enhanced */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Fuel Level</span>
                  <span className="text-lg font-bold text-slate-900">{truck.fuelLevel}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      truck.fuelLevel < 20
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : truck.fuelLevel < 40
                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    }`}
                    style={{ width: `${truck.fuelLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Engine Status - Enhanced */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Engine Status</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Battery Voltage</span>
                  <span className="text-base font-bold text-slate-900">{truck.batteryVoltage}V</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      truck.batteryVoltage < 12.0
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : truck.batteryVoltage < 12.4
                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    }`}
                    style={{ width: `${Math.min((truck.batteryVoltage / 14) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">10V</span>
                  <span className="text-xs text-slate-400">14V</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Coolant Temperature</span>
                  <span className="text-base font-bold text-slate-900">{truck.coolantTemperature}°F</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      truck.coolantTemperature > 220
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : truck.coolantTemperature > 210
                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    }`}
                    style={{ width: `${Math.min(((truck.coolantTemperature - 160) / 80) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">160°F</span>
                  <span className="text-xs text-slate-400">240°F</span>
                </div>
              </div>
            </div>
          </div>

          {/* Oil Change Info - Enhanced */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Oil Change</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Change</span>
                  <span className="font-semibold text-slate-900">
                    {truck.lastOilChangeMiles
                      ? formatMiles(truck.lastOilChangeMiles)
                      : "N/A"}{" "}
                    miles
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Next Due</span>
                  <span className="font-semibold text-slate-900">
                    {truck.lastOilChangeMiles
                      ? formatMiles(truck.lastOilChangeMiles + truck.oilChangeIntervalMiles)
                      : "N/A"}{" "}
                    miles
                  </span>
                </div>
              </div>
              {truck.lastOilChangeMiles && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-600">Remaining</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatMiles(
                        Math.max(
                          0,
                          truck.lastOilChangeMiles +
                            truck.oilChangeIntervalMiles -
                            truck.currentMiles
                        )
                      )}{" "}
                      <span className="text-xs font-normal text-slate-500">miles</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        truck.currentMiles - truck.lastOilChangeMiles >
                        truck.oilChangeIntervalMiles * 0.9
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : truck.currentMiles - truck.lastOilChangeMiles >
                            truck.oilChangeIntervalMiles * 0.75
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600"
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
