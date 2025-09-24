import { prisma } from "../../src/utils/db.js";

/**
 * Checks if the database is reachable
 * @returns true if connected, false otherwise
 */
export async function isDatabaseConnected() {
  try {
    // Simple query to check if the database is accessible
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn('Database connection check failed:', error);
    return false;
  }
}

/**
 * Clears the database for testing
 * This function will handle connection issues gracefully
 */
export async function clearDatabase() {
  // If the database is not connected, skip the cleanup
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    console.warn('Database not connected, skipping cleanup');
    return;
  }

  // The order of deletion is important to avoid foreign key constraint errors.
  try {
    // Use Prisma's deleteMany instead of TRUNCATE for better permissions handling
    await prisma.log.deleteMany();
    console.log('Logs deleted successfully');
  } catch (error) {
    console.error('Error deleting logs:', error);
    // Continue anyway
  }

  // Try regular deletion for dependent tables if the direct SQL didn't work
  try {
    await prisma.gearAssignment.deleteMany();
    await prisma.tripAttendance.deleteMany();
    await prisma.gearItem.deleteMany();
  } catch (error) {
    console.error('Error deleting dependent tables:', error);
    // Continue anyway
  }

  // Handle many-to-many relations
  try {
    // Direct SQL approach for many-to-many
    await prisma.$executeRawUnsafe('DELETE FROM "_TripAdmins";');
  } catch (error) {
    console.error('Error clearing trip-user relations:', error);
    
    // Fallback to Prisma ORM approach
    try {
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
    } catch (innerError) {
      console.error('Fallback for trip-user relations also failed:', innerError);
    }
  }

  // Delete main tables in the correct order
  try {
    // Another attempt to clear logs if needed
    await prisma.log.deleteMany();
    
    // Other tables
    await prisma.user.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.family.deleteMany();
  } catch (error) {
    console.error('Error deleting main tables:', error);
    // We won't throw here to avoid breaking tests completely
  }
}
