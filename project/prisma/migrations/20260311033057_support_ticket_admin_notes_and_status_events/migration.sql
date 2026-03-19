-- AlterTable
ALTER TABLE "support_ticket" ADD COLUMN     "adminNotes" TEXT;

-- CreateTable
CREATE TABLE "support_ticket_status_event" (
    "id" TEXT NOT NULL,
    "supportTicketId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_status_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_ticket_status_event_supportTicketId_idx" ON "support_ticket_status_event"("supportTicketId");

-- AddForeignKey
ALTER TABLE "support_ticket_status_event" ADD CONSTRAINT "support_ticket_status_event_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "support_ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
