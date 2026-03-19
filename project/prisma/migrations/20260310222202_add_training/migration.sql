-- CreateTable
CREATE TABLE "training_program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'OrigineMaroc Academy',
    "category" TEXT NOT NULL,
    "durationLabel" TEXT,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_module" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_program_media" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "moduleId" TEXT,
    "fileUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_program_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_enrollment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "modulesCompleted" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_program_status_idx" ON "training_program"("status");

-- CreateIndex
CREATE INDEX "training_module_programId_idx" ON "training_module"("programId");

-- CreateIndex
CREATE INDEX "training_program_media_programId_idx" ON "training_program_media"("programId");

-- CreateIndex
CREATE INDEX "training_program_media_moduleId_idx" ON "training_program_media"("moduleId");

-- CreateIndex
CREATE INDEX "training_enrollment_organizationId_idx" ON "training_enrollment"("organizationId");

-- CreateIndex
CREATE INDEX "training_enrollment_programId_idx" ON "training_enrollment"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollment_organizationId_programId_key" ON "training_enrollment"("organizationId", "programId");

-- AddForeignKey
ALTER TABLE "training_module" ADD CONSTRAINT "training_module_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_program_media" ADD CONSTRAINT "training_program_media_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_program_media" ADD CONSTRAINT "training_program_media_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollment" ADD CONSTRAINT "training_enrollment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollment" ADD CONSTRAINT "training_enrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
