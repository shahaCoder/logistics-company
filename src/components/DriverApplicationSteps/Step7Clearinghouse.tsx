"use client";

import { useState, useEffect, useRef } from "react";
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
  const signatureFile = watch("clearinghouseSignatureFile");
  const signatureText = watch("clearinghouseSignature");
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
      setValue("clearinghouseSignatureFile", undefined, { shouldValidate: false });
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
        setValue("clearinghouseSignatureFile", file, { shouldValidate: false });
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
    if (!watch("clearinghouseDateSigned")) {
      setValue("clearinghouseDateSigned", today);
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 8 – FMCSA Drug & Alcohol Clearinghouse Consent
      </h2>

      <div className="space-y-6">
        {/* Clearinghouse Text */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-red-700 mb-3">
                GENERAL CONSENT FOR LIMITED QUERIES OF THE FEDERAL MOTOR CARRIER SAFETY ADMINISTRATION (FMCSA) DRUG AND ALCOHOL CLEARINGHOUSE
              </h3>
              <div className="h-0.5 w-20 bg-red-600 mb-4"></div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-base text-gray-800 space-y-4 leading-relaxed">
                  <p>
                    I, <strong>{watch("firstName")} {watch("lastName")}</strong>, hereby provide consent to <strong>GLOBAL COOPERATION LLC</strong> to conduct a limited query of the FMCSA Commercial Driver's License Drug and Alcohol Clearinghouse (Clearinghouse) to determine whether drug or alcohol violation information about me exists in the Clearinghouse.
                  </p>
                  <p>
                    I am consenting to multiple limited queries for the duration of employment with <strong>GLOBAL COOPERATION LLC</strong>.
                  </p>
                  <p>
                    I understand that if the limited query conducted by <strong>GLOBAL COOPERATION LLC</strong> indicates that drug or alcohol violation information about me exists in the Clearinghouse, FMCSA will not disclose that information to <strong>GLOBAL COOPERATION LLC</strong> without first obtaining additional specific consent from me.
                  </p>
                  <p>
                    I further understand that if I refuse to provide consent for <strong>GLOBAL COOPERATION LLC</strong> to conduct a limited query of the Clearinghouse, <strong>GLOBAL COOPERATION LLC</strong> must prohibit me from performing safety-sensitive functions, including driving a commercial motor vehicle, as required by FMCSA's drug and alcohol program regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Prospective Employee Signature <span className="text-red-600">*</span>
              </label>
              <div className="mb-3">
                <div className="flex flex-col sm:flex-row gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={signatureMode === "draw"}
                      onChange={() => {
                        setSignatureMode("draw");
                        // Only clear text signature if switching from text mode
                        if (signatureText && signatureText !== "Drawn signature") {
                          setValue("clearinghouseSignature", "");
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
                          setValue("clearinghouseSignatureFile", undefined);
                        }
                        // Clear "Drawn signature" placeholder if present
                        if (signatureText === "Drawn signature") {
                          setValue("clearinghouseSignature", "");
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
                          setValue("clearinghouseSignatureFile", file, {
                            shouldValidate: true,
                          });
                          setValue("clearinghouseSignature", "Drawn signature");
                          setSignatureDataUrl(dataUrl);
                        });
                    }}
                    onClear={() => {
                      setValue("clearinghouseSignatureFile", undefined);
                      setValue("clearinghouseSignature", "");
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
                    {...register("clearinghouseSignature", {
                      onChange: (e) => {
                        const value = e.target.value.toUpperCase();
                        setValue("clearinghouseSignature", value, { shouldValidate: true });
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
                    placeholder="Type your full name as signature"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-dancing-script text-2xl ${
                      errors.clearinghouseSignature ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              {errors.clearinghouseSignature?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.clearinghouseSignature.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Date Signed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                lang="en-US"
                {...register("clearinghouseDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.clearinghouseDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clearinghouseDateSigned?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.clearinghouseDateSigned.message)}
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

