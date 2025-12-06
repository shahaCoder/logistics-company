"use client";

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";

interface Step3Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step3MedicalCard({
  register,
  errors,
  watch,
  setValue,
}: Step3Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("medicalCardFile", file, { shouldValidate: true });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 3 – Medical Card
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Upload Copy <span className="text-red-600">*</span>
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
              errors.medicalCardFile ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.medicalCardFile?.message && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.medicalCardFile.message)}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Upload a clear copy of your medical card (image or PDF)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Medical Card Expiration Date (Optional)
          </label>
          <input
            type="date"
            {...register("medicalCardExpiresAt")}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

