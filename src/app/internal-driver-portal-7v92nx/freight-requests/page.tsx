"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface FreightRequest {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string;
  phone: string;
  isBroker: boolean;
  equipment: string | null;
  cargo: string | null;
  weight: string | null;
  pallets: string | null;
  pickupAddress: string;
  pickupDate: string | null;
  pickupTime: string | null;
  deliveryAddress: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FreightRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<FreightRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FreightRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());

      const response = await fetch(`${apiUrl}/api/admin/requests/freight?${params}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      const data = await response.json();
      setRequests(data.requests || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Error fetching freight requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, router]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleView = useCallback((request: FreightRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, contactName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!confirm(`Are you sure you want to delete the freight request from ${contactName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/requests/freight/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete request");
      }

      fetchRequests();
      if (selectedRequest?.id === id) {
        setIsModalOpen(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, [selectedRequest, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Freight Quote Requests</h1>
        <p className="mt-1 text-xs text-slate-500">
          View and manage freight quote requests from brokers and shippers
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
        <div>
          <label htmlFor="freight-search" className="block text-xs font-medium text-slate-700 mb-1.5">
            Search
          </label>
          <input
            id="freight-search"
            name="freight-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Company name, contact name, email, phone..."
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No requests found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {requests.map((request) => (
                    <tr 
                      key={request.id} 
                      className="hover:bg-slate-50:bg-slate-800/50 cursor-pointer transition-colors"
                      onClick={() => handleView(request)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div className="font-medium text-slate-900">{request.contactName}</div>
                          <div className="text-slate-500">{request.email}</div>
                          {request.isBroker && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">
                              Broker
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-900">
                          {request.companyName || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(request);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-t border-slate-200">
                <div className="text-xs text-slate-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} results
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 border border-slate-300 rounded-md text-xs bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-2.5 py-1 border border-slate-300 rounded-md text-xs bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all border border-slate-200">
              <div className="bg-red-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">
                  Freight Quote Request Details
                </h2>
              </div>

              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-slate-200 pb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.contactName}</span>
                      </div>
                      {selectedRequest.companyName && (
                        <div>
                          <span className="font-medium text-gray-700">Company:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.companyName}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-900">{selectedRequest.phone}</span>
                      </div>
                      {selectedRequest.isBroker && (
                        <div>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Broker
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Freight Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-slate-200 pb-2">Freight Details</h3>
                    <div className="space-y-2 text-sm">
                      {selectedRequest.equipment && (
                        <div>
                          <span className="font-medium text-gray-700">Equipment:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.equipment}</span>
                        </div>
                      )}
                      {selectedRequest.cargo && (
                        <div>
                          <span className="font-medium text-gray-700">Cargo:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.cargo}</span>
                        </div>
                      )}
                      {selectedRequest.weight && (
                        <div>
                          <span className="font-medium text-gray-700">Weight:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.weight} lbs</span>
                        </div>
                      )}
                      {selectedRequest.pallets && (
                        <div>
                          <span className="font-medium text-gray-700">Pallets:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.pallets}</span>
                        </div>
                      )}
                      {selectedRequest.referenceId && (
                        <div>
                          <span className="font-medium text-gray-700">Ref/PO:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.referenceId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pickup Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-slate-200 pb-2">Pickup Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <div className="mt-1 text-gray-900">{selectedRequest.pickupAddress}</div>
                      </div>
                      {selectedRequest.pickupDate && (
                        <div>
                          <span className="font-medium text-gray-700">Date:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.pickupDate}</span>
                        </div>
                      )}
                      {selectedRequest.pickupTime && (
                        <div>
                          <span className="font-medium text-gray-700">Time:</span>
                          <span className="ml-2 text-gray-900">{selectedRequest.pickupTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-slate-200 pb-2">Delivery Information</h3>
                    {selectedRequest.deliveryAddress ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Address:</span>
                          <div className="mt-1 text-gray-900">{selectedRequest.deliveryAddress}</div>
                        </div>
                        {selectedRequest.deliveryDate && (
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <span className="ml-2 text-gray-900">{selectedRequest.deliveryDate}</span>
                          </div>
                        )}
                        {selectedRequest.deliveryTime && (
                          <div>
                            <span className="font-medium text-gray-700">Time:</span>
                            <span className="ml-2 text-gray-900">{selectedRequest.deliveryTime}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Not specified</div>
                    )}
                  </div>

                  {/* Notes */}
                  {selectedRequest.notes && (
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-slate-200 pb-2">Additional Notes</h3>
                      <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                        {selectedRequest.notes}
                      </div>
                    </div>
                  )}

                  {/* Submitted Date */}
                  <div className="md:col-span-2 pt-4 border-t border-slate-200">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

