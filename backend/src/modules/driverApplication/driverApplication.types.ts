import { z } from 'zod';

// Validation schemas
export const PreviousAddressSchema = z.object({
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(5),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const DriverLicenseSchema = z.object({
  licenseNumber: z.string().min(1),
  state: z.string().length(2),
  class: z.string().min(1),
  expiresAt: z.string(),
  endorsements: z.string().optional(),
  hasOtherLicensesLast3Years: z.boolean(),
  otherLicensesJson: z.any().optional(),
});

export const EmploymentRecordSchema = z.object({
  employerName: z.string().min(1),
  employerPhone: z.string().optional(),
  employerFax: z.string().optional(),
  employerEmail: z.string().email().optional().or(z.literal('')),
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(5),
  positionHeld: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  equipmentClass: z.string().optional(),
  wasSubjectToFMCSR: z.boolean(),
  wasSafetySensitive: z.boolean(),
});

export const LegalConsentSchema = z.object({
  type: z.enum(['AUTHORIZATION', 'ALCOHOL_DRUG', 'SAFETY_PERFORMANCE', 'PSP', 'CLEARINGHOUSE', 'MVR']),
  accepted: z.boolean(),
  signedAt: z.string().optional(),
  formVersion: z.string().optional(),
});

export const DriverApplicationDTOSchema = z.object({
  // Identity
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  phone: z.string().min(10),
  email: z.string().email(),

  // Address
  currentAddressLine1: z.string().min(1),
  currentCity: z.string().min(1),
  currentState: z.string().length(2),
  currentZip: z.string().min(5),
  livedAtCurrentMoreThan3Years: z.boolean(),
  previousAddresses: z.array(PreviousAddressSchema).optional(),

  // SSN (optional)
  ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/).optional().or(z.literal('')),

  // Driver Type
  applicantType: z.enum(['COMPANY_DRIVER', 'OWNER_OPERATOR']).optional(),
  truckYear: z.string().optional(),
  truckMake: z.string().optional(),

  // Alcohol & Drug Test
  alcoholDrugReturnToDuty: z.boolean().optional(),

  // License
  license: DriverLicenseSchema,

  // Medical Card
  medicalCardExpiresAt: z.string().optional(),

  // Employment History
  employmentRecords: z.array(EmploymentRecordSchema),

  // Legal Consents
  legalConsents: z.array(LegalConsentSchema),
});

export type DriverApplicationDTO = z.infer<typeof DriverApplicationDTOSchema>;
export type PreviousAddressDTO = z.infer<typeof PreviousAddressSchema>;
export type DriverLicenseDTO = z.infer<typeof DriverLicenseSchema>;
export type EmploymentRecordDTO = z.infer<typeof EmploymentRecordSchema>;
export type LegalConsentDTO = z.infer<typeof LegalConsentSchema>;

// File upload types
export interface DriverApplicationFiles {
  licenseFront?: Express.Multer.File;
  licenseBack?: Express.Multer.File;
  medicalCard?: Express.Multer.File;
  consentSignatures?: { [key: string]: Express.Multer.File | undefined };
}

// Metadata from request
export interface ApplicationMetadata {
  applicantIp?: string;
  userAgent?: string;
}

