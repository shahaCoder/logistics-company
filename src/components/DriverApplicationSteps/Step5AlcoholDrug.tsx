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
  const signatureFile = watch("alcoholDrugSignatureFile");
  const signatureText = watch("alcoholDrugSignature");
  
  // Determine signature mode based on saved data
  const getInitialSignatureMode = (): "text" | "draw" => {
    if (signatureFile) return "draw";
    if (signatureText && signatureText.trim() !== "" && signatureText !== "Drawn signature") return "text";
    return "draw";
  };
  
  const [signatureMode, setSignatureMode] = useState<"text" | "draw">(getInitialSignatureMode());
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(undefined);
  const signatureRef = useRef<SignatureCanvasComponent | null>(null);

  const generateTextSignatureFile = (text: string) => {
    if (typeof window === "undefined") return;
    const trimmed = text.trim();
    if (!trimmed) {
      setValue("alcoholDrugSignatureFile", undefined, { shouldValidate: false });
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
        setValue("alcoholDrugSignatureFile", file, { shouldValidate: false });
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

  // Set default date signed to today (using local date, not UTC)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    if (!watch("alcoholDrugDateSigned")) {
      setValue("alcoholDrugDateSigned", today);
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 6 – Alcohol & Drug Test Statement
      </h2>

      <div className="space-y-6">
        {/* Statement Text */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-red-700 mb-3">
                PRE-EMPLOYMENT EMPLOYEE ALCOHOL & DRUG TEST STATEMENT
              </h3>
              <div className="h-0.5 w-20 bg-red-600 mb-4"></div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-base text-gray-800 leading-relaxed space-y-4">
                  <p>
                    49 CFR Part 40.25(j) states, as the employer, you must ask the employee whether he or she has tested positive, or refused to test, on any pre-employment drug or alcohol test administered by an employer to which the employee applied for, but did not obtain, safety-sensitive transportation work covered by DOT agency drug and alcohol testing rules during the past two years. If the employee admits that he or she had a positive test or a refusal to test, you must not use the employee to perform safety-sensitive functions for you, until and unless the employee documents successful completion of the return-to-duty process required in 49 CFR Subpart O.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drug and Alcohol Questions</h3>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              A. Have you ever tested positive for a controlled substance?{" "}
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
              B. Have you ever had an alcohol concentration of .04 or greater?{" "}
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
              C. Have you ever refused a required test for drugs or alcohol?{" "}
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

          {/* Conditional Documentation Question */}
          {(alcoholDrugPositive || alcoholConcentration || refusedTest) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                If you answered yes to the above question, can you provide documentation of successful completion of DOT return-to-duty requirements (including follow-up tests).{" "}
                <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={watch("alcoholDrugReturnToDuty") === true}
                    onChange={() => setValue("alcoholDrugReturnToDuty", true)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={watch("alcoholDrugReturnToDuty") === false}
                    onChange={() => setValue("alcoholDrugReturnToDuty", false)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          )}

          {/* Understanding Statement */}
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-base text-gray-800 leading-relaxed mb-4">
              I understand that, as required by the Federal Motor Carrier Safety Regulations and Company policy, all drivers must submit to alcohol and controlled substance testing as a condition of employment. I also understand that any offer of employment will be contingent upon the results of an alcohol and controlled substance test. Therefore, I agree to submit to the following alcohol and controlled substance tests in accordance and as defined by the Federal Motor Carrier Safety Regulation and this Company's policies:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-base text-gray-800">
              <li>Pre-Employment, to determine employment eligibility</li>
              <li>Random</li>
              <li>Reasonable Suspicion</li>
              <li>Post-Accident</li>
            </ul>
          </div>

          {/* Certification Statement */}
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-base text-gray-800 leading-relaxed font-semibold">
              I certify that I have read, understand, and agree to abide by the conditions of this consent and release form.
            </p>
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
              {errors.alcoholDrugName?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.alcoholDrugName.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Signature <span className="text-red-600">*</span>
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
                          setValue("alcoholDrugSignature", "");
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
                          setValue("alcoholDrugSignatureFile", undefined);
                        }
                        // Clear "Drawn signature" placeholder if present
                        if (signatureText === "Drawn signature") {
                          setValue("alcoholDrugSignature", "");
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
                          setSignatureDataUrl(dataUrl);
                        });
                    }}
                    onClear={() => {
                      setValue("alcoholDrugSignatureFile", undefined);
                      setValue("alcoholDrugSignature", "");
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
                    {...register("alcoholDrugSignature", {
                      onChange: (e) => {
                        const value = e.target.value.toUpperCase();
                        setValue("alcoholDrugSignature", value, { shouldValidate: true });
                        generateTextSignatureFile(value);
                      }
                    })}
                    placeholder="Type your full name as signature"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-dancing-script text-2xl ${
                      errors.alcoholDrugSignature ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              {errors.alcoholDrugSignature?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.alcoholDrugSignature.message)}
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
                {...register("alcoholDrugDateSigned")}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${
                  errors.alcoholDrugDateSigned ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.alcoholDrugDateSigned?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.alcoholDrugDateSigned.message)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

