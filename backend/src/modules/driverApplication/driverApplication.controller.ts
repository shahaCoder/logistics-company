import { Request, Response, Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { DriverApplicationDTOSchema } from './driverApplication.types.js';
import { createDriverApplication } from './driverApplication.service.js';
import { DriverApplicationFiles, ApplicationMetadata } from './driverApplication.types.js';
import { fileTypeFromBuffer } from 'file-type';
import { createAuditLog } from '../../services/audit.service.js';
import { AuditAction } from '@prisma/client';

const router = Router();

// Rate limiter for driver applications (3 applications per 15 minutes per IP)
const driverAppRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 applications per 15 minutes
  message: { error: 'Too many applications. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Helper function to validate file content
async function validateFileContent(fieldName: string, buffer: Buffer, allowedMimes: string[]): Promise<void> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      throw new Error(`Could not determine file type for ${fieldName}`);
    }
    
    if (!allowedMimes || !allowedMimes.includes(fileType.mime)) {
      throw new Error(`File content does not match declared type for ${fieldName}. Expected one of: ${allowedMimes?.join(', ') || 'none'}, got: ${fileType.mime}`);
    }
  } catch (error) {
    throw new Error(`File validation failed for ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Allowed MIME types for each field
const allowedMimeTypes: Record<string, string[]> = {
  licenseFront: ['image/jpeg', 'image/png', 'image/jpg'],
  licenseBack: ['image/jpeg', 'image/png', 'image/jpg'],
  medicalCard: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  consentAlcoholDrug: ['image/jpeg', 'image/png', 'image/jpg'],
  consentSafetyPerformance: ['image/jpeg', 'image/png', 'image/jpg'],
  consentPSP: ['image/jpeg', 'image/png', 'image/jpg'],
  consentClearinghouse: ['image/jpeg', 'image/png', 'image/jpg'],
  consentMVR: ['image/jpeg', 'image/png', 'image/jpg'],
};

// Configure multer for file uploads with file type validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = allowedMimeTypes[file.fieldname];
    if (allowed && allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowed?.join(', ') || 'none'}`));
    }
  },
});

// File field names
const uploadFields = [
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 },
  { name: 'medicalCard', maxCount: 1 },
  { name: 'consentAlcoholDrug', maxCount: 1 },
  { name: 'consentSafetyPerformance', maxCount: 1 },
  { name: 'consentPSP', maxCount: 1 },
  { name: 'consentClearinghouse', maxCount: 1 },
  { name: 'consentMVR', maxCount: 1 },
];

/**
 * POST /api/driver-applications
 * Creates a new driver application
 */
// Error handler for multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size exceeds 10MB limit',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: err.message,
    });
  }
  if (err) {
    // This catches fileFilter errors
    return res.status(400).json({
      success: false,
      error: 'File validation error',
      message: err.message || 'Invalid file type',
    });
  }
  next();
};

