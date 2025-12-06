"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Step1ApplicantInfo from "./DriverApplicationSteps/Step1ApplicantInfo";
import Step2LicenseInfo from "./DriverApplicationSteps/Step2LicenseInfo";
import Step3MedicalCard from "./DriverApplicationSteps/Step3MedicalCard";
import Step4EmploymentHistory from "./DriverApplicationSteps/Step4EmploymentHistory";
import Step5AlcoholDrug from "./DriverApplicationSteps/Step5AlcoholDrug";
import Step6PSP from "./DriverApplicationSteps/Step6PSP";
import Step7Clearinghouse from "./DriverApplicationSteps/Step7Clearinghouse";
import Step8MVR from "./DriverApplicationSteps/Step8MVR";

// Zod schemas for each step
const previousAddressSchema = z.object({
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 letters"),
  zip: z.string().min(5, "Zip code is required"),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

const otherLicenseSchema = z.object({
  licenseNumber: z.string().min(1),
  state: z.string().length(2),
  class: z.string().min(1),
});

const employmentRecordSchema = z.object({
  employerName: z.string().min(1, "Employer name is required"),
  employerPhone: z.string().optional(),
  employerFax: z.string().optional(),
  employerEmail: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 letters"),
  zip: z.string().min(5, "Zip code is required"),
  positionHeld: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  equipmentClass: z.string().optional(),
  wasSubjectToFMCSR: z.boolean(),
  wasSafetySensitive: z.boolean(),
});

const fullFormSchema = z.object({
  // Step 1
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 21;
    },
    {
      message: "You must be at least 21 years old to drive commercially",
    }
  ),
  ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, "Invalid SSN format").optional().or(z.literal("")),
  phone: z.string().regex(/^\(\d{3}\)\d{3}-\d{2}-\d{2}$/, "Invalid phone format. Use format: (XXX)XXX-XX-XX"),
  email: z.string().email("Invalid email"),
  currentAddressLine1: z.string().min(1, "Address is required"),
  currentCity: z.string().min(1, "City is required"),
  currentState: z.string().length(2, "State must be 2 letters"),
  currentZip: z.string().min(5, "Zip code is required"),
  livedAtCurrentMoreThan3Years: z.boolean(),
  previousAddresses: z.array(previousAddressSchema).optional(),

  // Step 2
  licenseNumber: z.string().min(1, "License number is required"),
  licenseState: z.string().length(2, "State must be 2 letters"),
  licenseClass: z.string().min(1, "License class is required"),
  licenseExpiresAt: z.string().min(1, "Expiration date is required").refine(
    (date) => {
      if (!date) return false;
      const expirationDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expirationDate >= today;
    },
    {
      message: "CDL expiration date cannot be in the past. Your license must be valid.",
    }
  ),
  endorsements: z.array(z.string()).optional(),
  hasOtherLicensesLast3Years: z.boolean(),
  otherLicenses: z.array(otherLicenseSchema).optional(),
  licenseFrontFile: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, "Front license copy is required"),
  licenseBackFile: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, "Back license copy is required"),

  // Step 3
  medicalCardFile: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, "Medical card copy is required"),
  medicalCardExpiresAt: z.string().optional(),

  // Step 4
  employmentRecords: z.array(employmentRecordSchema).min(1, "At least one employment record is required"),

  // Step 5
  alcoholDrugPositive: z.boolean(),
  alcoholDrugPositiveExplanation: z.string().optional(),
  alcoholConcentration: z.boolean(),
  alcoholConcentrationExplanation: z.string().optional(),
  refusedTest: z.boolean(),
  refusedTestExplanation: z.string().optional(),
  alcoholDrugName: z.string().min(1, "Name is required"),
  alcoholDrugSignature: z.string().optional(),
  alcoholDrugSignatureFile: z.instanceof(File).optional(),
  alcoholDrugDateSigned: z.string().min(1, "Date signed is required"),

  // Step 6
  pspFullName: z.string().min(1, "Full name is required"),
  pspSignature: z.string().optional(),
  pspSignatureFile: z.instanceof(File).optional(),
  pspDateSigned: z.string().min(1, "Date signed is required"),

  // Step 7
  clearinghouseSignature: z.string().optional(),
  clearinghouseSignatureFile: z.instanceof(File).optional(),
  clearinghouseDateSigned: z.string().min(1, "Date signed is required"),
  clearinghouseRegistered: z.boolean(),

  // Step 8
  mvrSignature: z.string().optional(),
  mvrSignatureFile: z.instanceof(File).optional(),
  mvrDateSigned: z.string().min(1, "Date signed is required"),
});

