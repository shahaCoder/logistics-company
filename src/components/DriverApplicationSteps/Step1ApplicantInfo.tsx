"use client";

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";

interface Step1Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step1ApplicantInfo({
  register,
  errors,
  watch,
  setValue,
}: Step1Props) {
  const livedAtCurrentMoreThan3Years = watch("livedAtCurrentMoreThan3Years");
  const previousAddresses = watch("previousAddresses") || [];
  const ssnValue = watch("ssn");

  // Format SSN with dashes
  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setValue("ssn", formatted, { shouldValidate: true });
  };

  // Format phone: (305)522-82-70
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `(${cleaned.slice(0, 3)})${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 3)})${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const addPreviousAddress = () => {
    const current = previousAddresses || [];
    setValue("previousAddresses", [
      ...current,
      {
        addressLine1: "",
        city: "",
        state: "",
        zip: "",
        fromDate: "",
        toDate: "",
      },
    ]);
  };

  const removePreviousAddress = (index: number) => {
    const current = previousAddresses || [];
    setValue("previousAddresses", current.filter((_, i) => i !== index));
  };

  const updatePreviousAddress = (
    index: number,
    field: string,
    value: string
  ) => {
    const current = previousAddresses || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("previousAddresses", updated);
  };


  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 1 – Applicant Information
      </h2>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              {...register("firstName")}
              onChange={(e) => {
                setValue("firstName", e.target.value.toUpperCase(), { shouldValidate: true });
              }}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.firstName.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              {...register("lastName")}
              onChange={(e) => {
                setValue("lastName", e.target.value.toUpperCase(), { shouldValidate: true });
              }}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.lastName.message)}</p>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Date of Birth <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            {...register("dateOfBirth")}
            className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
              errors.dateOfBirth ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.dateOfBirth?.message && (
            <p className="text-red-500 text-xs mt-1">{String(errors.dateOfBirth.message)}</p>
          )}
        </div>

        {/* SSN */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Social Security Number <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            value={ssnValue || ""}
            onChange={handleSSNChange}
            maxLength={11}
            placeholder="XXX-XX-1234"
            className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
              errors.ssn ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.ssn?.message && (
            <p className="text-red-500 text-xs mt-1">{String(errors.ssn.message)}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            SSN is optional but recommended for faster background check processing. If provided, we will securely store your SSN and it will only be used for required DOT background checks.
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Phone <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              {...register("phone", {
                pattern: {
                  value: /^\(\d{3}\)\d{3}-\d{2}-\d{2}$/,
                  message: "Invalid phone format. Use format: (XXX)XXX-XX-XX"
                }
              })}
              value={watch("phone") || ""}
              onChange={handlePhoneChange}
              placeholder="(555)123-45-67"
              maxLength={15}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.phone.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>
            )}
          </div>
        </div>

        {/* Current Address */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Address Line 1 <span className="text-red-600">*</span>
              </label>
              <input
                {...register("currentAddressLine1")}
                onChange={(e) => {
                  setValue("currentAddressLine1", e.target.value.toUpperCase(), { shouldValidate: true });
                }}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.currentAddressLine1 ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.currentAddressLine1?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.currentAddressLine1.message)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  {...register("currentCity")}
                  onChange={(e) => {
                    setValue("currentCity", e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                    errors.currentCity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.currentCity?.message && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.currentCity.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  State <span className="text-red-600">*</span>
                </label>
                <select
                  {...register("currentState")}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                    errors.currentState ? "border-red-500" : "border-gray-300"
                  }`}
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
                {errors.currentState?.message && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.currentState.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Zip Code <span className="text-red-600">*</span>
                </label>
                <input
                  {...register("currentZip")}
                  onChange={(e) => {
                    setValue("currentZip", e.target.value.toUpperCase(), { shouldValidate: true });
                  }}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                    errors.currentZip ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.currentZip?.message && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.currentZip.message)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lived at current address */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Have you lived at this address for more than 3 years?{" "}
            <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="true"
                checked={livedAtCurrentMoreThan3Years === true}
                onChange={() => setValue("livedAtCurrentMoreThan3Years", true)}
                className="h-4 w-4 accent-red-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="false"
                checked={livedAtCurrentMoreThan3Years === false}
                onChange={() => setValue("livedAtCurrentMoreThan3Years", false)}
                className="h-4 w-4 accent-red-600"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Previous Addresses */}
        {livedAtCurrentMoreThan3Years === false && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Previous Addresses
              </h3>
              <button
                type="button"
                onClick={addPreviousAddress}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                + Add Previous Address
              </button>
            </div>

            {previousAddresses.map((addr, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Previous Address {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removePreviousAddress(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={addr.addressLine1}
                    onChange={(e) =>
                      updatePreviousAddress(index, "addressLine1", e.target.value.toUpperCase())
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={addr.city}
                      onChange={(e) =>
                        updatePreviousAddress(index, "city", e.target.value.toUpperCase())
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <select
                      value={addr.state}
                      onChange={(e) =>
                        updatePreviousAddress(index, "state", e.target.value)
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">State</option>
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
                    <input
                      type="text"
                      placeholder="Zip"
                      value={addr.zip}
                      onChange={(e) =>
                        updatePreviousAddress(index, "zip", e.target.value.toUpperCase())
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                      type="month"
                      placeholder="From Date"
                      value={addr.fromDate || ""}
                      onChange={(e) =>
                        updatePreviousAddress(index, "fromDate", e.target.value)
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <input
                    type="month"
                    placeholder="To Date"
                    value={addr.toDate || ""}
                    onChange={(e) =>
                      updatePreviousAddress(index, "toDate", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

