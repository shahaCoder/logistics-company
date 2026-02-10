"use client";

import { useState, useEffect, useRef } from "react";
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
      setValue("pspSignatureFile", undefined, { shouldValidate: false });
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
        setValue("pspSignatureFile", file, { shouldValidate: false });
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
    if (!watch("pspDateSigned")) {
      setValue("pspDateSigned", today);
    }
  }, [setValue, watch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 7 – PSP Driver Disclosure & Authorization
      </h2>

      <div className="space-y-6">
        {/* PSP Disclosure Text */}
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-red-700 mb-3">
                PSP DRIVER DISCLOSURE & AUTHORIZATION
              </h3>
              <div className="h-0.5 w-20 bg-red-600 mb-4"></div>
              <div className="bg-white rounded p-4 border border-gray-200">
                <div className="text-base text-gray-800 space-y-4 leading-relaxed">
                  <p className="font-semibold">
                    MANDATORY USE BY ALL ACCOUNT HOLDERS
                  </p>
                  <p className="font-semibold">
                    IMPORTANT DISCLOSURE REGARDING BACKGROUND REPORTS FROM THE PSP Online Service
                  </p>
                  <p>
                    In connection with your application for employment with <strong>GLOBAL COOPERATION LLC</strong>, the Prospective Employer may obtain reports on your driving and safety inspection history from the Federal Motor Carrier Safety Administration (FMCSA).
                  </p>
                  <div className="space-y-3">
                    <p className="font-semibold">Adverse Action Process (In-Person Application):</p>
                    <p>
                      If you submit your application in person and the Prospective Employer uses FMCSA information for an adverse employment decision (e.g., not hiring), the Prospective Employer must provide you with a copy of the report and a written summary of your rights under the Fair Credit Reporting Act before taking final action. The Prospective Employer will notify you if adverse action is taken based on your driving history or safety report, stating that the action was based on the report.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-semibold">Adverse Action Process (Non-In-Person Application):</p>
                    <p>
                      If you submit your application by mail, telephone, computer, or similar means, and FMCSA information is used for an adverse employment decision, the Prospective Employer must provide you oral, written, or electronic notification within three business days of taking adverse action. This notification must state that adverse action was taken based on FMCSA information, provide the name, address, and toll-free telephone number of FMCSA, clarify that FMCSA did not make the decision and cannot provide specific reasons for the adverse action, and inform you of your right to request a free copy of the report (with proper identification) and dispute its accuracy with FMCSA.
                    </p>
                    <p>
                      If you request a driver record from the Prospective Employer who procured it, the Prospective Employer must send you a copy of the report and a summary of your rights under the Fair Credit Reporting Act within three business days of receiving your request and proper identification.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-semibold">Challenging Data Accuracy:</p>
                    <p>
                      Neither the Prospective Employer nor the FMCSA contractor can correct incorrect safety data. You can challenge data accuracy by submitting a request to the website: <strong>https://dataqs.fmcsa.dot.gov</strong>. If crash or inspection information reported by a State is challenged, FMCSA cannot change or correct it; the request will be forwarded by the DataQs system to the appropriate State for adjudication.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-semibold">PSP Report Content:</p>
                    <p>
                      The PSP report will display any crash or inspection in which you were involved. It explicitly states that the PSP report does not report, assign, or imply fault. It includes all Commercial Motor Vehicle (CMV) crashes where you were a driver or co-driver and reported to FMCSA, regardless of fault. All inspections, with or without violations, appear on the PSP report. State citations associated with Federal Motor Carrier Safety Regulations (FMCSR) violations adjudicated by a court of law will also appear and remain on the PSP report.
                    </p>
                  </div>
                  <p className="font-semibold">
                    The Prospective Employer cannot obtain background reports from FMCSA without your authorization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authorization Text */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 shadow-md mb-6">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-4">
              AUTHORIZATION
            </h3>
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="text-base text-gray-800 space-y-4 leading-relaxed">
                <p>
                  If you agree that the Prospective Employer may obtain such background reports, please read the following and sign below:
                </p>
                <p>
                  I authorize <strong>GLOBAL COOPERATION LLC</strong> ("Prospective Employer") to access the FMCSA Pre-Employment Screening Program (PSP) system. I understand that the Prospective Employer will request release of my safety performance information, including crash data from the previous five (5) years and inspection history from the previous three (3) years, and acknowledge that this information will be used to determine my suitability for employment.
                </p>
                <p>
                  I understand that neither the Prospective Employer nor the FMCSA contractor can correct incorrect safety data. I understand that I can challenge data accuracy by submitting a request to <strong>https://dataqs.fmcsa.dot.gov</strong>. I understand that if crash or inspection information reported by a State is challenged, FMCSA cannot change or correct it; the request will be forwarded by the DataQs system to the appropriate State for adjudication.
                </p>
                <p>
                  I understand that any crash or inspection in which I was involved will display on my PSP report. I understand that the PSP report does not report, assign, or imply fault. I understand that all Commercial Motor Vehicle (CMV) crashes where I was a driver or co-driver and reported to FMCSA, regardless of fault, will appear on my PSP report. I understand that all inspections, with or without violations, appear on the PSP report. I understand that State citations associated with Federal Motor Carrier Safety Regulations (FMCSR) violations adjudicated by a court of law will also appear and remain on the PSP report.
                </p>
                <p>
                  I confirm that I have read the Disclosure Regarding Background Reports and, by signing, I authorize the Prospective Employer and its employees, authorized agents, and/or affiliates to obtain the authorized information.
                </p>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold mb-2">NOTICE:</p>
                  <p className="text-sm">
                    This form is available to monthly account holders by NIC on behalf of the U.S. Department of Transportation, Federal Motor Carrier Safety Administration (FMCSA). Account holders must obtain an Applicant's written or electronic consent and use the language contained in this Disclosure and Authorization form exactly as provided, as a stand-alone document, not to be included with other consent forms or language.
                  </p>
                </div>
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold mb-2">NOTICE:</p>
                  <p className="text-sm">
                    The prospective employment concept referenced in this form contemplates the definition of "employee" contained at 49 C.F.R. 383.5.
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
              <div className="flex flex-col sm:flex-row gap-4 mb-3">
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
                      try {
                        fetch(dataUrl)
                          .then((res) => res.blob())
                          .then((blob) => {
                            const file = new File([blob], "signature.png", {
                              type: "image/png",
                            });
                            setValue("pspSignatureFile", file, {
                              shouldValidate: true,
                            });
                            setValue("pspSignature", "Drawn signature", {
                              shouldValidate: false,
                            });
                            setSignatureDataUrl(dataUrl);
                          })
                          .catch((error) => {
                            console.error("Error saving signature:", error);
                          });
                      } catch (error) {
                        console.error("Error processing signature:", error);
                      }
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
                        const value = e.target.value.toUpperCase();
                        setValue("pspSignature", value, { shouldValidate: true });
                        // Clear existing timeout
                        if (textSignatureTimeoutRef.current) {
                          clearTimeout(textSignatureTimeoutRef.current);
                        }
                        // Wait 5.5 seconds before generating and saving signature file
                        textSignatureTimeoutRef.current = setTimeout(() => {
                          generateTextSignatureFile(value);
                        }, 5500);
                      }
                    })}
                    placeholder="Type your full name as signature"
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-dancing-script text-2xl ${
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
                lang="en-US"
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

