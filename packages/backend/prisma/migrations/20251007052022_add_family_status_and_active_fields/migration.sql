/*
  Warnings:

  - The values [OAUTH_LOGIN] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."FamilyStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActionType_new" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN');
ALTER TABLE "public"."Log" ALTER COLUMN "actionType" TYPE "public"."ActionType_new" USING ("actionType"::text::"public"."ActionType_new");
ALTER TYPE "public"."ActionType" RENAME TO "ActionType_old";
ALTER TYPE "public"."ActionType_new" RENAME TO "ActionType";
DROP TYPE "public"."ActionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Family" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "public"."FamilyStatus" NOT NULL DEFAULT 'PENDING';
