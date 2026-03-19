-- CreateTable
CREATE TABLE "rfq" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerLocation" TEXT,
    "product" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "estimatedValue" TEXT,
    "deadlineAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rfqId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerLocation" TEXT,
    "product" TEXT NOT NULL,
    "quantityLabel" TEXT NOT NULL,
    "valueLabel" TEXT NOT NULL,
    "valueCents" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "deliveriesTotal" INTEGER NOT NULL DEFAULT 0,
    "deliveriesCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rfq_organizationId_idx" ON "rfq"("organizationId");

-- CreateIndex
CREATE INDEX "rfq_status_idx" ON "rfq"("status");

-- CreateIndex
CREATE INDEX "contract_organizationId_idx" ON "contract"("organizationId");

-- CreateIndex
CREATE INDEX "contract_status_idx" ON "contract"("status");

-- AddForeignKey
ALTER TABLE "rfq" ADD CONSTRAINT "rfq_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
