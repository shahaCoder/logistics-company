"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ContactRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

      const response = await fetch(`${apiUrl}/api/admin/requests/contact?${params}`, {
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
      console.error("Error fetching contact requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, router]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the contact message from ${name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/requests/contact/${id}`, {
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
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Contact Messages</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          View and manage contact messages from the website
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4 mb-4">
        <div>
          <label htmlFor="contact-search" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Search
          </label>
          <input
            id="contact-search"
            name="contact-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Name, email, or message content..."
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No messages found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{request.name}</div>
                          <div className="text-slate-500 dark:text-slate-400">{request.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-900 dark:text-slate-100 max-w-md">
                          {request.message}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} results
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-2.5 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

