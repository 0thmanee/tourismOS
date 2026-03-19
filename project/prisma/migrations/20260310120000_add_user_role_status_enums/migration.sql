-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('partner', 'superadmin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('disabled', 'enabled');

-- AlterTable: add status column
ALTER TABLE "user" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'disabled';

-- AlterTable: convert role from TEXT to UserRole (preserve existing: partner/superadmin, map buyer->partner)
ALTER TABLE "user" ADD COLUMN "role_new" "UserRole";
UPDATE "user" SET "role_new" = CASE
  WHEN "role" = 'superadmin' THEN 'superadmin'::"UserRole"
  ELSE 'partner'::"UserRole"
END;
ALTER TABLE "user" DROP COLUMN "role";
ALTER TABLE "user" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'partner'::"UserRole";
