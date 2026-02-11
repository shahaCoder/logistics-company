"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

export default function AdminsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }
      if (response.status === 403) {
        setError("You do not have permission to view admins.");
        setUsers([]);
        return;
      }

      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (err) {
      setError("Failed to load admins.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.user?.id ?? null);
        }
      } catch {
        // ignore
      }
    };
    fetchMe();
  }, []);

  const handleDelete = async (u: AdminUser) => {
    if (u.id === currentUserId) {
      setError("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete admin "${u.email}"? This cannot be undone.`)) return;
    setError("");
    setDeletingId(u.id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/users/${u.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.status === 401) {
        router.push("/internal-driver-portal-7v92nx/login");
        return;
      }
      if (response.status === 403) {
        setError("You do not have permission to delete admins.");
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete admin.");
        return;
      }
      fetchUsers();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value?.trim();
    const password = (form.querySelector('[name="password"]') as HTMLInputElement)?.value;
    const role = (form.querySelector('[name="role"]') as HTMLSelectElement)?.value as "MANAGER" | "VIEWER";
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value?.trim() || null;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role, name: name || undefined }),
      });

      const data = await response.json();

      if (response.status === 403) {
        setError("You do not have permission to add admins.");
        return;
      }
      if (!response.ok) {
        setError(data.error || "Failed to create admin.");
        return;
      }

      setAddOpen(false);
      form.reset();
      fetchUsers();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editOpen) return;
    setError("");

    const form = e.currentTarget;
    const role = (form.querySelector('[name="role"]') as HTMLSelectElement)?.value as "SUPER_ADMIN" | "MANAGER" | "VIEWER";
    const password = (form.querySelector('[name="password"]') as HTMLInputElement)?.value;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value?.trim() || null;

    const body: { role: string; name?: string | null; password?: string } = { role, name };
    if (password && password.length > 0) body.password = password;

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/users/${editOpen.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 403) {
        setError("You do not have permission to edit admins.");
        return;
      }
      if (!response.ok) {
        setError(data.error || "Failed to update admin.");
        return;
      }

      setEditOpen(null);
      fetchUsers();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Admins</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage admin users. Only super admins can add or edit.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">All admins</span>
          <button
            type="button"
            onClick={() => { setAddOpen(true); setError(""); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add admin
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            {error ? null : "No admins found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900 dark:text-slate-100">{u.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                            : u.role === "MANAGER"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setEditOpen(u); setError(""); }}
                          className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Edit
                        </button>
                        {u.id !== currentUserId ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u.id}
                            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                          >
                            {deletingId === u.id ? "…" : "Delete"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-md w-full p-5 border border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Add admin</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label htmlFor="add-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  id="add-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <PasswordInput
                id="add-password"
                name="password"
                label="Password"
                required
                autoComplete="new-password"
                minLength={12}
                placeholder="Min 12 chars, upper, lower, number, special"
                hint="At least 12 characters, one uppercase, one lowercase, one number, one special character."
              />
              <div>
                <label htmlFor="add-role" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  id="add-role"
                  name="role"
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div>
                <label htmlFor="add-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name (optional)
                </label>
                <input
                  id="add-name"
                  name="name"
                  type="text"
                  maxLength={200}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Display name"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-md"
                >
                  {submitting ? "Creating…" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAddOpen(false); setError(""); }}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-xs font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-md w-full p-5 border border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Edit admin</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{editOpen.email}</p>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label htmlFor="edit-role" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  id="edit-role"
                  name="role"
                  defaultValue={editOpen.role}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name (optional)
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  defaultValue={editOpen.name ?? ""}
                  maxLength={200}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Display name"
                />
              </div>
              <PasswordInput
                id="edit-password"
                name="password"
                label="New password (leave blank to keep)"
                autoComplete="new-password"
                minLength={12}
                placeholder="Min 12 chars, upper, lower, number, special"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-md"
                >
                  {submitting ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditOpen(null); setError(""); }}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-xs font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
