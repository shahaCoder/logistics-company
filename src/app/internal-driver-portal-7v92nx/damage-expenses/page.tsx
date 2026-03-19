"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DamageExpense = {
  id: string;
  dateReported: string;
  vehicleId: string;
  vehicleType: "TRUCK" | "TRAILER";
  category: string;
  totalCost: string;
  companyShare: string;
  driverShare: string;
  description: string | null;
  responsibleDriverId: string | null;
  status: string;
  photos?: string[] | null;
  invoices?: string[] | null;
  repairEstimates?: string[] | null;
  receipts?: string[] | null;
  severity?: "MINOR" | "MAJOR" | "CRITICAL";
  paid?: boolean;
  insuranceClaimNumber?: string | null;
  insuranceCoveredAmount?: string | null;
  insuranceDeductible?: string | null;
  insuranceStatus?: string | null;
};

const DRIVER_OPTIONS = [
  "Sinvil Alain",
  "Behzod Rahimov",
  "Bohodir Shavkiev",
  "Claudel Jacinte",
  "Dilshod Mahmud",
  "Elmurod Khaydarov",
  "Faridun Boymukhammadov",
  "Jamal El Hadrati",
  "Juan Alfaro",
  "Karomatillo Ismoilov",
  "Khushvakht Abdugaforov",
  "Luten Berlus",
  "Mukhammadali Sadridinov",
  "Navruz Toshboltaev",
  "Nozim Behbudi",
  "Nzitabakuze Hagenimana",
  "Patrick Shema",
  "Ritchy Charles",
  "Sardor Djalolov",
  "Sardor Hidirov",
  "Sony Joseph",
  "Steeve Jean",
  "Ted Pierre",
  "Vianney Bizimungu",
  "Vohidjon Shavkiev",
  "Widno Bernabe",
  "Zhafar Zarifov",
];

