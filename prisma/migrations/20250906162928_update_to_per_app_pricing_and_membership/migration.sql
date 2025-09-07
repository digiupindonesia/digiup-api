/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membership_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `appId` to the `batch_usage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."batch_usage" DROP CONSTRAINT "batch_usage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_subscriptions" DROP CONSTRAINT "user_subscriptions_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_subscriptions" DROP CONSTRAINT "user_subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "public"."batch_usage" ADD COLUMN     "appId" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."membership_plans";

-- DropTable
DROP TABLE "public"."user_subscriptions";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),
    "accountName" VARCHAR(255),
    "accountLocationState" VARCHAR(255),
    "accountType" VARCHAR(255) NOT NULL DEFAULT 'free',
    "google_signin" BOOLEAN DEFAULT false,
    "google_given_name" VARCHAR(255),
    "google_family_name" VARCHAR(255),
    "google_locale" VARCHAR(255),
    "google_avatar" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "isRegistered" BOOLEAN DEFAULT false,
    "tokenOfRegisterConfirmation" VARCHAR(255) NOT NULL,
    "tokenOfResetPassword" VARCHAR(255) NOT NULL,
    "isDisabled" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digiup_apps" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "logo" VARCHAR(500),
    "category" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "appUrl" VARCHAR(500),
    "features" JSONB,
    "tags" VARCHAR(50)[],
    "isEarlyAccess" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digiup_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_pricing_plans" (
    "id" UUID NOT NULL,
    "appId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "billingCycle" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB,
    "limits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "appId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentReference" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_subscriptions_userId_appId_key" ON "public"."app_subscriptions"("userId", "appId");

-- AddForeignKey
ALTER TABLE "public"."app_pricing_plans" ADD CONSTRAINT "app_pricing_plans_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."digiup_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."app_subscriptions" ADD CONSTRAINT "app_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."app_subscriptions" ADD CONSTRAINT "app_subscriptions_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."digiup_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."app_subscriptions" ADD CONSTRAINT "app_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."app_pricing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_usage" ADD CONSTRAINT "batch_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
