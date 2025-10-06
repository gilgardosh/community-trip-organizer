-- AlterEnum
ALTER TYPE "public"."ActionType" ADD VALUE 'OAUTH_LOGIN';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "oauthProviderId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;
