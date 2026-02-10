"use client";

import { useState, useEffect, useRef } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";
import SignatureCanvas from "../SignatureCanvas";

interface Step8Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step8MVR({
  register,
  errors,
  watch,
  setValue,
}: Step8Props) {
  const signatureFile = watch("mvrSignatureFile");
  const signatureText = watch("mvrSignature");
  const textSignatureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determine signature mode based on saved data
  const getInitialSignatureMode = (): "text" | "draw" => {
    if (signatureFile) return "draw";
    if (signatureText && signatureText.trim() !== "" && signatureText !== "Drawn signature") return "text";
    return "draw";
  };
  
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">(getInitialSignatureMode());
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(undefined);

  const generateTextSignatureFile = (text: string) => {
    if (typeof window === "undefined") return;
    const trimmed = text.trim();
    if (!trimmed) {
      setValue("mvrSignatureFile", undefined, { shouldValidate: false });
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const width = 600;
      const height = 200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#000000";
      ctx.font = "48px Dancing Script, cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(trimmed.toUpperCase(), width / 2, height / 2);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "signature-text.png", { type: "image/png" });
        setValue("mvrSignatureFile", file, { shouldValidate: false });
      }, "image/png");
    } catch (error) {
      console.error("Failed to generate text signature image:", error);
    }
  };

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (textSignatureTimeoutRef.current) {
        clearTimeout(textSignatureTimeoutRef.current);
      }
    };
  }, []);

  // Set default date signed to today (using local date, not UTC)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    if (!watch("mvrDateSigned")) {
      setValue("mvrDateSigned", today, { shouldValidate: false });
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 9 – MVR Release Consent
      </h2>

      <div className="space-y-6">
        {/* MVR Text */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-red-700 mb-3">
                MVR Release Consent
              </h3>
              <div className="h-0.5 w-20 bg-red-600 mb-4"></div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-base text-gray-800 space-y-4 leading-relaxed">
                  <p>
                    In conjunction with my potential employment <strong>GLOBAL COOPERATION LLC</strong> ("the company"), I <strong>{watch("firstName")} {watch("lastName")}</strong> (applicant) consent to the release of my Motor Vehicle Records (MVR) to the company. I understand the company will use these records to evaluate my suitability to fulfill driving duties that may be related to the position for which I am applying. I also consent to the review, evaluation, and other use of any MVR I may have provided to the company.
                  </p>
                  <p>
                    This consent is given in satisfaction of Public Law 18 USC 2721 et. Seq., "Federal Drivers Privacy Protection Act", and is intended to constitute "written consent" as required by this Act.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t pt-6">
          <div className="space-y-6">
            {/* Signature Field */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-3">
                Prospective Employee Signature <span className="text-red-600">*</span>
              </label>
              
              {/* Radio buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={signatureMode === "draw"}
                    onChange={() => {
                      setSignatureMode("draw");
                      if (signatureText && signatureText !== "Drawn signature") {
                        setValue("mvrSignature", "");
                      }
                    }}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-gray-700">Draw Signature</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={signatureMode === "text"}
                    onChange={() => {
                      setSignatureMode("text");
                      if (signatureFile) {
                        setValue("mvrSignatureFile", undefined);
                      }
                      if (signatureText === "Drawn signature") {
                        setValue("mvrSignature", "");
                      }
                    }}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-gray-700">Type Name</span>
                </label>
              </div>

              {/* Signature input area */}
              {signatureMode === "draw" ? (
                <div className="w-full">
                  {signatureFile && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
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
                          setValue("mvrSignatureFile", file, {
                            shouldValidate: false,
                          });
                          setValue("mvrSignature", "Drawn signature", {
                            shouldValidate: false,
                          });
                          setSignatureDataUrl(dataUrl);
                        })
                        .catch((error) => {
                          console.error("Error saving signature:", error);
                        });
                    }}
                    onClear={() => {
                      setValue("mvrSignatureFile", undefined);
                      setValue("mvrSignature", "");
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
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      ✓ Signature saved: {signatureText}
                    </div>
                  )}
                  <input
                    {...register("mvrSignature", {
                      onChange: (e) => {
                        const value = e.target.value.toUpperCase();
                        setValue("mvrSignature", value, { shouldValidate: true });
                        // Clear existing timeout
                        if (textSignatureTimeoutRef.current) {
                          clearTimeout(textSignatureTimeoutRef.current);
                        }
                        // Wait 2.5 seconds before generating and saving signature file
                        textSignatureTimeoutRef.current = setTimeout(() => {
                          generateTextSignatureFile(value);
                        }, 2500);
                      }
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Type your full name as signature"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-dancing-script text-2xl ${
                      errors.mvrSignature ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              {errors.mvrSignature?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.mvrSignature.message)}</p>
              )}
            </div>

            {/* Date Signed Field */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Date Signed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                lang="en-US"
                {...register("mvrDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.mvrDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.mvrDateSigned?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.mvrDateSigned.message)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

