-- AlterTable
ALTER TABLE "EmploymentRecord" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'US',
ALTER COLUMN "zip" DROP NOT NULL;
