-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('FAMILY', 'TRIP_ADMIN', 'SUPER_ADMIN');

-- DropForeignKey
ALTER TABLE "public"."GearAssignment" DROP CONSTRAINT "GearAssignment_familyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GearAssignment" DROP CONSTRAINT "GearAssignment_gearItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GearItem" DROP CONSTRAINT "GearItem_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripAttendance" DROP CONSTRAINT "TripAttendance_familyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripAttendance" DROP CONSTRAINT "TripAttendance_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_familyId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'FAMILY';

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GearItem" ADD CONSTRAINT "GearItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GearAssignment" ADD CONSTRAINT "GearAssignment_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "public"."GearItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GearAssignment" ADD CONSTRAINT "GearAssignment_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripAttendance" ADD CONSTRAINT "TripAttendance_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripAttendance" ADD CONSTRAINT "TripAttendance_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
