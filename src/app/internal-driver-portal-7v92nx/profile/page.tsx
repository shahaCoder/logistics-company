"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });

        if (response.status === 401) {
          router.push("/internal-driver-portal-7v92nx/login");
          return;
        }

        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setName(data.user.name ?? "");
        }
      } catch (err) {
        router.push("/internal-driver-portal-7v92nx/login");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword || confirmPassword) {
      if (newPassword.length < 12) {
        setMessage({ type: "error", text: "New password must be at least 12 characters with upper, lower, number, and special character." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "New password and confirmation do not match." });
        return;
      }
      if (!currentPassword) {
        setMessage({ type: "error", text: "Current password is required to change password." });
        return;
      }
    }

    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const body: { name?: string | null; currentPassword?: string; newPassword?: string } = {
        name: name.trim() || null,
      };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const response = await fetch(`${apiUrl}/api/admin/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Failed to update profile." });
        return;
      }

      setMessage({ type: "success", text: "Profile updated." });
      if (data.user) setUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[200px]"
        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <span className="text-slate-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-xs text-slate-500">Your account settings</p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-xs ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account block */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Account</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="profile-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-500 bg-slate-50 cursor-not-allowed"
                />
                <p className="mt-0.5 text-xs text-slate-500">Email cannot be changed here.</p>
              </div>
              <div>
                <label htmlFor="profile-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Display name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            </div>
          </div>

          {/* Password block */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Change password</h2>
            <p className="text-xs text-slate-500 mb-4">Leave blank to keep your current password.</p>
            <div className="space-y-3">
              <PasswordInput
                id="profile-current-password"
                name="currentPassword"
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Required only if changing password"
              />
              <PasswordInput
                id="profile-new-password"
                name="newPassword"
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={12}
                placeholder="Min 12 chars, upper, lower, number, special"
              />
              <PasswordInput
                id="profile-confirm-password"
                name="confirmPassword"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={12}
                placeholder="Repeat new password"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
