-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('PENDING', 'REJECTED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Version" ADD COLUMN     "status" "VersionStatus" NOT NULL DEFAULT 'PENDING';
