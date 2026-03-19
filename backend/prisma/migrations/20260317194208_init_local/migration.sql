-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LegalConsentType" AS ENUM ('AUTHORIZATION', 'ALCOHOL_DRUG', 'SAFETY_PERFORMANCE', 'PSP', 'CLEARINGHOUSE', 'MVR');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('DECRYPT_SSN', 'DELETE_APPLICATION', 'UPDATE_STATUS', 'LOGIN', 'LOGOUT', 'CREATE_APPLICATION', 'VIEW_APPLICATION', 'APPLICATION_EMAIL_SENT', 'CREATE_ADMIN', 'UPDATE_ADMIN', 'UPDATE_PROFILE', 'DELETE_ADMIN');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('TRUCK', 'TRAILER');

-- CreateEnum
CREATE TYPE "DamageStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "DriverLiabilityType" AS ENUM ('NONE', 'PARTIAL', 'FULL');

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
    "applicantType" TEXT,
    "truckYear" TEXT,
    "truckMake" TEXT,
    "alcoholDrugReturnToDuty" BOOLEAN,

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
    "country" TEXT NOT NULL DEFAULT 'US',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT,
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
    "name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreightRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isBroker" BOOLEAN NOT NULL DEFAULT false,
    "equipment" TEXT,
    "cargo" TEXT,
    "weight" TEXT,
    "pallets" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupDate" TEXT,
    "pickupTime" TEXT,
    "deliveryAddress" TEXT,
    "deliveryDate" TEXT,
    "deliveryTime" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "applicantIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "FreightRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "applicantIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT,
    "adminEmail" TEXT,
    "action" "AuditAction" NOT NULL,
    "resourceId" TEXT,
    "resourceType" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "samsaraVehicleId" TEXT,
    "currentMiles" INTEGER NOT NULL DEFAULT 0,
    "currentMilesUpdatedAt" TIMESTAMP(3),
    "lastOilChangeMiles" INTEGER,
    "lastOilChangeAt" TIMESTAMP(3),
    "oilChangeIntervalMiles" INTEGER NOT NULL DEFAULT 15000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageExpense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateReported" TIMESTAMP(3) NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "companyShare" DECIMAL(65,30) NOT NULL,
    "driverShare" DECIMAL(65,30) NOT NULL,
    "responsibleDriverId" TEXT,
    "driverLiabilityType" "DriverLiabilityType" NOT NULL,
    "status" "DamageStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "DamageExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverApplication_status_idx" ON "DriverApplication"("status");

-- CreateIndex
CREATE INDEX "DriverApplication_createdAt_idx" ON "DriverApplication"("createdAt");

-- CreateIndex
CREATE INDEX "DriverApplication_status_createdAt_idx" ON "DriverApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DriverApplication_firstName_lastName_idx" ON "DriverApplication"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "DriverApplication_email_idx" ON "DriverApplication"("email");

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

-- CreateIndex
CREATE INDEX "FreightRequest_createdAt_idx" ON "FreightRequest"("createdAt");

-- CreateIndex
CREATE INDEX "FreightRequest_email_idx" ON "FreightRequest"("email");

-- CreateIndex
CREATE INDEX "FreightRequest_isBroker_createdAt_idx" ON "FreightRequest"("isBroker", "createdAt");

-- CreateIndex
CREATE INDEX "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ContactRequest_email_idx" ON "ContactRequest"("email");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resourceId_idx" ON "AuditLog"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_adminId_idx" ON "RefreshToken"("adminId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Truck_samsaraVehicleId_key" ON "Truck"("samsaraVehicleId");

-- CreateIndex
CREATE INDEX "Truck_samsaraVehicleId_idx" ON "Truck"("samsaraVehicleId");

-- CreateIndex
CREATE INDEX "Truck_createdAt_idx" ON "Truck"("createdAt");

-- CreateIndex
CREATE INDEX "DamageExpense_dateReported_idx" ON "DamageExpense"("dateReported");

-- CreateIndex
CREATE INDEX "DamageExpense_vehicleId_idx" ON "DamageExpense"("vehicleId");

-- CreateIndex
CREATE INDEX "DamageExpense_status_dateReported_idx" ON "DamageExpense"("status", "dateReported");

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

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
