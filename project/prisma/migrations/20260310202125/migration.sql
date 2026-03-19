/*
  Warnings:

  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");
