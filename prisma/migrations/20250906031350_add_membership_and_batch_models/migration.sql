-- CreateTable
CREATE TABLE "public"."membership_plans" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "local_rendering_limit" INTEGER NOT NULL DEFAULT 10,
    "device_limit" INTEGER NOT NULL DEFAULT 1,
    "video_quality" VARCHAR(50) NOT NULL DEFAULT 'medium',
    "has_ai_subtitle" BOOLEAN NOT NULL DEFAULT true,
    "has_ai_voiceover" BOOLEAN NOT NULL DEFAULT false,
    "support_level" VARCHAR(50) NOT NULL DEFAULT 'none',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentReference" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch_usage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "batchName" VARCHAR(255) NOT NULL,
    "batchType" VARCHAR(50) NOT NULL,
    "usageType" VARCHAR(50) NOT NULL,
    "usageAmount" INTEGER NOT NULL DEFAULT 1,
    "monthYear" VARCHAR(7) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_usage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_usage" ADD CONSTRAINT "batch_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
