/*
  Warnings:

  - You are about to drop the `certification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rfq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_ticket_status_event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `training_enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `training_module` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `training_program` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `training_program_media` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification" DROP CONSTRAINT "certification_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "certification" DROP CONSTRAINT "certification_productId_fkey";

-- DropForeignKey
ALTER TABLE "contract" DROP CONSTRAINT "contract_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_productId_fkey";

-- DropForeignKey
ALTER TABLE "rfq" DROP CONSTRAINT "rfq_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "support_ticket" DROP CONSTRAINT "support_ticket_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "support_ticket_status_event" DROP CONSTRAINT "support_ticket_status_event_supportTicketId_fkey";

-- DropForeignKey
ALTER TABLE "training_enrollment" DROP CONSTRAINT "training_enrollment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "training_enrollment" DROP CONSTRAINT "training_enrollment_programId_fkey";

-- DropForeignKey
ALTER TABLE "training_module" DROP CONSTRAINT "training_module_programId_fkey";

-- DropForeignKey
ALTER TABLE "training_program_media" DROP CONSTRAINT "training_program_media_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "training_program_media" DROP CONSTRAINT "training_program_media_programId_fkey";

-- DropTable
DROP TABLE "certification";

-- DropTable
DROP TABLE "contract";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "product_image";

-- DropTable
DROP TABLE "rfq";

-- DropTable
DROP TABLE "support_ticket";

-- DropTable
DROP TABLE "support_ticket_status_event";

-- DropTable
DROP TABLE "training_enrollment";

-- DropTable
DROP TABLE "training_module";

-- DropTable
DROP TABLE "training_program";

-- DropTable
DROP TABLE "training_program_media";

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "activityTitle" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "depositCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_organizationId_idx" ON "customer"("organizationId");

-- CreateIndex
CREATE INDEX "customer_phone_idx" ON "customer"("phone");

-- CreateIndex
CREATE INDEX "booking_organizationId_idx" ON "booking"("organizationId");

-- CreateIndex
CREATE INDEX "booking_status_idx" ON "booking"("status");

-- CreateIndex
CREATE INDEX "booking_startAt_idx" ON "booking"("startAt");

-- CreateIndex
CREATE INDEX "booking_message_bookingId_idx" ON "booking_message"("bookingId");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_message" ADD CONSTRAINT "booking_message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
