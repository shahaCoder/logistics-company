import { PrismaClient } from '@prisma/client';
import { encryptSensitive } from '../../utils/crypto.js';
import { uploadToApplicationFolder } from '../../services/cloudinary.js';
import {
  DriverApplicationDTO,
  DriverApplicationFiles,
  ApplicationMetadata,
} from './driverApplication.types.js';

const prisma = new PrismaClient();

/**
 * Creates a new driver application with all related data
 */
export async function createDriverApplication(
  dto: DriverApplicationDTO,
  files: DriverApplicationFiles,
  meta: ApplicationMetadata
) {
  // Extract and validate SSN (optional)
  let ssnLast4 = '';
  let ssnEncrypted = '';
  
  if (dto.ssn && dto.ssn.trim()) {
    const ssn = dto.ssn.replace(/-/g, ''); // Remove dashes
    if (ssn.length !== 9) {
      throw new Error('Invalid SSN format');
    }
    ssnLast4 = ssn.slice(-4);
    ssnEncrypted = encryptSensitive(ssn);
  }

  // Parse dates with validation
  const dateOfBirth = new Date(dto.dateOfBirth);
  if (isNaN(dateOfBirth.getTime())) {
    throw new Error('Invalid date of birth');
  }
  
  const licenseExpiresAt = new Date(dto.license.expiresAt);
  if (isNaN(licenseExpiresAt.getTime())) {
    throw new Error('Invalid license expiration date');
  }
  
  // Validate date is not too far in the future (reasonable limit: 50 years)
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 50);
  if (licenseExpiresAt > maxFutureDate) {
    throw new Error('License expiration date is too far in the future');
  }
  
  // Handle optional medical card expiration date
  let medicalCardExpiresAt: Date | null = null;
  if (dto.medicalCardExpiresAt && dto.medicalCardExpiresAt.trim()) {
    const parsedDate = new Date(dto.medicalCardExpiresAt);
    // Only set if date is valid, otherwise ignore (field is optional)
    if (!isNaN(parsedDate.getTime()) && parsedDate <= maxFutureDate) {
      medicalCardExpiresAt = parsedDate;
    }
    // If date is invalid, we just ignore it since the field is optional
  }

  // Create application in transaction with increased timeout (30 seconds)
  // File uploads happen inside transaction but in parallel to minimize time
  const application = await prisma.$transaction(async (tx) => {
    // Create main application record
    const app = await tx.driverApplication.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth,
        phone: dto.phone,
        email: dto.email,
        currentAddressLine1: dto.currentAddressLine1,
        currentCity: dto.currentCity,
        currentState: dto.currentState,
        currentZip: dto.currentZip,
        livedAtCurrentMoreThan3Years: dto.livedAtCurrentMoreThan3Years,
        ssnEncrypted,
        ssnLast4,
        applicantType: dto.applicantType || null,
        truckYear: dto.truckYear || null,
        truckMake: dto.truckMake || null,
        alcoholDrugReturnToDuty: dto.alcoholDrugReturnToDuty ?? null,
        applicantIp: meta.applicantIp,
        userAgent: meta.userAgent,
      },
    });

    // Upload files in parallel (inside transaction but async)
    const uploadPromises: Promise<void>[] = [];

    // Upload license files (can be image or PDF)
    let licenseFrontUrl: string | undefined;
    let licenseFrontPublicId: string | undefined;
    let licenseBackUrl: string | undefined;
    let licenseBackPublicId: string | undefined;

    if (files.licenseFront) {
      // Determine file type from mimetype
      const isPDF = files.licenseFront.mimetype === 'application/pdf' || 
                    files.licenseFront.originalname?.toLowerCase().endsWith('.pdf');
      const resourceType = isPDF ? 'raw' : 'image';
      
      const upload = uploadToApplicationFolder(
        files.licenseFront.buffer,
        app.id,
        'license-front',
        resourceType
      ).then((result) => {
        licenseFrontUrl = result.url;
        licenseFrontPublicId = result.publicId;
      }).catch((error) => {
        console.error('Error uploading license front:', error);
        throw error;
      });
      uploadPromises.push(upload);
    }

    if (files.licenseBack) {
      // Determine file type from mimetype
      const isPDF = files.licenseBack.mimetype === 'application/pdf' || 
                    files.licenseBack.originalname?.toLowerCase().endsWith('.pdf');
      const resourceType = isPDF ? 'raw' : 'image';
      
      const upload = uploadToApplicationFolder(
        files.licenseBack.buffer,
        app.id,
        'license-back',
        resourceType
      ).then((result) => {
        licenseBackUrl = result.url;
        licenseBackPublicId = result.publicId;
      }).catch((error) => {
        console.error('Error uploading license back:', error);
        throw error;
      });
      uploadPromises.push(upload);
    }

    // Upload medical card (can be image or PDF)
    let medicalCardUrl: string | undefined;
    let medicalCardPublicId: string | undefined;

    if (files.medicalCard) {
      // Determine file type from mimetype
      const isPDF = files.medicalCard.mimetype === 'application/pdf' || 
                    files.medicalCard.originalname?.toLowerCase().endsWith('.pdf');
      const resourceType = isPDF ? 'raw' : 'image';
      
      const upload = uploadToApplicationFolder(
        files.medicalCard.buffer,
        app.id,
        'medical-card',
        resourceType
      ).then((result) => {
        medicalCardUrl = result.url;
        medicalCardPublicId = result.publicId;
      }).catch((error) => {
        console.error('Error uploading medical card:', error);
        throw error;
      });
      uploadPromises.push(upload);
    }

    // Wait for all file uploads
    await Promise.all(uploadPromises);

    // Create driver license record
    await tx.driverLicense.create({
      data: {
        applicationId: app.id,
        licenseNumber: dto.license.licenseNumber,
        state: dto.license.state,
        class: dto.license.class,
        expiresAt: licenseExpiresAt,
        endorsements: dto.license.endorsements,
        hasOtherLicensesLast3Years: dto.license.hasOtherLicensesLast3Years,
        otherLicensesJson: dto.license.otherLicensesJson,
        frontImageUrl: licenseFrontUrl,
        frontImagePublicId: licenseFrontPublicId,
        backImageUrl: licenseBackUrl,
        backImagePublicId: licenseBackPublicId,
      },
    });

    // Create medical card record
    if (medicalCardUrl || medicalCardExpiresAt) {
      await tx.medicalCard.create({
        data: {
          applicationId: app.id,
          expiresAt: medicalCardExpiresAt,
          documentUrl: medicalCardUrl,
          documentPublicId: medicalCardPublicId,
        },
      });
    }

    // Create previous addresses
    if (dto.previousAddresses && dto.previousAddresses.length > 0) {
      await tx.previousAddress.createMany({
        data: dto.previousAddresses.map((addr) => ({
          applicationId: app.id,
          addressLine1: addr.addressLine1,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          fromDate: addr.fromDate ? new Date(addr.fromDate) : null,
          toDate: addr.toDate ? new Date(addr.toDate) : null,
        })),
      });
    }

    // Create employment records
    if (dto.employmentRecords && dto.employmentRecords.length > 0) {
      await tx.employmentRecord.createMany({
        data: dto.employmentRecords.map((record) => ({
          applicationId: app.id,
          employerName: record.employerName,
          employerPhone: record.employerPhone || null,
          employerFax: record.employerFax || null,
          employerEmail: record.employerEmail || null,
          addressLine1: record.addressLine1,
          country: record.country || 'US',
          city: record.city,
          state: record.state,
          zip: record.zip || null,
          positionHeld: record.positionHeld || null,
          dateFrom: record.dateFrom ? new Date(record.dateFrom) : null,
          dateTo: record.dateTo ? new Date(record.dateTo) : null,
          reasonForLeaving: record.reasonForLeaving || null,
          equipmentClass: record.equipmentClass || null,
          wasSubjectToFMCSR: record.wasSubjectToFMCSR,
          wasSafetySensitive: record.wasSafetySensitive,
        })),
      });
    }

    // Create legal consents with signature uploads (in parallel)
    const consentPromises = dto.legalConsents.map(async (consent) => {
      let signatureUrl: string | undefined;
      let signaturePublicId: string | undefined;

      // Upload signature if provided
      const signatureFile = files.consentSignatures?.[consent.type];
      if (signatureFile) {
        const result = await uploadToApplicationFolder(
          signatureFile.buffer,
          app.id,
          `consent-${consent.type.toLowerCase()}`,
          'image'
        );
        signatureUrl = result.url;
        signaturePublicId = result.publicId;
      }

      return tx.legalConsent.create({
        data: {
          applicationId: app.id,
          type: consent.type,
          accepted: consent.accepted,
          signedAt: consent.signedAt ? new Date(consent.signedAt) : null,
          signatureUrl,
          signaturePublicId,
          formVersion: consent.formVersion || null,
        },
      });
    });

    await Promise.all(consentPromises);

    return app;
  }, {
    maxWait: 10000, // Maximum time to wait for a transaction slot
    timeout: 30000, // Maximum time the transaction can run (30 seconds)
  });

  return {
    id: application.id,
    status: application.status,
    createdAt: application.createdAt,
  };
}

/**
 * Get application by ID (for admin use later)
 */
export async function getDriverApplicationById(id: string) {
  return prisma.driverApplication.findUnique({
    where: { id },
    include: {
      previousAddresses: true,
      license: true,
      medicalCard: true,
      employmentRecords: true,
      legalConsents: true,
    },
  });
}

