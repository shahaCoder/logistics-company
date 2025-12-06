-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LegalConsentType" AS ENUM ('ALCOHOL_DRUG', 'SAFETY_PERFORMANCE', 'PSP', 'CLEARINGHOUSE', 'MVR');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'VIEWER');

-- CreateTable
CREATE TABLE "DriverApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "internalNotes" TEXT,
    "applicantIp" TEXT,
    "userAgent" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentAddressLine1" TEXT NOT NULL,
    "currentCity" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "currentZip" TEXT NOT NULL,
    "livedAtCurrentMoreThan3Years" BOOLEAN NOT NULL,
    "ssnEncrypted" TEXT NOT NULL,
    "ssnLast4" TEXT NOT NULL,

    CONSTRAINT "DriverApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviousAddress" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),

    CONSTRAINT "PreviousAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLicense" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endorsements" TEXT,
    "hasOtherLicensesLast3Years" BOOLEAN NOT NULL,
    "otherLicensesJson" JSONB,
    "frontImageUrl" TEXT,
    "frontImagePublicId" TEXT,
    "backImageUrl" TEXT,
    "backImagePublicId" TEXT,

    CONSTRAINT "DriverLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalCard" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "documentPublicId" TEXT,

    CONSTRAINT "MedicalCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentRecord" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "employerPhone" TEXT,
    "employerFax" TEXT,
    "employerEmail" TEXT,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "positionHeld" TEXT,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "reasonForLeaving" TEXT,
    "equipmentClass" TEXT,
    "wasSubjectToFMCSR" BOOLEAN NOT NULL,
    "wasSafetySensitive" BOOLEAN NOT NULL,

    CONSTRAINT "EmploymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalConsent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "LegalConsentType" NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "signedAt" TIMESTAMP(3),
    "signatureUrl" TEXT,
    "signaturePublicId" TEXT,
    "formVersion" TEXT,

    CONSTRAINT "LegalConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverApplication_status_idx" ON "DriverApplication"("status");

-- CreateIndex
CREATE INDEX "DriverApplication_createdAt_idx" ON "DriverApplication"("createdAt");

-- CreateIndex
CREATE INDEX "PreviousAddress_applicationId_idx" ON "PreviousAddress"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_applicationId_key" ON "DriverLicense"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalCard_applicationId_key" ON "MedicalCard"("applicationId");

-- CreateIndex
CREATE INDEX "EmploymentRecord_applicationId_idx" ON "EmploymentRecord"("applicationId");

-- CreateIndex
CREATE INDEX "LegalConsent_applicationId_idx" ON "LegalConsent"("applicationId");

-- CreateIndex
CREATE INDEX "LegalConsent_applicationId_type_idx" ON "LegalConsent"("applicationId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "DriverApplication" ADD CONSTRAINT "DriverApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviousAddress" ADD CONSTRAINT "PreviousAddress_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriverApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriverApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalCard" ADD CONSTRAINT "MedicalCard_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriverApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentRecord" ADD CONSTRAINT "EmploymentRecord_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriverApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalConsent" ADD CONSTRAINT "LegalConsent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "DriverApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
