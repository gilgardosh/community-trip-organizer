import { prisma } from '../../src/utils/db.js';

export async function clearDatabase() {
  // The order of deletion is important to avoid foreign key constraint errors.
  await prisma.log.deleteMany();
  await prisma.gearAssignment.deleteMany();
  await prisma.tripAttendance.deleteMany();
  await prisma.gearItem.deleteMany();

  // We need to disconnect the many-to-many relation between User and Trip for admins
  const trips = await prisma.trip.findMany({ include: { admins: true } });
  for (const trip of trips) {
    if (trip.admins.length > 0) {
      await prisma.trip.update({
        where: { id: trip.id },
        data: {
          admins: {
            disconnect: trip.admins.map((admin) => ({ id: admin.id })),
          },
        },
      });
    }
  }

  await prisma.user.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.family.deleteMany();
}
