"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import Step1ApplicantInfo from "./DriverApplicationSteps/Step1ApplicantInfo";
import Step2LicenseInfo from "./DriverApplicationSteps/Step2LicenseInfo";
import Step3MedicalCard from "./DriverApplicationSteps/Step3MedicalCard";
import Step4EmploymentHistory from "./DriverApplicationSteps/Step4EmploymentHistory";
import Step5Authorization from "./DriverApplicationSteps/Step5Authorization";
import Step6AlcoholDrug from "./DriverApplicationSteps/Step5AlcoholDrug";
import Step7PSP from "./DriverApplicationSteps/Step6PSP";
import Step8Clearinghouse from "./DriverApplicationSteps/Step7Clearinghouse";
import Step9MVR from "./DriverApplicationSteps/Step8MVR";

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
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province/Region is required"),
  zip: z.string().optional(), // Optional for non-US countries
  positionHeld: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  equipmentClass: z.string().optional(),
  wasSubjectToFMCSR: z.boolean(),
  wasSafetySensitive: z.boolean(),
}).refine((data) => {
  // If country is US, zip is required and state must be 2 letters
  if (data.country === "US") {
    return data.zip && data.zip.length >= 5 && data.state.length === 2;
  }
  // For other countries, state is required but zip is optional
  return data.state && data.state.length > 0;
}, {
  message: "Please provide valid state and zip code for US, or state/province for other countries",
  path: ["state"], // Error will show on state field
});

const fullFormSchema = z.object({
  // Step 1
  applicantType: z.enum(["COMPANY_DRIVER", "OWNER_OPERATOR"]).refine(
    (val) => val === "COMPANY_DRIVER" || val === "OWNER_OPERATOR",
    {
      message: "Please select your driver type",
    }
  ),
  truckYear: z.string().optional(),
  truckMake: z.string().optional(),
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
  medicalCardExpiresAt: z.string().optional().refine(
    (val) => {
      // If empty or undefined, it's valid (optional field)
      if (!val || val.trim() === "") return true;
      
      // Check date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(val)) return false;
      
      const [year, month, day] = val.split('-').map(Number);
      
      // Validate date components directly
      if (year < 1900 || year > 2100) return false;
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      
      // Create date in local timezone to avoid UTC parsing issues
      const date = new Date(year, month - 1, day);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return false;
      
      // Verify the date components match (prevents invalid dates like 2029-28-01)
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        return false;
      }
      
      // Check if date is not expired (compare dates only, not time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    },
    {
      message: "Medical card expiration date must be valid and not expired",
    }
  ),

  // Step 4
  employmentRecords: z.array(employmentRecordSchema).min(1, "At least one employment record is required"),

  // Step 5 - Authorization
  authorizationSignature: z.string().optional(),
  authorizationSignatureFile: z.instanceof(File).optional(),
  authorizationDateSigned: z.string().min(1, "Date signed is required"),

  // Step 6
  alcoholDrugPositive: z.boolean(),
  alcoholDrugPositiveExplanation: z.string().optional(),
  alcoholConcentration: z.boolean(),
  alcoholConcentrationExplanation: z.string().optional(),
  refusedTest: z.boolean(),
  refusedTestExplanation: z.string().optional(),
  alcoholDrugReturnToDuty: z.boolean().optional(),
  alcoholDrugName: z.string().min(1, "Name is required"),
  alcoholDrugSignature: z.string().optional(),
  alcoholDrugSignatureFile: z.instanceof(File).optional(),
  alcoholDrugDateSigned: z.string().min(1, "Date signed is required"),

  // Step 7
  pspFullName: z.string().min(1, "Full name is required"),
  pspSignature: z.string().optional(),
  pspSignatureFile: z.instanceof(File).optional(),
  pspDateSigned: z.string().min(1, "Date signed is required"),

  // Step 8
  clearinghouseSignature: z.string().optional(),
  clearinghouseSignatureFile: z.instanceof(File).optional(),
  clearinghouseDateSigned: z.string().min(1, "Date signed is required"),
  clearinghouseRegistered: z.boolean(),

  // Step 9
  mvrSignature: z.string().optional(),
  mvrSignatureFile: z.instanceof(File).optional(),
  mvrDateSigned: z.string().min(1, "Date signed is required"),
}).superRefine((data, ctx) => {
  if (!data.applicantType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select your driver type",
      path: ["applicantType"],
    });
  }
  if (data.applicantType === "OWNER_OPERATOR") {
    if (!data.truckYear || !data.truckYear.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Truck year is required for Owner Operators",
        path: ["truckYear"],
      });
    }
    if (!data.truckMake || !data.truckMake.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Truck make is required for Owner Operators",
        path: ["truckMake"],
      });
    }
  }
});