export default function DamageExpensesPage() {
  const router = useRouter();
  const [items, setItems] = useState<DamageExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [form, setForm] = useState({
    dateReported: new Date().toISOString().slice(0, 10),
    vehicleId: "",
    vehicleType: "TRUCK" as "TRUCK" | "TRAILER",
    category: "",
    description: "",
    totalCost: "",
    responsibleDriverId: "",
    photos: [] as string[],
    invoices: [] as string[],
    repairEstimates: [] as string[],
    receipts: [] as string[],
    companyPaysAll: true,
    severity: "MINOR" as "MINOR" | "MAJOR" | "CRITICAL",
    paid: false,
    insuranceClaimNumber: "",
    insuranceCoveredAmount: "",
    insuranceDeductible: "",
    insuranceStatus: "",
  });

  const summary = useMemo(() => {
    if (!items.length) {
      return { total: 0, open: 0, inProgress: 0, closed: 0, totalAmount: 0 };
    }
    let open = 0;
    let inProgress = 0;
    let closed = 0;
    let totalAmount = 0;
    for (const item of items) {
      const status = item.status;
      if (status === "OPEN") open += 1;
      else if (status === "IN_PROGRESS") inProgress += 1;
      else if (status === "CLOSED") closed += 1;
      const amount = Number(item.totalCost) || 0;
      totalAmount += amount;
    }
    return {
      total: items.length,
      open,
      inProgress,
      closed,
      totalAmount,
    };
  }, [items]);

  const resetForm = () => {
    setForm({
      dateReported: new Date().toISOString().slice(0, 10),
      vehicleId: "",
      vehicleType: "TRUCK",
      category: "",
      description: "",
      totalCost: "",
      responsibleDriverId: "",
      photos: [],
      invoices: [],
      repairEstimates: [],
      receipts: [],
      companyPaysAll: true,
      severity: "MINOR",
      paid: false,
      insuranceClaimNumber: "",
      insuranceCoveredAmount: "",
      insuranceDeductible: "",
      insuranceStatus: "",
    });
    setFormError(null);
    setEditingId(null);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/admin/damage-expenses`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load damage expenses");
      }
      const json = await res.json();
      setItems(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePhotoFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadPhotos(Array.from(files));
    e.target.value = "";
  };

  const uploadPhotos = async (files: File[]) => {
    if (!files.length) return;

    setPhotoUploading(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(
        `${apiUrl}/api/admin/damage-expenses/photos`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload photos");
      }

      const data = await res.json();
      const urls: string[] = Array.isArray(data.photos) ? data.photos : [];

      setForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...urls],
      }));
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error ? err.message : "Failed to upload photos"
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  const uploadDocuments = async (files: File[], kind: "invoice" | "estimate" | "receipt") => {
    if (!files.length) return;

    setPhotoUploading(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(
        `${apiUrl}/api/admin/damage-expenses/documents?kind=${kind}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload documents");
      }

      const data = await res.json();
      const urls: string[] = Array.isArray(data.documents)
        ? data.documents
        : [];

      setForm((prev) => {
        if (kind === "invoice") {
          return { ...prev, invoices: [...prev.invoices, ...urls] };
        }
        if (kind === "estimate") {
          return {
            ...prev,
            repairEstimates: [...prev.repairEstimates, ...urls],
          };
        }
        return { ...prev, receipts: [...prev.receipts, ...urls] };
      });
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error ? err.message : "Failed to upload documents"
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  const openEdit = async (id: string) => {
    try {
      setFormError(null);
      setEditingId(id);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/admin/damage-expenses/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load damage expense");
      }

      const json = await res.json();
      const item: DamageExpense = json.data ?? json;

      setForm({
        dateReported: item.dateReported.slice(0, 10),
        vehicleId: item.vehicleId,
        vehicleType: item.vehicleType,
        category: item.category,
        description: item.description ?? "",
        totalCost: String(item.totalCost),
        responsibleDriverId: item.responsibleDriverId || "",
        photos: (item.photos as string[]) || [],
        invoices: (item.invoices as string[]) || [],
        repairEstimates: (item.repairEstimates as string[]) || [],
        receipts: (item.receipts as string[]) || [],
        companyPaysAll:
          Number(item.companyShare) >= Number(item.totalCost),
        severity: item.severity || "MINOR",
        paid: Boolean(item.paid),
        insuranceClaimNumber: item.insuranceClaimNumber || "",
        insuranceCoveredAmount: item.insuranceCoveredAmount
          ? String(item.insuranceCoveredAmount)
          : "",
        insuranceDeductible: item.insuranceDeductible
          ? String(item.insuranceDeductible)
          : "",
        insuranceStatus: item.insuranceStatus || "",
      });

      setShowNewModal(true);
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error ? err.message : "Failed to open expense"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.vehicleId.trim()) {
      setFormError("Vehicle ID is required.");
      return;
    }
    if (!form.totalCost) {
      setFormError("Total cost is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const url = editingId
        ? `${apiUrl}/api/admin/damage-expenses/${editingId}`
        : `${apiUrl}/api/admin/damage-expenses`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          totalCost: Number(form.totalCost),
          companyShare: form.companyPaysAll ? Number(form.totalCost) : 0,
          driverShare: form.companyPaysAll ? 0 : Number(form.totalCost),
          responsibleDriverId: form.responsibleDriverId || null,
          photos: form.photos,
          invoices: form.invoices,
          repairEstimates: form.repairEstimates,
          receipts: form.receipts,
          severity: form.severity,
          paid: form.paid,
          insuranceClaimNumber:
            form.insuranceClaimNumber.trim().length > 0
              ? form.insuranceClaimNumber.trim()
              : null,
          insuranceCoveredAmount: form.insuranceCoveredAmount
            ? Number(form.insuranceCoveredAmount)
            : null,
          insuranceDeductible: form.insuranceDeductible
            ? Number(form.insuranceDeductible)
            : null,
          insuranceStatus:
            form.insuranceStatus.trim().length > 0
              ? form.insuranceStatus.trim()
              : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Failed to create damage expense"
        );
      }

      setShowNewModal(false);
      resetForm();
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create damage expense"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Damage Expenses
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track repair costs for trucks and trailers
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowNewModal(true);
            }}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            + New damage expense
          </button>
        </div>

        {summary.total > 0 && (
          <div className="mb-4 rounded-md bg-white border border-slate-200 px-4 py-3">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Total records
                </span>
                <span className="mt-1 text-lg font-semibold text-slate-900">
                  {summary.total}
                </span>
              </div>
              <div className="flex flex-col md:border-l md:border-slate-100 md:pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Open
                </span>
                <span className="mt-1 text-lg font-semibold text-amber-700">
                  {summary.open}
                </span>
              </div>
              <div className="flex flex-col md:border-l md:border-slate-100 md:pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  In progress
                </span>
                <span className="mt-1 text-lg font-semibold text-sky-700">
                  {summary.inProgress}
                </span>
              </div>
              <div className="flex flex-col md:border-l md:border-slate-100 md:pl-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Total amount
                </span>
                <span className="mt-1 text-lg font-semibold text-slate-900">
                  ${summary.totalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 border-l-4 border-red-600 bg-red-50 px-3 py-3 rounded-md text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-xs text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            No damage expenses found.
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Vehicle
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Category
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Severity
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Total
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Company
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Driver
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Payment
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 w-px">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 text-xs cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/internal-driver-portal-7v92nx/damage-expenses/${item.id}`
                      )
                    }
                  >
                    <td className="px-4 py-2.5 text-slate-900">
                      {new Date(item.dateReported).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-4 py-2.5 text-slate-900">
                      {item.vehicleId}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {item.vehicleType}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {item.category}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : item.severity === "MAJOR"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.severity || "MINOR"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-900">
                      ${item.totalCost}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      ${item.companyShare}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {item.responsibleDriverId || "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.paid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {item.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                        <button
                          type="button"
                          onClick={() => openEdit(item.id)}
                          className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Delete this damage expense record?"
                              )
                            ) {
                              return;
                            }
                            try {
                              const apiUrl =
                                process.env.NEXT_PUBLIC_API_URL ||
                                "http://localhost:4000";
                              const res = await fetch(
                                `${apiUrl}/api/admin/damage-expenses/${item.id}`,
                                {
                                  method: "DELETE",
                                  credentials: "include",
                                }
                              );
                              if (!res.ok) {
                                throw new Error("Failed to delete");
                              }
                              await load();
                            } catch (err) {
                              console.error(err);
                              alert("Failed to delete record");
                            }
                          }}
                          className="inline-flex items-center rounded-md border border-red-600 px-2 py-1 ml-2 text-[11px] font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-lg bg-white shadow-lg">
            <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? "Edit damage expense" : "New damage expense"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setShowNewModal(false);
                  }
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3 text-xs">
              {formError && (
                <div className="border-l-4 border-red-600 bg-red-50 px-3 py-2 rounded text-[11px] text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Date reported
                  </label>
                  <input
                    type="date"
                    name="dateReported"
                    value={form.dateReported}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Vehicle ID
                  </label>
                  <input
                    type="text"
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    placeholder="e.g. 714"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Vehicle type
                  </label>
                  <select
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="TRUCK">Truck</option>
                    <option value="TRAILER">Trailer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="">Select</option>
                    <option value="Body">Body</option>
                    <option value="Tires">Tires</option>
                    <option value="Engine">Engine</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Total cost
                  </label>
                  <input
                    type="number"
                    name="totalCost"
                    value={form.totalCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Responsible driver
                  </label>
                  <select
                    name="responsibleDriverId"
                    value={form.responsibleDriverId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="">Not assigned</option>
                    {DRIVER_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="MINOR">Minor</option>
                    <option value="MAJOR">Major</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-700">
                  <input
                    type="checkbox"
                    name="companyPaysAll"
                    checked={form.companyPaysAll}
                    onChange={handleCheckboxChange}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <span>Company covers full amount</span>
                </label>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  When checked, company share equals total cost and driver share is zero.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Upload invoices (PDF / image)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      await uploadDocuments(Array.from(files), "invoice");
                      e.target.value = "";
                    }}
                    className="block w-full text-[11px] text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-white hover:file:bg-red-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Repair estimate
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      await uploadDocuments(Array.from(files), "estimate");
                      e.target.value = "";
                    }}
                    className="block w-full text-[11px] text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-white hover:file:bg-red-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Receipt
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      await uploadDocuments(Array.from(files), "receipt");
                      e.target.value = "";
                    }}
                    className="block w-full text-[11px] text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-white hover:file:bg-red-700"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Attach photos
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const files = Array.from(e.dataTransfer.files).filter(
                      (file) => file.type.startsWith("image/")
                    );
                    await uploadPhotos(files);
                  }}
                  className={`flex flex-col items-center justify-center rounded-md border border-dashed px-3 py-4 text-[11px] transition-colors ${
                    isDragOver
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-slate-700">
                    Drag and drop images here, or
                    <label className="ml-1 cursor-pointer font-semibold text-slate-900 underline decoration-slate-400 decoration-dotted">
                      browse
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoFilesChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    JPG, PNG, HEIC up to 10 MB each.
                  </p>
                </div>
                {photoUploading && (
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Uploading photos...
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowNewModal(false);
                    }
                  }}
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-red-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

