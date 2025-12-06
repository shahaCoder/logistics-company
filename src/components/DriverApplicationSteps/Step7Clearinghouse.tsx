"use client";

import { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";
import SignatureCanvas from "../SignatureCanvas";

interface Step7Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step7Clearinghouse({
  register,
  errors,
  watch,
  setValue,
}: Step7Props) {
  const clearinghouseRegistered = watch("clearinghouseRegistered");
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">("draw");

  // Set default date signed to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!watch("clearinghouseDateSigned")) {
      setValue("clearinghouseDateSigned", today);
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 7 – FMCSA Drug & Alcohol Clearinghouse Consent
      </h2>

      <div className="space-y-6">
        {/* Clearinghouse Text */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">
            FMCSA Drug & Alcohol Clearinghouse Consent
          </h3>
          <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
            <p>
              In accordance with the Federal Motor Carrier Safety Administration (FMCSA) Drug and
              Alcohol Clearinghouse regulations, I understand that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                The Company may query the Clearinghouse to determine whether drug or alcohol
                violation information about me exists in the Clearinghouse.
              </li>
              <li>
                The Company may report drug or alcohol violations to the Clearinghouse as required
                by law.
              </li>
              <li>
                I have the right to review information about me in the Clearinghouse and to
                request corrections of any inaccurate information.
              </li>
              <li>
                By signing below, I consent to the Company's access to my Clearinghouse record
                for employment purposes.
              </li>
            </ul>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
          <div className="space-y-4">
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
                        setValue("clearinghouseSignatureFile", undefined);
                        setValue("clearinghouseSignature", "");
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
                        setValue("clearinghouseSignatureFile", undefined);
                        setValue("clearinghouseSignature", "");
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
                          setValue("clearinghouseSignatureFile", file, {
                            shouldValidate: true,
                          });
                          setValue("clearinghouseSignature", "Drawn signature");
                        });
                    }}
                    onClear={() => {
                      setValue("clearinghouseSignatureFile", undefined);
                      setValue("clearinghouseSignature", "");
                    }}
                    width={400}
                    height={200}
                    autoSave={true}
                  />
                </div>
              ) : (
                <input
                  {...register("clearinghouseSignature", {
                    onChange: (e) => {
                      setValue("clearinghouseSignature", e.target.value.toUpperCase(), { shouldValidate: true });
                    }
                  })}
                  placeholder="Type your full name as signature"
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                    errors.clearinghouseSignature ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
              {errors.clearinghouseSignature && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.clearinghouseSignature.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Date Signed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("clearinghouseDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.clearinghouseDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clearinghouseDateSigned && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.clearinghouseDateSigned.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Are you registered with FMCSA Clearinghouse?{" "}
                <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={clearinghouseRegistered === true}
                    onChange={() => setValue("clearinghouseRegistered", true)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={clearinghouseRegistered === false}
                    onChange={() => setValue("clearinghouseRegistered", false)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

