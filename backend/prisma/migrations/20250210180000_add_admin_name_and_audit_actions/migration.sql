-- AlterEnum: add new audit actions for admin management
ALTER TYPE "AuditAction" ADD VALUE 'CREATE_ADMIN';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_ADMIN';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_PROFILE';

-- AlterTable: add optional display name to AdminUser
ALTER TABLE "AdminUser" ADD COLUMN "name" TEXT;
