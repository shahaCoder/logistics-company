"use client";

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";
import { englishOnlyInputProps, blockNonEnglishInput } from "../../utils/keyboardLock";

interface Step2Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

const ENDORSEMENTS = [
  { value: "NONE", label: "NONE" },
  { value: "H", label: "H - Hazardous Materials" },
  { value: "N", label: "N - Tank Vehicle" },
  { value: "X", label: "X - Tank & Hazardous Materials" },
  { value: "P", label: "P - Passenger" },
  { value: "T", label: "T - Double/Triple Trailers" },
  { value: "S", label: "S - School Bus" },
];

export default function Step2LicenseInfo({
  register,
  errors,
  watch,
  setValue,
}: Step2Props) {
  const hasOtherLicenses = watch("hasOtherLicensesLast3Years");
  const endorsements = watch("endorsements") || [];
  const otherLicenses = watch("otherLicenses") || [];
  const licenseExpiresAt = watch("licenseExpiresAt");

  // Check if license is expired
  const isLicenseExpired = licenseExpiresAt && (() => {
    const expirationDate = new Date(licenseExpiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expirationDate < today;
  })();

  const handleEndorsementChange = (value: string, checked: boolean) => {
    const current = endorsements || [];
    if (value === "NONE") {
      // If NONE is checked, clear all other endorsements
      if (checked) {
        setValue("endorsements", ["NONE"]);
      } else {
        setValue("endorsements", []);
      }
    } else {
      // If any other endorsement is checked, remove NONE
      if (checked) {
        setValue("endorsements", [...current.filter((e) => e !== "NONE"), value]);
      } else {
        setValue("endorsements", current.filter((e) => e !== value));
      }
    }
  };

  const addOtherLicense = () => {
    setValue("otherLicenses", [
      ...otherLicenses,
      { licenseNumber: "", state: "", class: "" },
    ]);
  };

  const removeOtherLicense = (index: number) => {
    setValue("otherLicenses", otherLicenses.filter((_, i) => i !== index));
  };

  const updateOtherLicense = (index: number, field: string, value: string) => {
    const updated = [...otherLicenses];
    updated[index] = { ...updated[index], [field]: value };
    setValue("otherLicenses", updated);
  };

  const handleFileChange = (
    field: "licenseFrontFile" | "licenseBackFile",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(field, file, { shouldValidate: true });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 2 – Driver's License Information
      </h2>

      <div className="space-y-6">
        {/* License Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              License Number <span className="text-red-600">*</span>
            </label>
            <input
              {...register("licenseNumber")}
              {...englishOnlyInputProps}
              onChange={(e) => {
                blockNonEnglishInput(e);
                setValue("licenseNumber", e.target.value.toUpperCase(), { shouldValidate: true });
              }}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.licenseNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.licenseNumber?.message && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.licenseNumber.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              State <span className="text-red-600">*</span>
            </label>
            <select
              {...register("licenseState")}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.licenseState ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select State</option>
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
            {errors.licenseState?.message && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.licenseState.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Class <span className="text-red-600">*</span>
            </label>
            <select
              {...register("licenseClass")}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.licenseClass ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Class</option>
              <option value="A">Class A</option>
              <option value="B">Class B</option>
              <option value="C">Class C</option>
            </select>
            {errors.licenseClass?.message && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.licenseClass.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Expires <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              {...register("licenseExpiresAt")}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                errors.licenseExpiresAt ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.licenseExpiresAt?.message && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.licenseExpiresAt.message)}
              </p>
            )}
            {isLicenseExpired && !errors.licenseExpiresAt && (
              <p className="text-red-500 text-xs mt-1">
                Warning: Your CDL expiration date is in the past. You cannot proceed with an expired license.
              </p>
            )}
          </div>
        </div>

        {/* Endorsements */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Endorsements
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ENDORSEMENTS.map((endorsement) => (
              <label
                key={endorsement.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={endorsements.includes(endorsement.value)}
                  onChange={(e) =>
                    handleEndorsementChange(endorsement.value, e.target.checked)
                  }
                  className="h-4 w-4 accent-red-600"
                />
                <span className="text-sm text-gray-700">{endorsement.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Other Licenses */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Have you held any other licenses in the past 3 years?{" "}
            <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={hasOtherLicenses === true}
                onChange={() => setValue("hasOtherLicensesLast3Years", true)}
                className="h-4 w-4 accent-red-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={hasOtherLicenses === false}
                onChange={() => setValue("hasOtherLicensesLast3Years", false)}
                className="h-4 w-4 accent-red-600"
              />
              <span>No</span>
            </label>
          </div>

          {hasOtherLicenses && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Other Licenses
                </h3>
                <button
                  type="button"
                  onClick={addOtherLicense}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  + Add License
                </button>
              </div>

              {otherLicenses.map((license, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      License {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeOtherLicense(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="License Number"
                      value={license.licenseNumber}
                      onChange={(e) =>
                        updateOtherLicense(index, "licenseNumber", e.target.value.toUpperCase())
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <select
                      value={license.state}
                      onChange={(e) =>
                        updateOtherLicense(index, "state", e.target.value)
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
                      placeholder="Class"
                      value={license.class}
                      {...englishOnlyInputProps}
                      onChange={(e) => {
                        blockNonEnglishInput(e);
                        updateOtherLicense(index, "class", e.target.value.toUpperCase());
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Uploads */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            License Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Upload FRONT copy of your driver's license{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange("licenseFrontFile", e)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              {errors.licenseFrontFile?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.licenseFrontFile.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Upload BACK copy of your driver's license{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange("licenseBackFile", e)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              {errors.licenseBackFile?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.licenseBackFile.message)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

