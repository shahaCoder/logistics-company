"use client";

import { useState, useRef, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";
import SignatureCanvas from "../SignatureCanvas";
import SignatureCanvasComponent from "react-signature-canvas";

interface Step5Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step5AlcoholDrug({
  register,
  errors,
  watch,
  setValue,
}: Step5Props) {
  const alcoholDrugPositive = watch("alcoholDrugPositive");
  const alcoholConcentration = watch("alcoholConcentration");
  const refusedTest = watch("refusedTest");
  const fullName = watch("alcoholDrugName");
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">("draw");
  const signatureRef = useRef<SignatureCanvasComponent | null>(null);

  // Set default date signed to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!watch("alcoholDrugDateSigned")) {
      setValue("alcoholDrugDateSigned", today);
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 5 – Alcohol & Drug Test Statement
      </h2>

      <div className="space-y-6">
        {/* Statement Text */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-2">
            Alcohol & Drug Testing Statement
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            I understand that as a commercial driver, I am subject to alcohol and drug testing
            as required by the Federal Motor Carrier Safety Regulations (FMCSR). I certify that
            the information provided below is true and accurate to the best of my knowledge.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Have you ever tested positive for a controlled substance?{" "}
              <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={alcoholDrugPositive === true}
                  onChange={() => setValue("alcoholDrugPositive", true)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={alcoholDrugPositive === false}
                  onChange={() => setValue("alcoholDrugPositive", false)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>No</span>
              </label>
            </div>
            {alcoholDrugPositive && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Explanation <span className="text-red-600">*</span>
                </label>
                <textarea
                  {...register("alcoholDrugPositiveExplanation")}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Have you ever had an alcohol concentration of .04 or greater?{" "}
              <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={alcoholConcentration === true}
                  onChange={() => setValue("alcoholConcentration", true)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={alcoholConcentration === false}
                  onChange={() => setValue("alcoholConcentration", false)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>No</span>
              </label>
            </div>
            {alcoholConcentration && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Explanation <span className="text-red-600">*</span>
                </label>
                <textarea
                  {...register("alcoholConcentrationExplanation")}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Have you ever refused a required test for drugs or alcohol?{" "}
              <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={refusedTest === true}
                  onChange={() => setValue("refusedTest", true)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={refusedTest === false}
                  onChange={() => setValue("refusedTest", false)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>No</span>
              </label>
            </div>
            {refusedTest && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Explanation <span className="text-red-600">*</span>
                </label>
                <textarea
                  {...register("refusedTestExplanation")}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                {...register("alcoholDrugName")}
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
              />
              {errors.alcoholDrugName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.alcoholDrugName.message}
                </p>
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
                        setSignatureSaved(false);
                        setValue("alcoholDrugSignatureFile", undefined);
                        setValue("alcoholDrugSignature", "");
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
                        setSignatureSaved(false);
                        setValue("alcoholDrugSignatureFile", undefined);
                        setValue("alcoholDrugSignature", "");
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
                      // Convert data URL to File
                      fetch(dataUrl)
                        .then((res) => res.blob())
                        .then((blob) => {
                          const file = new File([blob], "signature.png", {
                            type: "image/png",
                          });
                          setValue("alcoholDrugSignatureFile", file, {
                            shouldValidate: true,
                          });
                          setValue("alcoholDrugSignature", "Drawn signature");
                        });
                    }}
                    onClear={() => {
                      setValue("alcoholDrugSignatureFile", undefined);
                      setValue("alcoholDrugSignature", "");
                    }}
                    width={400}
                    height={200}
                    autoSave={true}
                  />
                </div>
              ) : (
                <input
                  {...register("alcoholDrugSignature", {
                    onChange: (e) => {
                      setValue("alcoholDrugSignature", e.target.value.toUpperCase(), { shouldValidate: true });
                    }
                  })}
                  placeholder="Type your full name as signature"
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                    errors.alcoholDrugSignature ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
              {errors.alcoholDrugSignature && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.alcoholDrugSignature.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Date Signed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("alcoholDrugDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.alcoholDrugDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.alcoholDrugDateSigned && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.alcoholDrugDateSigned.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

