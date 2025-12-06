import { Request, Response, Router } from 'express';
import multer from 'multer';
import { DriverApplicationDTOSchema } from './driverApplication.types.js';
import { createDriverApplication } from './driverApplication.service.js';
import { DriverApplicationFiles, ApplicationMetadata } from './driverApplication.types.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
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
router.post(
  '/',
  upload.fields(uploadFields),
  async (req: Request, res: Response) => {
    try {
      // Extract metadata
      const meta: ApplicationMetadata = {
        applicantIp: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      // Parse JSON fields from form data
      let formData: any = { ...req.body };

      // Parse JSON strings if they exist
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
      if (typeof formData.license.otherLicensesJson === 'string') {
        formData.license.otherLicensesJson = JSON.parse(formData.license.otherLicensesJson);
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

      // Organize files
      const files: DriverApplicationFiles = {
        licenseFront: req.files?.['licenseFront']?.[0],
        licenseBack: req.files?.['licenseBack']?.[0],
        medicalCard: req.files?.['medicalCard']?.[0],
        consentSignatures: {
          ALCOHOL_DRUG: req.files?.['consentAlcoholDrug']?.[0],
          SAFETY_PERFORMANCE: req.files?.['consentSafetyPerformance']?.[0],
          PSP: req.files?.['consentPSP']?.[0],
          CLEARINGHOUSE: req.files?.['consentClearinghouse']?.[0],
          MVR: req.files?.['consentMVR']?.[0],
        },
      };

      // Create application
      const result = await createDriverApplication(dto, files, meta);

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

