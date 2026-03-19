"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type DamageExpense = {
  id: string;
  dateReported: string;
  vehicleId: string;
  vehicleType: "TRUCK" | "TRAILER";
  category: string;
  description: string | null;
  totalCost: string;
  companyShare: string;
  driverShare: string;
  responsibleDriverId: string | null;
  status: string;
  photos?: string[] | null;
  invoices?: string[] | null;
  repairEstimates?: string[] | null;
  receipts?: string[] | null;
};

export default function DamageExpenseDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [item, setItem] = useState<DamageExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/admin/damage-expenses/${id}`, {
          credentials: "include",
        });
        if (res.status === 404) {
          setError("Damage expense not found.");
          setItem(null);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load damage expense");
        }
        const json = await res.json();
        setItem(json.data ?? json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const photos = (item?.photos as string[] | undefined) ?? [];
  const invoices = (item?.invoices as string[] | undefined) ?? [];
  const estimates = (item?.repairEstimates as string[] | undefined) ?? [];
  const receipts = (item?.receipts as string[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Damage Expense
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Detailed view for audit and documentation
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push("/internal-driver-portal-7v92nx/damage-expenses")
            }
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to list
          </button>
        </div>

        {error && (
          <div className="mb-4 border-l-4 border-red-600 bg-red-50 px-3 py-3 rounded-md text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-xs text-slate-500">Loading...</div>
        ) : !item ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            No data available.
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-slate-500">
                  Summary
                </h2>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                  #{item.id.slice(0, 8)}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Date
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {new Date(item.dateReported).toLocaleDateString("en-US")}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Vehicle
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {item.vehicleId} · {item.vehicleType}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Category
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {item.category}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Total
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    ${Number(item.totalCost).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold tracking-[0.12em] uppercase text-slate-500">
                Cost split
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Company share
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    ${Number(item.companyShare).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Driver share
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    ${Number(item.driverShare).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Responsible driver
                  </div>
                  <div className="mt-1 font-medium text-slate-900">
                    {item.responsibleDriverId || "-"}
                  </div>
                </div>
              </div>
            </section>

            {(invoices.length > 0 ||
              estimates.length > 0 ||
              receipts.length > 0) && (
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold tracking-[0.12em] uppercase text-slate-500">
                  Documents
                </h2>
                <div className="grid gap-6 sm:grid-cols-3 text-xs">
                  {invoices.length > 0 && (
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Invoices
                      </div>
                      <ul className="space-y-1">
                        {invoices.map((url, idx) => (
                          <li key={url} className="truncate">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-900 underline decoration-slate-400 decoration-dotted hover:text-slate-700"
                            >
                              Invoice {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {estimates.length > 0 && (
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Repair estimate
                      </div>
                      <ul className="space-y-1">
                        {estimates.map((url, idx) => (
                          <li key={url} className="truncate">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-900 underline decoration-slate-400 decoration-dotted hover:text-slate-700"
                            >
                              Estimate {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {receipts.length > 0 && (
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Receipt
                      </div>
                      <ul className="space-y-1">
                        {receipts.map((url, idx) => (
                          <li key={url} className="truncate">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-900 underline decoration-slate-400 decoration-dotted hover:text-slate-700"
                            >
                              Receipt {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold tracking-[0.12em] uppercase text-slate-500">
                Description
              </h2>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {item.description || "No description provided."}
              </p>
            </section>


            {photos.length > 0 && (
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xs font-semibold tracking-[0.12em] uppercase text-slate-500">
                  Photos
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {photos.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-md border border-slate-200 bg-black"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Damage photo"
                        className="h-56 w-full object-contain transition-transform group-hover:scale-[1.02]"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

