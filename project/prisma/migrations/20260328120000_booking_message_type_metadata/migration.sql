-- AlterTable
ALTER TABLE "booking_message" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'TEXT',
ADD COLUMN "metadata" JSONB;
