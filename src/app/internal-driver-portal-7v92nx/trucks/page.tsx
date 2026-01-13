"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Truck {
  id: string;
  name: string;
  currentMiles: number;
  lastOilChangeMiles: number;
  oilChangeIntervalMiles: number;
  milesSinceLastOilChange: number;
  milesUntilNextOilChange: number;
  status: "good" | "overdue";
  createdAt: string;
  updatedAt: string;
}

export default function TrucksPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const fetchTrucks = async () => {
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
      setTrucks(data);
    } catch (error) {
      console.error("Error fetching trucks:", error);
      alert("Failed to load trucks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleResetOilChange = async (truckId: string, truckName: string) => {
    if (!confirm(`Reset oil change for ${truckName}? This will set the last oil change miles to the current miles.`)) {
      return;
    }

    setResettingId(truckId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks/${truckId}/reset-oil-change`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to reset oil change");
      }

      // Refresh the list
      await fetchTrucks();
    } catch (error) {
      console.error("Error resetting oil change:", error);
      alert("Failed to reset oil change. Please try again.");
    } finally {
      setResettingId(null);
    }
  };

  const formatMiles = (miles: number): string => {
    return miles.toLocaleString("en-US");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-300";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "good":
        return "Good";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500">Loading trucks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trucks & Oil Change Status</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track oil change status for all trucks
        </p>
      </div>

      {trucks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No trucks found. Add trucks to start tracking.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Truck Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Miles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miles Since Last Oil Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miles Until Next Oil Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trucks.map((truck) => (
                  <tr key={truck.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{truck.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatMiles(truck.currentMiles)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatMiles(truck.milesSinceLastOilChange)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {truck.milesUntilNextOilChange > 0
                          ? formatMiles(truck.milesUntilNextOilChange)
                          : "0 (Overdue)"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          truck.status
                        )}`}
                      >
                        {getStatusText(truck.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleResetOilChange(truck.id, truck.name)}
                        disabled={resettingId === truck.id}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          resettingId === truck.id
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {resettingId === truck.id ? "Resetting..." : "Reset Oil Change"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
