-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "travelerUserId" TEXT;

-- CreateIndex
CREATE INDEX "booking_travelerUserId_idx" ON "booking"("travelerUserId");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_travelerUserId_fkey" FOREIGN KEY ("travelerUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