router.post(
  '/',
  driverAppRateLimiter,
  upload.fields(uploadFields),
  handleMulterError,
  async (req: Request, res: Response) => {
    try {
      // Extract metadata
      const meta: ApplicationMetadata = {
        applicantIp: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      // Parse JSON fields from form data
      let formData: any = { ...req.body };

      // Parse JSON strings if they exist (with error handling)
      try {
        if (typeof formData.previousAddresses === 'string') {
          formData.previousAddresses = JSON.parse(formData.previousAddresses);
        }
        if (typeof formData.employmentRecords === 'string') {
          formData.employmentRecords = JSON.parse(formData.employmentRecords);
        }
        if (typeof formData.legalConsents === 'string') {
          formData.legalConsents = JSON.parse(formData.legalConsents);
        }
        if (typeof formData.license === 'string') {
          formData.license = JSON.parse(formData.license);
        }
        // Only parse otherLicensesJson if license exists and is an object
        if (formData.license && typeof formData.license === 'object' && typeof formData.license.otherLicensesJson === 'string') {
          formData.license.otherLicensesJson = JSON.parse(formData.license.otherLicensesJson);
        }
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON format in form data',
          message: 'One or more JSON fields are malformed',
        });
      }

      // Convert boolean strings to booleans
      const booleanFields = [
        'livedAtCurrentMoreThan3Years',
        'hasOtherLicensesLast3Years',
        'wasSubjectToFMCSR',
        'wasSafetySensitive',
        'accepted',
      ];

      const convertBooleans = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(convertBooleans);
        }
        if (obj && typeof obj === 'object') {
          const converted: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (booleanFields.includes(key) && typeof value === 'string') {
              converted[key] = value === 'true' || value === '1';
            } else if (typeof value === 'object') {
              converted[key] = convertBooleans(value);
            } else {
              converted[key] = value;
            }
          }
          return converted;
        }
        return obj;
      };

      formData = convertBooleans(formData);

      // Validate DTO
      const validationResult = DriverApplicationDTOSchema.safeParse(formData);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        });
      }

      const dto = validationResult.data;

      // Organize files and validate file content
      // Type assertion for req.files from multer
      const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      const files: DriverApplicationFiles = {
        licenseFront: uploadedFiles?.['licenseFront']?.[0],
        licenseBack: uploadedFiles?.['licenseBack']?.[0],
        medicalCard: uploadedFiles?.['medicalCard']?.[0],
        consentSignatures: {
          ALCOHOL_DRUG: uploadedFiles?.['consentAlcoholDrug']?.[0],
          SAFETY_PERFORMANCE: uploadedFiles?.['consentSafetyPerformance']?.[0],
          PSP: uploadedFiles?.['consentPSP']?.[0],
          CLEARINGHOUSE: uploadedFiles?.['consentClearinghouse']?.[0],
          MVR: uploadedFiles?.['consentMVR']?.[0],
        },
      };

      // Validate file content (verify actual file type, not just MIME type)
      const fileValidationPromises: Promise<void>[] = [];
      
      // Validate license files
      if (files.licenseFront && files.licenseFront.buffer) {
        fileValidationPromises.push(validateFileContent('licenseFront', files.licenseFront.buffer, allowedMimeTypes.licenseFront));
      }
      if (files.licenseBack && files.licenseBack.buffer) {
        fileValidationPromises.push(validateFileContent('licenseBack', files.licenseBack.buffer, allowedMimeTypes.licenseBack));
      }
      if (files.medicalCard && files.medicalCard.buffer) {
        fileValidationPromises.push(validateFileContent('medicalCard', files.medicalCard.buffer, allowedMimeTypes.medicalCard));
      }
      
      // Validate consent signature files
      if (files.consentSignatures) {
        const consentFieldMap: Record<string, string> = {
          ALCOHOL_DRUG: 'consentAlcoholDrug',
          SAFETY_PERFORMANCE: 'consentSafetyPerformance',
          PSP: 'consentPSP',
          CLEARINGHOUSE: 'consentClearinghouse',
          MVR: 'consentMVR',
        };
        
        for (const [consentType, fieldName] of Object.entries(consentFieldMap)) {
          const file = files.consentSignatures[consentType as keyof typeof files.consentSignatures];
          if (file && file.buffer) {
            fileValidationPromises.push(validateFileContent(fieldName, file.buffer, allowedMimeTypes[fieldName]));
          }
        }
      }

      // Wait for all file validations
      try {
        await Promise.all(fileValidationPromises);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: 'File validation failed',
          message: validationError instanceof Error ? validationError.message : 'Invalid file content',
        });
      }

      // Create application
      const result = await createDriverApplication(dto, files, meta);

      // Audit log (public action, no admin)
      await createAuditLog({
        action: AuditAction.CREATE_APPLICATION,
        resourceId: result.id,
        resourceType: 'DriverApplication',
        ipAddress: meta.applicantIp,
        userAgent: meta.userAgent,
        details: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
        },
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error creating driver application:', error);

      // Don't expose sensitive information
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      // Mask any SSN references in error messages
      const safeMessage = errorMessage.replace(/\d{3}-?\d{2}-?\d{4}/g, '***-**-****');

      res.status(500).json({
        success: false,
        error: 'Failed to create driver application',
        message: safeMessage,
      });
    }
  }
);

export default router;

