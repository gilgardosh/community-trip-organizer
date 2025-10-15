-- CreateEnum
CREATE TYPE "public"."MessageEventType" AS ENUM ('TRIP_CREATED', 'TRIP_PUBLISHED', 'ATTENDANCE_UPDATE', 'GEAR_ASSIGNMENT', 'TRIP_REMINDER', 'TRIP_START', 'ATTENDANCE_CUTOFF_REMINDER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."MessageTriggerType" AS ENUM ('AUTOMATIC', 'MANUAL');

-- AlterEnum
ALTER TYPE "public"."ActionType" ADD VALUE 'MESSAGE_GENERATED';

-- CreateTable
CREATE TABLE "public"."WhatsAppMessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventType" "public"."MessageEventType" NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "tripId" TEXT,
    "generatedBy" TEXT NOT NULL,
    "eventType" "public"."MessageEventType" NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "triggerType" "public"."MessageTriggerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessageTemplate_name_key" ON "public"."WhatsAppMessageTemplate"("name");

-- AddForeignKey
ALTER TABLE "public"."WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."WhatsAppMessageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
