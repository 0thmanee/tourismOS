-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('FIXED_SLOT', 'FLEXIBLE', 'MULTI_DAY', 'RESOURCE_BASED');

-- CreateEnum
CREATE TYPE "PricingKind" AS ENUM ('PER_PERSON', 'PER_GROUP');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "activityKind" "ActivityKind",
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "meta" JSONB;

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ActivityKind" NOT NULL,
    "pricingKind" "PricingKind" NOT NULL DEFAULT 'PER_PERSON',
    "capacity" INTEGER,
    "resourceCapacity" INTEGER,
    "fixedSlots" JSONB NOT NULL DEFAULT '[]',
    "durationOptions" JSONB NOT NULL DEFAULT '[1,2,3]',
    "defaultDurationDays" INTEGER NOT NULL DEFAULT 1,
    "requiresGuide" BOOLEAN NOT NULL DEFAULT false,
    "requiresTransport" BOOLEAN NOT NULL DEFAULT false,
    "requiresEquipment" BOOLEAN NOT NULL DEFAULT false,
    "defaultPriceMad" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_organizationId_idx" ON "activity"("organizationId");

-- CreateIndex
CREATE INDEX "activity_kind_idx" ON "activity"("kind");

-- CreateIndex
CREATE INDEX "booking_activityId_idx" ON "booking"("activityId");

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
