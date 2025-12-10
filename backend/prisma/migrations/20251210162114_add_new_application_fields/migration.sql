-- AlterEnum
ALTER TYPE "LegalConsentType" ADD VALUE 'AUTHORIZATION';

-- AlterTable
ALTER TABLE "DriverApplication" ADD COLUMN     "alcoholDrugReturnToDuty" BOOLEAN,
ADD COLUMN     "applicantType" TEXT,
ADD COLUMN     "truckMake" TEXT,
ADD COLUMN     "truckYear" TEXT;
