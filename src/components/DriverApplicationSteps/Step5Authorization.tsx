"use client";

import { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { DriverApplicationFormData } from "../DriverApplicationForm";
import SignatureCanvas from "../SignatureCanvas";

interface Step5Props {
  register: UseFormRegister<DriverApplicationFormData>;
  errors: FieldErrors<DriverApplicationFormData>;
  watch: UseFormWatch<DriverApplicationFormData>;
  setValue: UseFormSetValue<DriverApplicationFormData>;
}

export default function Step5Authorization({
  register,
  errors,
  watch,
  setValue,
}: Step5Props) {
  const signatureFile = watch("authorizationSignatureFile");
  const signatureText = watch("authorizationSignature");
  
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
    if (!watch("authorizationDateSigned")) {
      setValue("authorizationDateSigned", today, { shouldValidate: false });
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 5 – Authorization & Certification
      </h2>

      <div className="space-y-6">
        {/* Authorization Text */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-red-700 mb-3">
                TO BE READ AND SIGNED BY APPLICANT
              </h3>
              <div className="h-0.5 w-20 bg-red-600 mb-4"></div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-base text-gray-800 leading-relaxed space-y-4">
                  <p>
                    I authorize you to make investigations (including contacting current and prior employers) into my personal, employment, financial, medical history, and other related matters as may be necessary in arriving at an employment decision. I hereby release employers, schools, health care providers, and other persons from all liability in responding to inquiries and releasing information in connection with my application.
                  </p>
                  <p>
                    In the event of employment, I understand that false or misleading information given in my application or interview(s) may result in discharge. I also understand that I am required to abide by all rules and regulations of the Company.
                  </p>
                  <p>
                    I understand that the information I provide regarding my current and/or prior employers may be used, and those employer(s) will be contacted for the purpose of investigating my safety performance history as required by 49 CFR 391.23. I understand that I have the right to:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Review information provided by current/previous employers;</li>
                    <li>Have errors in the information corrected by previous employers, and for those previous employers to resend the corrected information to the prospective employer; and</li>
                    <li>Have a rebuttal statement attached to the alleged erroneous information, if the previous employer(s) and I cannot agree on the accuracy of the information.</li>
                  </ul>
                  <p className="font-semibold">
                    This certifies that this application was completed by me, and all entries on it and information in it are true and complete to the best of my knowledge. *
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
                        if (signatureText && signatureText !== "Drawn signature") {
                          setValue("authorizationSignature", "");
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
                        if (signatureFile) {
                          setValue("authorizationSignatureFile", undefined);
                        }
                        if (signatureText === "Drawn signature") {
                          setValue("authorizationSignature", "");
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
                          setValue("authorizationSignatureFile", file, {
                            shouldValidate: false,
                          });
                          setValue("authorizationSignature", "Drawn signature", {
                            shouldValidate: false,
                          });
                          setSignatureDataUrl(dataUrl);
                        })
                        .catch((error) => {
                          console.error("Error saving signature:", error);
                        });
                    }}
                    onClear={() => {
                      setValue("authorizationSignatureFile", undefined);
                      setValue("authorizationSignature", "");
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
                    {...register("authorizationSignature", {
                      onChange: (e) => {
                        setValue("authorizationSignature", e.target.value.toUpperCase(), { shouldValidate: true });
                      }
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Type your full name as signature"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-dancing-script text-2xl ${
                      errors.authorizationSignature ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              {errors.authorizationSignature?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.authorizationSignature.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Date Signed <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                {...register("authorizationDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.authorizationDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.authorizationDateSigned?.message && (
                <p className="text-red-500 text-xs mt-1">{String(errors.authorizationDateSigned.message)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

