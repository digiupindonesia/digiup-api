-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "creatorup_metadata" JSONB,
ADD COLUMN     "creatorup_synced_at" TIMESTAMP(3),
ADD COLUMN     "creatorup_user_id" VARCHAR(255),
ADD COLUMN     "last_creatorup_access" TIMESTAMP(3),
ADD COLUMN     "sync_status" VARCHAR(50) NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "public"."creatorup_usage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "creatorupUserId" VARCHAR(255) NOT NULL,
    "batchName" VARCHAR(255) NOT NULL,
    "batchType" VARCHAR(50) NOT NULL,
    "usageType" VARCHAR(50) NOT NULL,
    "usageAmount" INTEGER NOT NULL DEFAULT 1,
    "monthYear" VARCHAR(7) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creatorup_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_events" (
    "id" UUID NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "userId" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "payload" JSONB,
    "response" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_logs" (
    "id" UUID NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "payload" JSONB,
    "signature" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'received',
    "response" JSONB,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."creatorup_usage" ADD CONSTRAINT "creatorup_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
