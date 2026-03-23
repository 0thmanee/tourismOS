-- CreateTable
CREATE TABLE "staff_member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_assignment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "assignmentRole" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_member_organizationId_idx" ON "staff_member"("organizationId");

-- CreateIndex
CREATE INDEX "staff_member_role_idx" ON "staff_member"("role");

-- CreateIndex
CREATE INDEX "booking_assignment_bookingId_idx" ON "booking_assignment"("bookingId");

-- CreateIndex
CREATE INDEX "booking_assignment_staffMemberId_idx" ON "booking_assignment"("staffMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_assignment_bookingId_staffMemberId_key" ON "booking_assignment"("bookingId", "staffMemberId");

-- AddForeignKey
ALTER TABLE "staff_member" ADD CONSTRAINT "staff_member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_assignment" ADD CONSTRAINT "booking_assignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_assignment" ADD CONSTRAINT "booking_assignment_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "staff_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
