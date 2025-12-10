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
  const signatureFile = watch("pspSignatureFile");
  const signatureText = watch("pspSignature");
  
  // Determine signature mode based on saved data
  const getInitialSignatureMode = (): "text" | "draw" => {
    if (signatureFile) return "draw";
    if (signatureText && signatureText.trim() !== "" && signatureText !== "Drawn signature") return "text";
    return "draw";
  };
  
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">(getInitialSignatureMode());
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(undefined);

  // Restore signature from saved file when component mounts or file changes
  useEffect(() => {
    if (signatureFile && signatureMode === "draw") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSignatureDataUrl(dataUrl);
      };
      reader.readAsDataURL(signatureFile);
    } else {
      setSignatureDataUrl(undefined);
    }
  }, [signatureFile, signatureMode]);

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
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 max-h-96 overflow-y-auto shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-red-700 mb-3">
                IMPORTANT: PSP Driver Disclosure & Authorization
              </h3>
              <div className="h-0.5 w-20 bg-red-600 mb-4"></div>
              <p className="text-lg text-gray-900 leading-relaxed font-semibold mb-4">
                By signing below, you authorize Global Cooperation LLC to:
              </p>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-base text-gray-800 space-y-3 leading-relaxed">
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
            </div>
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
              {errors.pspFullName?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.pspFullName.message)}</p>
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
                      // Only clear text signature if switching from text mode
                      if (signatureText && signatureText !== "Drawn signature") {
                        setValue("pspSignature", "");
                      }
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
                      // Only clear file signature if switching from draw mode
                      if (signatureFile) {
                        setValue("pspSignatureFile", undefined);
                      }
                      // Clear "Drawn signature" placeholder if present
                      if (signatureText === "Drawn signature") {
                        setValue("pspSignature", "");
                      }
                    }}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span>Type Name</span>
                  </label>
                </div>
              </div>

              {signatureMode === "draw" ? (
                <div className="w-full">
                  {signatureFile && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      ✓ Signature saved (drawn signature)
                    </div>
                  )}
                  <SignatureCanvas
                    initialDataUrl={signatureDataUrl}
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
                          setSignatureDataUrl(dataUrl);
                        });
                    }}
                    onClear={() => {
                      setValue("pspSignatureFile", undefined);
                      setValue("pspSignature", "");
                      setSignatureDataUrl(undefined);
                    }}
                    width={400}
                    height={200}
                    autoSave={true}
                  />
                </div>
              ) : (
                <div>
                  {signatureText && signatureText.trim() !== "" && signatureText !== "Drawn signature" && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      ✓ Signature saved: {signatureText}
                    </div>
                  )}
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
                </div>
              )}
              {errors.pspSignature?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.pspSignature.message)}</p>
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
              {errors.pspDateSigned?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.pspDateSigned.message)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