export type DriverApplicationFormData = z.infer<typeof fullFormSchema>;

const TOTAL_STEPS = 9;

export default function DriverApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Confetti animation on success
  useEffect(() => {
    if (submitSuccess) {
      // Create a beautiful confetti burst
      const duration = 3000; // 3 seconds
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Launch confetti from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Cleanup
      return () => clearInterval(interval);
    }
  }, [submitSuccess]);

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
          country: "US",
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
      alcoholDrugReturnToDuty: false,
      clearinghouseRegistered: false,
    },
  });

  const watchedValues = watch();

  const validateCurrentStep = async () => {
    console.log("=== validateCurrentStep START ===");
    console.log("Current step:", currentStep);
    let fieldsToValidate: (keyof DriverApplicationFormData)[] = [];

    // Helper function to validate date format
    const isValidDate = (dateString: string | undefined): boolean => {
      if (!dateString || dateString.trim() === "") return false;
      // Check if date string matches YYYY-MM-DD format (HTML5 date input format)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateString)) {
        console.log("Date regex failed for:", dateString);
        return false;
      }
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Validate date components directly (more reliable than Date parsing)
      if (year < 1900 || year > 2100) {
        console.log("Year out of range:", year);
        return false;
      }
      if (month < 1 || month > 12) {
        console.log("Month out of range:", month);
        return false;
      }
      if (day < 1 || day > 31) {
        console.log("Day out of range:", day);
        return false;
      }
      
      // Create date in local timezone to avoid UTC parsing issues
      const date = new Date(year, month - 1, day);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log("Date is NaN:", dateString);
        return false;
      }
      
      // Verify the date components match (prevents invalid dates like 2029-28-01)
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        console.log("Date components don't match:", {
          input: { year, month, day },
          parsed: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
        });
        return false;
      }
      
      console.log("Date is valid:", dateString);
      return true;
    };

    switch (currentStep) {
      case 1:
        console.log("Validating Step 1");
        fieldsToValidate = [
          "applicantType",
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
        console.log("Base fields to validate:", fieldsToValidate);
        console.log("applicantType value:", watchedValues.applicantType);
        
        // Add truck fields if owner operator
        if (watchedValues.applicantType === "OWNER_OPERATOR") {
          fieldsToValidate.push("truckYear", "truckMake");
          console.log("Added truck fields for OWNER_OPERATOR");
          console.log("truckYear:", watchedValues.truckYear);
          console.log("truckMake:", watchedValues.truckMake);
        }
        console.log("All fields to validate:", fieldsToValidate);
        
        // Don't validate date here - let trigger handle it
        // We'll check it after trigger
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
        // Validate date format
        if (!isValidDate(watchedValues.licenseExpiresAt)) {
          return false;
        }
        break;
      case 3:
        fieldsToValidate = ["medicalCardFile"];
        // Validate medical card expiration date if provided (optional field)
        const medicalCardDate = watchedValues.medicalCardExpiresAt;
        if (medicalCardDate && medicalCardDate.trim() !== "") {
          // If date is provided, it must be valid and not expired
          if (!isValidDate(medicalCardDate)) {
            return false;
          }
          const expirationDate = new Date(medicalCardDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to compare dates only
          if (expirationDate < today) {
            return false; // Date is expired
          }
        }
        break;
      case 4:
        fieldsToValidate = ["employmentRecords"];
        break;
      case 5:
        fieldsToValidate = ["authorizationDateSigned"];
        // Validate date format
        if (!isValidDate(watchedValues.authorizationDateSigned)) {
          return false;
        }
        // Validate signature (either text or file)
        const hasAuthorizationSignature = 
          (watchedValues.authorizationSignature && watchedValues.authorizationSignature.trim() !== "") ||
          watchedValues.authorizationSignatureFile;
        if (!hasAuthorizationSignature) {
          return false;
        }
        break;
      case 6:
        fieldsToValidate = [
          "alcoholDrugName",
          "alcoholDrugDateSigned",
        ];
        // Validate date format
        if (!isValidDate(watchedValues.alcoholDrugDateSigned)) {
          return false;
        }
        // Validate signature (either text or file)
        const hasAlcoholDrugSignature = 
          (watchedValues.alcoholDrugSignature && watchedValues.alcoholDrugSignature.trim() !== "") ||
          watchedValues.alcoholDrugSignatureFile;
        if (!hasAlcoholDrugSignature) {
          return false;
        }
        break;
      case 7:
        fieldsToValidate = ["pspFullName", "pspDateSigned"];
        // Validate date format
        if (!isValidDate(watchedValues.pspDateSigned)) {
          return false;
        }
        const hasPSPSignature = 
          (watchedValues.pspSignature && watchedValues.pspSignature.trim() !== "") ||
          watchedValues.pspSignatureFile;
        if (!hasPSPSignature) {
          return false;
        }
        break;
      case 8:
        fieldsToValidate = [
          "clearinghouseDateSigned",
          "clearinghouseRegistered",
        ];
        // Validate date format
        if (!isValidDate(watchedValues.clearinghouseDateSigned)) {
          return false;
        }
        const hasClearinghouseSignature = 
          (watchedValues.clearinghouseSignature && watchedValues.clearinghouseSignature.trim() !== "") ||
          watchedValues.clearinghouseSignatureFile;
        if (!hasClearinghouseSignature) {
          return false;
        }
        break;
      case 9:
        fieldsToValidate = ["mvrDateSigned"];
        // Validate date format
        if (!isValidDate(watchedValues.mvrDateSigned)) {
          return false;
        }
        const hasMVRSignature = 
          (watchedValues.mvrSignature && watchedValues.mvrSignature.trim() !== "") ||
          watchedValues.mvrSignatureFile;
        if (!hasMVRSignature) {
          return false;
        }
        break;
    }

    // Trigger validation for all fields in this step
    console.log("Triggering validation for fields:", fieldsToValidate);
    const isValid = await trigger(fieldsToValidate);
    console.log("Trigger result:", isValid);
    
    // If trigger returned false, there are validation errors
    if (!isValid) {
      console.log("Validation failed - trigger returned false");
      console.log("Fields being validated:", fieldsToValidate);
      console.log("Current errors object:", errors);
      
      // Check each field individually
      for (const field of fieldsToValidate) {
        const fieldError = errors[field];
        if (fieldError) {
          console.log(`Field "${field}" has error:`, fieldError);
        } else {
          console.log(`Field "${field}" is OK`);
        }
      }
      return false;
    }
    
    // Additional manual checks for critical fields that might not be caught by trigger
    // Check applicantType specifically (radio buttons can be tricky)
    if (fieldsToValidate.includes("applicantType")) {
      const applicantTypeValue = watchedValues.applicantType;
      console.log("Checking applicantType:", applicantTypeValue);
      if (!applicantTypeValue || 
          (applicantTypeValue !== "COMPANY_DRIVER" && applicantTypeValue !== "OWNER_OPERATOR")) {
        console.log("applicantType validation failed:", applicantTypeValue);
        return false;
      }
      console.log("applicantType is valid");
    }
    
    // Check dateOfBirth
    if (fieldsToValidate.includes("dateOfBirth")) {
      const dateValue = watchedValues.dateOfBirth;
      console.log("Checking dateOfBirth:", dateValue, "Type:", typeof dateValue);
      if (!dateValue || typeof dateValue !== "string" || dateValue.trim() === "") {
        console.log("dateOfBirth is empty or invalid type");
        return false;
      }
      if (!isValidDate(dateValue)) {
        console.log("dateOfBirth format is invalid:", dateValue, "Expected format: YYYY-MM-DD");
        return false;
      }
      console.log("dateOfBirth is valid");
    }
    
    // Wait a moment for errors to update, then check one more time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Final check: verify no errors exist in the form state
    console.log("Final error check - errors object:", errors);
    const hasFormErrors = fieldsToValidate.some(field => {
      const fieldError = errors[field];
      if (fieldError) {
        console.log(`Field "${field}" has error after trigger:`, fieldError);
        return true;
      }
      return false;
    });
    
    if (hasFormErrors) {
      console.log("Final check failed - errors found");
      return false;
    }
    
    console.log("All validations passed!");
    return true;
  };

  const formRef = useRef<HTMLDivElement>(null);

  // Function to find the first step with errors and navigate to it
  const findFirstStepWithErrors = (validationErrors: typeof errors): number => {
    // Define which fields belong to which step
    const stepFields: Record<number, (keyof DriverApplicationFormData)[]> = {
      1: ["applicantType", "firstName", "lastName", "dateOfBirth", "phone", "email", "currentAddressLine1", "currentCity", "currentState", "currentZip", "livedAtCurrentMoreThan3Years", "truckYear", "truckMake"],
      2: ["licenseNumber", "licenseState", "licenseClass", "licenseExpiresAt", "licenseFrontFile", "licenseBackFile"],
      3: ["medicalCardFile", "medicalCardExpiresAt"],
      4: ["employmentRecords"],
      5: ["authorizationDateSigned", "authorizationSignature", "authorizationSignatureFile"],
      6: ["alcoholDrugName", "alcoholDrugDateSigned", "alcoholDrugSignature", "alcoholDrugSignatureFile"],
      7: ["pspFullName", "pspDateSigned", "pspSignature", "pspSignatureFile"],
      8: ["clearinghouseDateSigned", "clearinghouseRegistered", "clearinghouseSignature", "clearinghouseSignatureFile"],
      9: ["mvrDateSigned", "mvrSignature", "mvrSignatureFile"],
    };

    // Check each step in order
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const fields = stepFields[step] || [];
      const hasError = fields.some(field => {
        const error = validationErrors[field];
        return error !== undefined && error !== null;
      });
      
      if (hasError) {
        return step;
      }
    }
    
    return currentStep; // If no errors found, stay on current step
  };

  // Function to scroll to first field with error
  const scrollToFirstError = () => {
    setTimeout(() => {
      // Find first input/select/textarea with error class
      const firstErrorField = formRef.current?.querySelector('.border-red-500, input:invalid, select:invalid, textarea:invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus on the field
        if (firstErrorField instanceof HTMLElement && 'focus' in firstErrorField) {
          (firstErrorField as HTMLElement).focus();
        }
      } else {
        // If no specific field found, scroll to top of form
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Function to save all signatures before step change
  const saveAllSignatures = async () => {
    // Find all signature canvas elements
    const signatureCanvases = formRef.current?.querySelectorAll('.signature-canvas');
    if (!signatureCanvases || signatureCanvases.length === 0) return;
    
    const savePromises: Promise<void>[] = [];
    
    signatureCanvases.forEach((canvas) => {
      // Try to find the react-signature-canvas instance through various methods
      const reactCanvas = (canvas as any);
      
      // Method 1: Try to find through parent component
      let sigPad: any = null;
      
      // Check if canvas has direct reference
      if (reactCanvas.__reactInternalFiber) {
        let fiber = reactCanvas.__reactInternalFiber;
        while (fiber) {
          if (fiber.memoizedProps?.ref?.current) {
            sigPad = fiber.memoizedProps.ref.current;
            break;
          }
          fiber = fiber.return;
        }
      }
      
      // Method 2: Try to find through parent element
      if (!sigPad) {
        const parent = canvas.parentElement;
        if (parent) {
          const parentComponent = (parent as any).__reactInternalFiber;
          if (parentComponent) {
            let fiber = parentComponent;
            while (fiber) {
              if (fiber.memoizedProps?.ref?.current) {
                sigPad = fiber.memoizedProps.ref.current;
                break;
              }
              fiber = fiber.return;
            }
          }
        }
      }
      
      if (sigPad && typeof sigPad.saveSignature === 'function') {
        const isEmpty = typeof sigPad.isEmpty === 'function' ? sigPad.isEmpty() : false;
        if (!isEmpty) {
          savePromises.push(
            new Promise((resolve) => {
              try {
                sigPad.saveSignature();
                setTimeout(resolve, 50); // Small delay to ensure save completes
              } catch (error) {
                console.warn('Failed to save signature:', error);
                resolve();
              }
            })
          );
        }
      }
    });
    
    // Wait for all signatures to be saved
    if (savePromises.length > 0) {
      await Promise.all(savePromises);
      // Additional delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  };

  const handleNext = async () => {
    console.log("=== handleNext called ===");
    console.log("Current step:", currentStep);
    console.log("Watched values:", watchedValues);
    console.log("Current errors:", errors);
    
    // Save any pending signatures before validation
    await saveAllSignatures();
    
    const isValid = await validateCurrentStep();
    
    console.log("Validation result:", isValid);
    console.log("Can proceed:", isValid && currentStep < TOTAL_STEPS);
    
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
      // Scroll to top of form container
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSubmitError(null);
      // Scroll to top of form container
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Scroll to top of form when step changes
  useEffect(() => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [currentStep]);

  const onSubmit = async (data: DriverApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      
      // Проверяем, что API URL установлен в production
      if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
        console.error("NEXT_PUBLIC_API_URL is not set in production!");
        throw new Error("Server configuration error. Please contact support.");
      }

      // Prepare FormData
      const formData = new FormData();

      // Prepare JSON payload
      const payload = {
        applicantType: data.applicantType,
        truckYear: data.truckYear || null,
        truckMake: data.truckMake || null,
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
          country: record.country || "US",
          city: record.city,
          state: record.state,
          zip: record.zip || "",
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
            type: "AUTHORIZATION",
            accepted: true,
            signedAt: data.authorizationDateSigned,
            formVersion: "1.0",
          },
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
      if (data.authorizationSignatureFile) {
        formData.append("consentAuthorization", data.authorizationSignatureFile);
      }
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
        let errorData: any = {};
        const contentType = response.headers.get("content-type");
        
        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            errorData = { message: text || `HTTP ${response.status}` };
          }
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.message || errorData.error || errorData.details || "Unknown error";
        
        // Логируем детали ошибки для отладки (только в development)
        if (process.env.NODE_ENV === "development") {
          console.error("Backend error details:", {
            status: response.status,
            statusText: response.statusText,
            errorMessage,
            errorData,
            apiUrl,
          });
        }
        
        // Преобразуем технические ошибки в понятные сообщения для пользователей
        let userFriendlyMessage = "Something went wrong. Please try again or contact our office.";
        
        // Проверяем конкретные типы ошибок
        if (response.status === 400) {
          // Bad Request - обычно валидация
          if (errorMessage.includes("Validation failed") || 
              errorMessage.includes("validation") || 
              errorMessage.includes("required") ||
              errorMessage.includes("invalid") ||
              errorMessage.toLowerCase().includes("field")) {
            userFriendlyMessage = "Please check all required fields and ensure all information is correct.";
          } else if (errorMessage.includes("date") || errorMessage.includes("Date") || errorMessage.includes("expiration")) {
            userFriendlyMessage = "Please check all date fields and ensure they are valid dates in the correct format.";
          } else if (errorMessage.includes("File") || errorMessage.includes("file") || errorMessage.includes("upload")) {
            userFriendlyMessage = "There was an issue with one of your uploaded files. Please check that all files are valid images or PDFs and try again.";
          } else {
            userFriendlyMessage = "Please check all required fields and try again.";
          }
        } else if (response.status === 422) {
          // Unprocessable Entity - валидация данных
          userFriendlyMessage = "Please check all required fields and ensure all information is correct.";
        } else if (response.status === 413) {
          // Payload Too Large
          userFriendlyMessage = "File size is too large. Please reduce the size of your uploaded files and try again.";
        } else if (response.status === 429) {
          userFriendlyMessage = "Too many requests. Please wait a moment and try again.";
        } else if (response.status >= 500) {
          userFriendlyMessage = "Server error. Please try again in a few moments or contact our office.";
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
          userFriendlyMessage = "Network error. Please check your internet connection and try again.";
        }
        
        throw new Error(userFriendlyMessage);
      }

      setSubmitSuccess(true);
    } catch (error) {
      // Don't log sensitive data - only log safe error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Логируем детали для отладки
      if (process.env.NODE_ENV === "development") {
        console.error("Submission error:", {
          message: errorMessage,
          error: error,
          apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
        });
      }
      
      // Если это ошибка сети, показываем более понятное сообщение
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setSubmitError("Unable to connect to server. Please check your internet connection and try again.");
      } else {
        setSubmitError(errorMessage);
      }
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
    <div ref={formRef} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">

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
      <form 
        lang="en-US"
        onSubmit={(e) => {
          // ALWAYS prevent default form submission
          // Form will ONLY submit via explicit button click handler below
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onKeyDown={(e) => {
          // Prevent form submission on Enter key
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }}
        noValidate
      >
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
          <Step5Authorization
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 6 && (
          <Step6AlcoholDrug
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 7 && (
          <Step7PSP register={register} errors={errors} watch={watch} setValue={setValue} />
        )}
        {currentStep === 8 && (
          <Step8Clearinghouse
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}
        {currentStep === 9 && (
          <Step9MVR register={register} errors={errors} watch={watch} setValue={setValue} />
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">Please fix the following errors:</h3>
                <p className="text-red-700 text-sm whitespace-pre-line">{submitError}</p>
              </div>
            </div>
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
              type="button"
              disabled={isSubmitting}
              onClick={async (e) => {
                // Explicitly prevent any accidental submissions
                e.preventDefault();
                e.stopPropagation();
                
                if (isSubmitting) {
                  return;
                }
                
                if (currentStep !== TOTAL_STEPS) {
                  return;
                }
                
                // Validate current step first
                const stepValid = await validateCurrentStep();
                if (!stepValid) {
                  setSubmitError("Please fill in all required fields before submitting.");
                  // Scroll to top to show errors
                  setTimeout(() => {
                    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                  return;
                }
                
                // Use handleSubmit which will validate ALL fields and call onSubmit if valid
                // handleSubmit returns a function that validates and calls onSubmit
                handleSubmit(
                  (data) => {
                    // This callback is only called if validation passes
                    onSubmit(data);
                  },
                  (errors) => {
                    // This callback is called if validation fails
                    console.log("Validation errors:", errors);
                    
                    // Find the first step with errors
                    const firstErrorStep = findFirstStepWithErrors(errors);
                    
                    // Navigate to that step
                    if (firstErrorStep !== currentStep) {
                      setCurrentStep(firstErrorStep);
                    }
                    
                    // Collect error messages for display with user-friendly field names
                    const errorMessages: string[] = [];
                    const fieldNameMap: Record<string, string> = {
                      applicantType: "Driver Type",
                      firstName: "First Name",
                      lastName: "Last Name",
                      dateOfBirth: "Date of Birth",
                      phone: "Phone",
                      email: "Email",
                      currentAddressLine1: "Address",
                      currentCity: "City",
                      currentState: "State",
                      currentZip: "Zip Code",
                      truckYear: "Truck Year",
                      truckMake: "Truck Make",
                      licenseNumber: "License Number",
                      licenseState: "License State",
                      licenseClass: "License Class",
                      licenseExpiresAt: "License Expiration Date",
                      licenseFrontFile: "License Front Photo",
                      licenseBackFile: "License Back Photo",
                      medicalCardFile: "Medical Card",
                      medicalCardExpiresAt: "Medical Card Expiration Date",
                      employmentRecords: "Employment History",
                      authorizationDateSigned: "Authorization Date",
                      authorizationSignature: "Authorization Signature",
                      authorizationSignatureFile: "Authorization Signature",
                      alcoholDrugName: "Name",
                      alcoholDrugDateSigned: "Date Signed",
                      alcoholDrugSignature: "Signature",
                      alcoholDrugSignatureFile: "Signature",
                      pspFullName: "Full Name",
                      pspDateSigned: "Date Signed",
                      pspSignature: "Signature",
                      pspSignatureFile: "Signature",
                      clearinghouseDateSigned: "Date Signed",
                      clearinghouseRegistered: "Clearinghouse Registration",
                      clearinghouseSignature: "Signature",
                      clearinghouseSignatureFile: "Signature",
                      mvrDateSigned: "Date Signed",
                      mvrSignature: "Signature",
                      mvrSignatureFile: "Signature",
                    };
                    
                    const stepFields: Record<number, (keyof DriverApplicationFormData)[]> = {
                      1: ["applicantType", "firstName", "lastName", "dateOfBirth", "phone", "email", "currentAddressLine1", "currentCity", "currentState", "currentZip", "truckYear", "truckMake"],
                      2: ["licenseNumber", "licenseState", "licenseClass", "licenseExpiresAt", "licenseFrontFile", "licenseBackFile"],
                      3: ["medicalCardFile", "medicalCardExpiresAt"],
                      4: ["employmentRecords"],
                      5: ["authorizationDateSigned", "authorizationSignature", "authorizationSignatureFile"],
                      6: ["alcoholDrugName", "alcoholDrugDateSigned", "alcoholDrugSignature", "alcoholDrugSignatureFile"],
                      7: ["pspFullName", "pspDateSigned", "pspSignature", "pspSignatureFile"],
                      8: ["clearinghouseDateSigned", "clearinghouseRegistered", "clearinghouseSignature", "clearinghouseSignatureFile"],
                      9: ["mvrDateSigned", "mvrSignature", "mvrSignatureFile"],
                    };
                    
                    const fields = stepFields[firstErrorStep] || [];
                    fields.forEach(field => {
                      const error = errors[field];
                      if (error?.message) {
                        const friendlyName = fieldNameMap[field as string] || field.toString();
                        errorMessages.push(`• ${friendlyName}: ${error.message}`);
                      }
                    });
                    
                    // Show detailed error message
                    if (errorMessages.length > 0) {
                      const stepNames: Record<number, string> = {
                        1: "Applicant Information",
                        2: "License Information",
                        3: "Medical Card",
                        4: "Employment History",
                        5: "Authorization & Certification",
                        6: "Alcohol & Drug Test Statement",
                        7: "PSP Driver Disclosure",
                        8: "FMCSA Clearinghouse Consent",
                        9: "MVR Release Consent",
                      };
                      const stepName = stepNames[firstErrorStep] || `Step ${firstErrorStep}`;
                      setSubmitError(`Step ${firstErrorStep} - ${stepName}:\n\n${errorMessages.slice(0, 5).join('\n')}${errorMessages.length > 5 ? `\n\n...and ${errorMessages.length - 5} more error(s)` : ''}`);
                    } else {
                      setSubmitError(`Please check all fields on Step ${firstErrorStep} and fix any errors before submitting.`);
                    }
                    
                    // Scroll to first error field
                    scrollToFirstError();
                  }
                )();
              }}
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

