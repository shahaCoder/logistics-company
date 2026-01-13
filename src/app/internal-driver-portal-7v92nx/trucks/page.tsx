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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    currentMiles: "",
    expiresInMiles: "",
    oilChangeIntervalMiles: "10000",
  });

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch trucks");
      }

      const data = await response.json();
      setTrucks(data);
    } catch (error) {
      console.error("Error fetching trucks:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load trucks. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

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

  const handleEditTruck = (truck: Truck) => {
    setEditingTruck(truck);
    const milesUntilNext = truck.milesUntilNextOilChange;
    setFormData({
      name: truck.name,
      currentMiles: truck.currentMiles.toString(),
      expiresInMiles: milesUntilNext > 0 ? milesUntilNext.toString() : "",
      oilChangeIntervalMiles: truck.oilChangeIntervalMiles.toString(),
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTruck) return;
    
    setCreating(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks/${editingTruck.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          currentMiles: formData.currentMiles ? parseInt(formData.currentMiles) : undefined,
          oilChangeIntervalMiles: formData.oilChangeIntervalMiles ? parseInt(formData.oilChangeIntervalMiles) : undefined,
        }),
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update truck");
      }

      setShowEditModal(false);
      setEditingTruck(null);
      setFormData({
        name: "",
        currentMiles: "",
        expiresInMiles: "",
        oilChangeIntervalMiles: "10000",
      });
      await fetchTrucks();
    } catch (error) {
      console.error("Error updating truck:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update truck. Please try again.";
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTruck = async (truckId: string, truckName: string) => {
    if (!confirm(`Are you sure you want to delete truck ${truckName}? This action cannot be undone.`)) {
      setOpenMenuId(null);
      return;
    }

    setDeletingId(truckId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks/${truckId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete truck");
      }

      await fetchTrucks();
    } catch (error) {
      console.error("Error deleting truck:", error);
      alert("Failed to delete truck. Please try again.");
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
  };

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/trucks`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          currentMiles: formData.currentMiles ? parseInt(formData.currentMiles) : 0,
          expiresInMiles: formData.expiresInMiles ? parseInt(formData.expiresInMiles) : undefined,
          oilChangeIntervalMiles: formData.oilChangeIntervalMiles ? parseInt(formData.oilChangeIntervalMiles) : 10000,
        }),
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create truck");
      }

      // Close modal and refresh list
      setShowAddModal(false);
      setFormData({
        name: "",
        currentMiles: "",
        expiresInMiles: "",
        oilChangeIntervalMiles: "10000",
      });
      await fetchTrucks();
    } catch (error) {
      console.error("Error creating truck:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create truck. Please try again.";
      alert(errorMessage);
    } finally {
      setCreating(false);
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trucks & Oil Change Status</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track oil change status for all trucks
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Truck
        </button>
      </div>

      {/* Edit Truck Modal */}
      {showEditModal && editingTruck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Truck</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTruck(null);
                    setFormData({
                      name: "",
                      currentMiles: "",
                      expiresInMiles: "",
                      oilChangeIntervalMiles: "10000",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateTruck} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Truck Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="e.g., Truck-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Miles
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentMiles}
                    onChange={(e) => setFormData({ ...formData, currentMiles: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oil Change Interval (Miles)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    value={formData.oilChangeIntervalMiles}
                    onChange={(e) => setFormData({ ...formData, oilChangeIntervalMiles: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="10000"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTruck(null);
                      setFormData({
                        name: "",
                        currentMiles: "",
                        expiresInMiles: "",
                        oilChangeIntervalMiles: "10000",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {creating ? "Updating..." : "Update Truck"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Truck Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Truck</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      name: "",
                      currentMiles: "",
                      expiresInMiles: "",
                      oilChangeIntervalMiles: "10000",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddTruck} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Truck Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="e.g., Truck-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Miles
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentMiles}
                    onChange={(e) => setFormData({ ...formData, currentMiles: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires In (Miles)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.expiresInMiles}
                    onChange={(e) => setFormData({ ...formData, expiresInMiles: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Miles until next oil change"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oil Change Interval (Miles)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    value={formData.oilChangeIntervalMiles}
                    onChange={(e) => setFormData({ ...formData, oilChangeIntervalMiles: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="10000"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        name: "",
                        currentMiles: "",
                        expiresInMiles: "",
                        oilChangeIntervalMiles: "10000",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Truck"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                      <div className="flex items-center gap-2">
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
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === truck.id ? null : truck.id);
                            }}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === truck.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTruck(truck);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTruck(truck.id, truck.name);
                                  }}
                                  disabled={deletingId === truck.id}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                    deletingId === truck.id
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-red-600 hover:bg-gray-100"
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {deletingId === truck.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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