export type DriverApplicationFormData = z.infer<typeof fullFormSchema>;

const TOTAL_STEPS = 8;

export default function DriverApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
    getValues,
  } = useForm<DriverApplicationFormData>({
    resolver: zodResolver(fullFormSchema),
    mode: "onBlur",
    defaultValues: {
      livedAtCurrentMoreThan3Years: false,
      hasOtherLicensesLast3Years: false,
      endorsements: [],
      employmentRecords: [
        {
          employerName: "",
          addressLine1: "",
          city: "",
          state: "",
          zip: "",
          wasSubjectToFMCSR: true,
          wasSafetySensitive: true,
        },
      ],
      alcoholDrugPositive: false,
      alcoholConcentration: false,
      refusedTest: false,
      clearinghouseRegistered: false,
    },
  });

  const watchedValues = watch();

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof DriverApplicationFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "firstName",
          "lastName",
          "dateOfBirth",
          "phone",
          "email",
          "currentAddressLine1",
          "currentCity",
          "currentState",
          "currentZip",
          "livedAtCurrentMoreThan3Years",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "licenseNumber",
          "licenseState",
          "licenseClass",
          "licenseExpiresAt",
          "licenseFrontFile",
          "licenseBackFile",
        ];
        break;
      case 3:
        fieldsToValidate = ["medicalCardFile"];
        break;
      case 4:
        fieldsToValidate = ["employmentRecords"];
        break;
      case 5:
        fieldsToValidate = [
          "alcoholDrugName",
          "alcoholDrugDateSigned",
        ];
        // Validate signature (either text or file)
        const hasAlcoholDrugSignature = 
          (watchedValues.alcoholDrugSignature && watchedValues.alcoholDrugSignature.trim() !== "") ||
          watchedValues.alcoholDrugSignatureFile;
        if (!hasAlcoholDrugSignature) {
          return false;
        }
        break;
      case 6:
        fieldsToValidate = ["pspFullName", "pspDateSigned"];
        const hasPSPSignature = 
          (watchedValues.pspSignature && watchedValues.pspSignature.trim() !== "") ||
          watchedValues.pspSignatureFile;
        if (!hasPSPSignature) {
          return false;
        }
        break;
      case 7:
        fieldsToValidate = [
          "clearinghouseDateSigned",
          "clearinghouseRegistered",
        ];
        const hasClearinghouseSignature = 
          (watchedValues.clearinghouseSignature && watchedValues.clearinghouseSignature.trim() !== "") ||
          watchedValues.clearinghouseSignatureFile;
        if (!hasClearinghouseSignature) {
          return false;
        }
        break;
      case 8:
        fieldsToValidate = ["mvrDateSigned"];
        const hasMVRSignature = 
          (watchedValues.mvrSignature && watchedValues.mvrSignature.trim() !== "") ||
          watchedValues.mvrSignatureFile;
        if (!hasMVRSignature) {
          return false;
        }
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < TOTAL_STEPS) {
      // Auto-fill names when transitioning from Step 1 to Step 2
      if (currentStep === 1) {
        const firstName = (watchedValues.firstName || "").trim().toUpperCase();
        const lastName = (watchedValues.lastName || "").trim().toUpperCase();
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (fullName && fullName !== " ") {
          // Set names only if they are empty
          if (!watchedValues.pspFullName || watchedValues.pspFullName.trim() === "") {
            setValue("pspFullName", fullName, { shouldValidate: false });
          }
          if (!watchedValues.alcoholDrugName || watchedValues.alcoholDrugName.trim() === "") {
            setValue("alcoholDrugName", fullName, { shouldValidate: false });
          }
        }
      }
      
      setCurrentStep(currentStep + 1);
      setSubmitError(null);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSubmitError(null);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const onSubmit = async (data: DriverApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      // Prepare FormData
      const formData = new FormData();

      // Prepare JSON payload
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn ? data.ssn.replace(/-/g, "") : "", // Remove dashes, handle optional
        phone: data.phone,
        email: data.email,
        currentAddressLine1: data.currentAddressLine1,
        currentCity: data.currentCity,
        currentState: data.currentState,
        currentZip: data.currentZip,
        livedAtCurrentMoreThan3Years: data.livedAtCurrentMoreThan3Years,
        previousAddresses: data.previousAddresses || [],
        license: {
          licenseNumber: data.licenseNumber,
          state: data.licenseState,
          class: data.licenseClass,
          expiresAt: data.licenseExpiresAt,
          endorsements: data.endorsements?.join(",") || "",
          hasOtherLicensesLast3Years: data.hasOtherLicensesLast3Years,
          otherLicensesJson: data.hasOtherLicensesLast3Years
            ? data.otherLicenses
            : null,
        },
        medicalCardExpiresAt: data.medicalCardExpiresAt || null,
        employmentRecords: data.employmentRecords.map((record) => ({
          employerName: record.employerName,
          employerPhone: record.employerPhone || "",
          employerFax: record.employerFax || "",
          employerEmail: record.employerEmail || "",
          addressLine1: record.addressLine1,
          city: record.city,
          state: record.state,
          zip: record.zip,
          positionHeld: record.positionHeld || "",
          dateFrom: record.dateFrom || "",
          dateTo: record.dateTo || "",
          reasonForLeaving: record.reasonForLeaving || "",
          equipmentClass: record.equipmentClass || "",
          wasSubjectToFMCSR: record.wasSubjectToFMCSR,
          wasSafetySensitive: record.wasSafetySensitive,
        })),
        legalConsents: [
          {
            type: "ALCOHOL_DRUG",
            accepted: true,
            signedAt: data.alcoholDrugDateSigned,
            formVersion: "1.0",
          },
          {
            type: "SAFETY_PERFORMANCE",
            accepted: true,
            signedAt: data.pspDateSigned,
            formVersion: "1.0",
          },
          {
            type: "PSP",
            accepted: true,
            signedAt: data.pspDateSigned,
            formVersion: "1.0",
          },
          {
            type: "CLEARINGHOUSE",
            accepted: true,
            signedAt: data.clearinghouseDateSigned,
            formVersion: "1.0",
          },
          {
            type: "MVR",
            accepted: true,
            signedAt: data.mvrDateSigned,
            formVersion: "1.0",
          },
        ],
      };

      // Append JSON as string
      Object.keys(payload).forEach((key) => {
        if (key === "previousAddresses" || key === "employmentRecords" || key === "legalConsents") {
          formData.append(key, JSON.stringify((payload as any)[key]));
        } else if (key === "license") {
          formData.append("license", JSON.stringify((payload as any)[key]));
        } else {
          formData.append(key, (payload as any)[key]);
        }
      });

      // Append files
      if (data.licenseFrontFile) {
        formData.append("licenseFront", data.licenseFrontFile);
      }
      if (data.licenseBackFile) {
        formData.append("licenseBack", data.licenseBackFile);
      }
      if (data.medicalCardFile) {
        formData.append("medicalCard", data.medicalCardFile);
      }
      
      // Append signature files
      if (data.alcoholDrugSignatureFile) {
        formData.append("consentAlcoholDrug", data.alcoholDrugSignatureFile);
      }
      if (data.pspSignatureFile) {
        formData.append("consentSafetyPerformance", data.pspSignatureFile);
        formData.append("consentPSP", data.pspSignatureFile);
      }
      if (data.clearinghouseSignatureFile) {
        formData.append("consentClearinghouse", data.clearinghouseSignatureFile);
      }
      if (data.mvrSignatureFile) {
        formData.append("consentMVR", data.mvrSignatureFile);
      }

      // Send to backend
      const response = await fetch(`${apiUrl}/api/driver-applications`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Something went wrong. Please try again or contact our office."
        );
      }

      setSubmitSuccess(true);
    } catch (error) {
      // Don't log sensitive data - only log safe error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (process.env.NODE_ENV === "development") {
        console.error("Submission error:", errorMessage);
      }
      setSubmitError(
        errorMessage.includes("SSN") || errorMessage.includes("ssn")
          ? "Something went wrong. Please try again or contact our office."
          : errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 md:p-12 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Thank you!
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Your driver application has been submitted. Our safety department will review it and contact you.
        </p>
      </div>
    );
  }

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 1 && (
          <Step1ApplicantInfo
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 2 && (
          <Step2LicenseInfo
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 3 && (
          <Step3MedicalCard
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 4 && (
          <Step4EmploymentHistory
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
          />
        )}
        {currentStep === 5 && (
          <Step5AlcoholDrug
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 6 && (
          <Step6PSP register={register} errors={errors} watch={watch} setValue={setValue} />
        )}
        {currentStep === 7 && (
          <Step7Clearinghouse
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 8 && (
          <Step8MVR register={register} errors={errors} watch={watch} setValue={setValue} />
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Back
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
                isSubmitting
                  ? "bg-red-400 cursor-not-allowed opacity-60"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

