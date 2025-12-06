"use client";

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";

interface Step4Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
  getValues: UseFormGetValues<DriverApplicationFormData>;
}

export default function Step4EmploymentHistory({
  register,
  errors,
  watch,
  setValue,
  getValues,
}: Step4Props) {
  const employmentRecords = watch("employmentRecords") || [];

  const addEmploymentRecord = () => {
    const current = employmentRecords || [];
    setValue("employmentRecords", [
      ...current,
      {
        employerName: "",
        employerPhone: "",
        employerFax: "",
        employerEmail: "",
        addressLine1: "",
        city: "",
        state: "",
        zip: "",
        positionHeld: "",
        dateFrom: "",
        dateTo: "",
        reasonForLeaving: "",
        equipmentClass: "",
        wasSubjectToFMCSR: true,
        wasSafetySensitive: true,
      },
    ]);
  };

  const removeEmploymentRecord = (index: number) => {
    const current = employmentRecords || [];
    if (current.length > 1) {
      setValue("employmentRecords", current.filter((_, i) => i !== index));
    }
  };

  const updateEmploymentRecord = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const current = employmentRecords || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("employmentRecords", updated);
  };

  // Format phone: (999)999-99-99
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `(${cleaned.slice(0, 3)})${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 3)})${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 4 – Employment Record (Previous 3 Years)
      </h2>

      <div className="space-y-6">
        {employmentRecords.map((record, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Item {index + 1}
              </h3>
              {employmentRecords.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmploymentRecord(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Employer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={record.employerName}
                  onChange={(e) =>
                    updateEmploymentRecord(index, "employerName", e.target.value.toUpperCase())
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={record.employerPhone || ""}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      updateEmploymentRecord(index, "employerPhone", formatted);
                    }}
                    placeholder="(555)123-45-67"
                    maxLength={15}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Fax
                  </label>
                  <input
                    type="text"
                    value={record.employerFax || ""}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "employerFax", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={record.employerEmail || ""}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "employerEmail", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Address Line 1 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={record.addressLine1}
                  onChange={(e) =>
                    updateEmploymentRecord(index, "addressLine1", e.target.value.toUpperCase())
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={record.city}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "city", e.target.value.toUpperCase())
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    State <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={record.state}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "state", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Select</option>
                    {[
                      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                      "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                      "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                      "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                      "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
                    ].map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Zip <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={record.zip}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "zip", e.target.value.toUpperCase())
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Position Held
                  </label>
                  <input
                    type="text"
                    value={record.positionHeld || ""}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "positionHeld", e.target.value.toUpperCase())
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Equipment Class
                  </label>
                  <input
                    type="text"
                    value={record.equipmentClass || ""}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "equipmentClass", e.target.value.toUpperCase())
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Date From (Month/Year)
                  </label>
                  <input
                    type="month"
                    value={record.dateFrom || ""}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "dateFrom", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Date To (Month/Year)
                  </label>
                  <input
                    type="month"
                    value={record.dateTo || ""}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "dateTo", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Reason for Leaving
                </label>
                <textarea
                  value={record.reasonForLeaving || ""}
                  onChange={(e) =>
                    updateEmploymentRecord(index, "reasonForLeaving", e.target.value)
                  }
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={record.wasSubjectToFMCSR}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "wasSubjectToFMCSR", e.target.checked)
                    }
                    className="h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-gray-700">
                    Were you subject to the FMCSR's while employed by this carrier?
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={record.wasSafetySensitive}
                    onChange={(e) =>
                      updateEmploymentRecord(index, "wasSafetySensitive", e.target.checked)
                    }
                    className="h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-gray-700">
                    Was your job designated as a safety sensitive function?
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEmploymentRecord}
          className="w-full md:w-auto px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
        >
          + Add Previous Employer
        </button>

        {errors.employmentRecords && (
          <p className="text-red-500 text-xs mt-1">
            {errors.employmentRecords.message}
          </p>
        )}
      </div>
    </div>
  );
}

