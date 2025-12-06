"use client";

import { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";
import SignatureCanvas from "../SignatureCanvas";

interface Step6Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step6PSP({
  register,
  errors,
  watch,
  setValue,
}: Step6Props) {
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">("draw");

  // Set default date signed to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!watch("pspDateSigned")) {
      setValue("pspDateSigned", today);
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 6 – PSP Driver Disclosure & Authorization
      </h2>

      <div className="space-y-6">
        {/* PSP Text */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">
            Pre-Employment Screening Program (PSP) Driver Disclosure and Authorization
          </h3>
          <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
            <p>
              In connection with your application for employment with Global Cooperation LLC
              (the "Company"), the Company may obtain information about you from the Federal Motor
              Carrier Safety Administration (FMCSA) Pre-Employment Screening Program (PSP).
            </p>
            <p>
              This information may include, but is not limited to, your crash history and
              inspection history from the FMCSA Motor Carrier Management Information System (MCMIS).
            </p>
            <p>
              By signing below, you authorize the Company to access your PSP record and use the
              information contained therein for employment purposes. You understand that this
              authorization will remain in effect for the duration of your employment relationship
              with the Company.
            </p>
            <p>
              You also understand that you have the right to review the information obtained from
              the PSP and to dispute any inaccurate information directly with the FMCSA.
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                {...register("pspFullName")}
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
              />
              {errors.pspFullName && (
                <p className="text-red-500 text-xs mt-1">{errors.pspFullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Signature <span className="text-red-600">*</span>
              </label>
              <div className="mb-3">
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={signatureMode === "draw"}
                    onChange={() => {
                      setSignatureMode("draw");
                      setValue("pspSignatureFile", undefined);
                      setValue("pspSignature", "");
                    }}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span>Draw Signature</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={signatureMode === "text"}
                    onChange={() => {
                      setSignatureMode("text");
                      setValue("pspSignatureFile", undefined);
                      setValue("pspSignature", "");
                    }}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span>Type Name</span>
                  </label>
                </div>
              </div>

              {signatureMode === "draw" ? (
                <div className="w-full">
                  <SignatureCanvas
                    onSave={(dataUrl) => {
                      fetch(dataUrl)
                        .then((res) => res.blob())
                        .then((blob) => {
                          const file = new File([blob], "signature.png", {
                            type: "image/png",
                          });
                          setValue("pspSignatureFile", file, {
                            shouldValidate: true,
                          });
                          setValue("pspSignature", "Drawn signature");
                        });
                    }}
                    onClear={() => {
                      setValue("pspSignatureFile", undefined);
                      setValue("pspSignature", "");
                    }}
                    width={400}
                    height={200}
                    autoSave={true}
                  />
                </div>
              ) : (
                <input
                  {...register("pspSignature", {
                    onChange: (e) => {
                      setValue("pspSignature", e.target.value.toUpperCase(), { shouldValidate: true });
                    }
                  })}
                  placeholder="Type your full name as signature"
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                    errors.pspSignature ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
              {errors.pspSignature && (
                <p className="text-red-500 text-xs mt-1">{errors.pspSignature.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Date Signed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("pspDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.pspDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.pspDateSigned && (
                <p className="text-red-500 text-xs mt-1">{errors.pspDateSigned.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

