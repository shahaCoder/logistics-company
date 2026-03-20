-- Optional US status proof fields for driver applications

-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "USStatus" AS ENUM ('US_CITIZEN', 'GREEN_CARD_HOLDER', 'WORK_PERMIT', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- AlterTable
ALTER TABLE "DriverApplication" ADD COLUMN IF NOT EXISTS "usStatus" "USStatus";
ALTER TABLE "DriverApplication" ADD COLUMN IF NOT EXISTS "usStatusDocumentUrl" TEXT;
ALTER TABLE "DriverApplication" ADD COLUMN IF NOT EXISTS "usStatusDocumentPublicId" TEXT;

