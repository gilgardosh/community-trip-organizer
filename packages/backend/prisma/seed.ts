import { PrismaClient, Role, FamilyStatus, UserType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.log.deleteMany({});
  await prisma.gearAssignment.deleteMany({});
  await prisma.gearItem.deleteMany({});
  await prisma.tripAttendance.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.family.deleteMany({});

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Super Admin Family
  console.log('👤 Creating Super Admin...');
  const superAdminFamily = await prisma.family.create({
    data: {
      name: 'Admin Family',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'Sarah Admin',
            email: 'admin@example.com',
            passwordHash: hashedPassword,
            role: Role.SUPER_ADMIN,
          },
        ],
      },
    },
    include: { members: true },
  });

  const superAdmin = superAdminFamily.members[0];
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // Create Trips
  console.log('🏔️  Creating trips...');

  const summerCampTrip = await prisma.trip.create({
    data: {
      name: 'Summer Camp 2025',
      location: 'Mountain Lake Campground',
      description:
        'Annual summer camping trip for families with outdoor activities, hiking, and campfire nights.',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-20'),
      draft: false,
      attendanceCutoffDate: new Date('2025-06-30'),
      photoAlbumLink: 'https://photos.example.com/summer-camp-2025',
    },
  });

  const winterRetreatTrip = await prisma.trip.create({
    data: {
      name: 'Winter Retreat 2026',
      location: 'Snowy Peaks Lodge',
      description:
        'Cozy winter retreat with skiing, snowboarding, and hot cocoa by the fireplace.',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-01-15'),
      draft: false,
      attendanceCutoffDate: new Date('2025-12-20'),
    },
  });

  const beachTripDraft = await prisma.trip.create({
    data: {
      name: 'Beach Getaway 2025',
      location: 'Sunny Shores Beach',
      description: 'Relaxing beach vacation - still in planning phase.',
      startDate: new Date('2025-08-20'),
      endDate: new Date('2025-08-25'),
      draft: true,
      attendanceCutoffDate: new Date('2025-08-01'),
    },
  });

  console.log(`✅ Created ${summerCampTrip.name}`);
  console.log(`✅ Created ${winterRetreatTrip.name}`);
  console.log(`✅ Created ${beachTripDraft.name} (draft)`);

  // Create Families with Members
  console.log('👨‍👩‍👧‍👦 Creating families...');

  // Family 1 - The Johnsons (Trip admin for Summer Camp)
  const johnsonFamily = await prisma.family.create({
    data: {
      name: 'The Johnsons',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'John Johnson',
            email: 'john.johnson@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 42,
          },
          {
            type: UserType.ADULT,
            name: 'Jane Johnson',
            email: 'jane.johnson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 40,
          },
          {
            type: UserType.CHILD,
            name: 'Jimmy Johnson',
            email: 'jimmy.johnson@child.local',
            age: 12,
          },
          {
            type: UserType.CHILD,
            name: 'Jenny Johnson',
            email: 'jenny.johnson@child.local',
            age: 9,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Make John Johnson admin of Summer Camp trip
  const johnJohnson = johnsonFamily.members.find(
    (m) => m.email === 'john.johnson@example.com',
  )!;
  await prisma.trip.update({
    where: { id: summerCampTrip.id },
    data: {
      admins: {
        connect: { id: johnJohnson.id },
      },
    },
  });

  console.log(
    `✅ Created ${johnsonFamily.name} (4 members, John is admin of Summer Camp)`,
  );

  // Family 2 - The Smiths (Trip admin for Winter Retreat)
  const smithFamily = await prisma.family.create({
    data: {
      name: 'The Smiths',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'Michael Smith',
            email: 'michael.smith@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 38,
          },
          {
            type: UserType.ADULT,
            name: 'Sarah Smith',
            email: 'sarah.smith@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 36,
          },
          {
            type: UserType.CHILD,
            name: 'Sophie Smith',
            email: 'sophie.smith@child.local',
            age: 7,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Make Michael Smith admin of Winter Retreat trip
  const michaelSmith = smithFamily.members.find(
    (m) => m.email === 'michael.smith@example.com',
  )!;
  await prisma.trip.update({
    where: { id: winterRetreatTrip.id },
    data: {
      admins: {
        connect: { id: michaelSmith.id },
      },
    },
  });

  console.log(
    `✅ Created ${smithFamily.name} (3 members, Michael is admin of Winter Retreat)`,
  );

  // Family 3 - The Garcia Family (Trip admin for Beach Getaway draft)
  const garciaFamily = await prisma.family.create({
    data: {
      name: 'The Garcia Family',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'Carlos Garcia',
            email: 'carlos.garcia@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 45,
          },
          {
            type: UserType.ADULT,
            name: 'Maria Garcia',
            email: 'maria.garcia@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 43,
          },
          {
            type: UserType.CHILD,
            name: 'Diego Garcia',
            email: 'diego.garcia@child.local',
            age: 15,
          },
          {
            type: UserType.CHILD,
            name: 'Isabella Garcia',
            email: 'isabella.garcia@child.local',
            age: 13,
          },
          {
            type: UserType.CHILD,
            name: 'Lucas Garcia',
            email: 'lucas.garcia@child.local',
            age: 8,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Make Carlos Garcia admin of Beach Getaway trip
  const carlosGarcia = garciaFamily.members.find(
    (m) => m.email === 'carlos.garcia@example.com',
  )!;
  await prisma.trip.update({
    where: { id: beachTripDraft.id },
    data: {
      admins: {
        connect: { id: carlosGarcia.id },
      },
    },
  });

  console.log(
    `✅ Created ${garciaFamily.name} (5 members, Carlos is admin of Beach Getaway)`,
  );

  // Family 4 - The Chen Family (Regular family)
  const chenFamily = await prisma.family.create({
    data: {
      name: 'The Chen Family',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'David Chen',
            email: 'david.chen@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 35,
          },
          {
            type: UserType.ADULT,
            name: 'Lisa Chen',
            email: 'lisa.chen@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 33,
          },
          {
            type: UserType.CHILD,
            name: 'Emily Chen',
            email: 'emily.chen@child.local',
            age: 6,
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${chenFamily.name} (3 members)`);

  // Family 5 - The Wilson Family (Pending approval)
  const wilsonFamily = await prisma.family.create({
    data: {
      name: 'The Wilson Family',
      status: FamilyStatus.PENDING,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'Robert Wilson',
            email: 'robert.wilson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 50,
          },
          {
            type: UserType.ADULT,
            name: 'Emma Wilson',
            email: 'emma.wilson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 48,
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${wilsonFamily.name} (2 members, PENDING approval)`);

  // Family 6 - The Brown Family (Inactive)
  const brownFamily = await prisma.family.create({
    data: {
      name: 'The Brown Family',
      status: FamilyStatus.APPROVED,
      isActive: false,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'Thomas Brown',
            email: 'thomas.brown@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 55,
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${brownFamily.name} (1 member, INACTIVE)`);

  // Create Trip Attendances
  console.log('📋 Adding trip attendances...');

  // Summer Camp attendees
  await prisma.tripAttendance.createMany({
    data: [
      { tripId: summerCampTrip.id, familyId: johnsonFamily.id },
      { tripId: summerCampTrip.id, familyId: smithFamily.id },
      { tripId: summerCampTrip.id, familyId: garciaFamily.id },
      { tripId: summerCampTrip.id, familyId: chenFamily.id },
    ],
  });

  // Winter Retreat attendees
  await prisma.tripAttendance.createMany({
    data: [
      { tripId: winterRetreatTrip.id, familyId: smithFamily.id },
      { tripId: winterRetreatTrip.id, familyId: garciaFamily.id },
      { tripId: winterRetreatTrip.id, familyId: johnsonFamily.id },
    ],
  });

  // Beach Getaway attendees (draft trip)
  await prisma.tripAttendance.createMany({
    data: [
      { tripId: beachTripDraft.id, familyId: garciaFamily.id },
      { tripId: beachTripDraft.id, familyId: chenFamily.id },
    ],
  });

  console.log('✅ Added trip attendances');

  // Create Gear Items for Summer Camp
  console.log('🎒 Creating gear items...');

  const tentsItem = await prisma.gearItem.create({
    data: {
      tripId: summerCampTrip.id,
      name: 'Tents (4-person)',
      quantityNeeded: 5,
    },
  });

  const sleepingBagsItem = await prisma.gearItem.create({
    data: {
      tripId: summerCampTrip.id,
      name: 'Sleeping Bags',
      quantityNeeded: 15,
    },
  });

  const campStovesItem = await prisma.gearItem.create({
    data: {
      tripId: summerCampTrip.id,
      name: 'Camp Stoves',
      quantityNeeded: 3,
    },
  });

  const coolersItem = await prisma.gearItem.create({
    data: {
      tripId: summerCampTrip.id,
      name: 'Coolers (Large)',
      quantityNeeded: 4,
    },
  });

  console.log('✅ Created gear items for Summer Camp');

  // Create Gear Assignments
  console.log('📦 Creating gear assignments...');

  await prisma.gearAssignment.createMany({
    data: [
      // Johnsons bringing 2 tents and 4 sleeping bags
      {
        gearItemId: tentsItem.id,
        familyId: johnsonFamily.id,
        quantityAssigned: 2,
      },
      {
        gearItemId: sleepingBagsItem.id,
        familyId: johnsonFamily.id,
        quantityAssigned: 4,
      },
      // Smiths bringing 1 tent, 3 sleeping bags, and 1 camp stove
      {
        gearItemId: tentsItem.id,
        familyId: smithFamily.id,
        quantityAssigned: 1,
      },
      {
        gearItemId: sleepingBagsItem.id,
        familyId: smithFamily.id,
        quantityAssigned: 3,
      },
      {
        gearItemId: campStovesItem.id,
        familyId: smithFamily.id,
        quantityAssigned: 1,
      },
      // Garcias bringing 1 tent, 5 sleeping bags, 1 camp stove, and 2 coolers
      {
        gearItemId: tentsItem.id,
        familyId: garciaFamily.id,
        quantityAssigned: 1,
      },
      {
        gearItemId: sleepingBagsItem.id,
        familyId: garciaFamily.id,
        quantityAssigned: 5,
      },
      {
        gearItemId: campStovesItem.id,
        familyId: garciaFamily.id,
        quantityAssigned: 1,
      },
      {
        gearItemId: coolersItem.id,
        familyId: garciaFamily.id,
        quantityAssigned: 2,
      },
      // Chens bringing 1 tent, 3 sleeping bags, and 2 coolers
      {
        gearItemId: tentsItem.id,
        familyId: chenFamily.id,
        quantityAssigned: 1,
      },
      {
        gearItemId: sleepingBagsItem.id,
        familyId: chenFamily.id,
        quantityAssigned: 3,
      },
      {
        gearItemId: coolersItem.id,
        familyId: chenFamily.id,
        quantityAssigned: 2,
      },
    ],
  });

  console.log('✅ Created gear assignments');

  // Create Gear Items for Winter Retreat
  const skiEquipmentItem = await prisma.gearItem.create({
    data: {
      tripId: winterRetreatTrip.id,
      name: 'Ski Equipment Sets',
      quantityNeeded: 10,
    },
  });

  const snowboardsItem = await prisma.gearItem.create({
    data: {
      tripId: winterRetreatTrip.id,
      name: 'Snowboards',
      quantityNeeded: 5,
    },
  });

  await prisma.gearAssignment.createMany({
    data: [
      {
        gearItemId: skiEquipmentItem.id,
        familyId: smithFamily.id,
        quantityAssigned: 3,
      },
      {
        gearItemId: snowboardsItem.id,
        familyId: garciaFamily.id,
        quantityAssigned: 2,
      },
      {
        gearItemId: skiEquipmentItem.id,
        familyId: johnsonFamily.id,
        quantityAssigned: 4,
      },
    ],
  });

  console.log('✅ Created gear items and assignments for Winter Retreat');

  // Print summary
  console.log('\n📊 Seeding Summary:');
  console.log('='.repeat(50));
  console.log(`✅ 1 Super Admin: ${superAdmin.email}`);
  console.log(`✅ 3 Trips (2 active, 1 draft)`);
  console.log(`✅ 6 Families (4 active approved, 1 pending, 1 inactive)`);
  console.log(`✅ 3 Trip Admins:`);
  console.log(`   - ${johnJohnson.email} (Summer Camp 2025)`);
  console.log(`   - ${michaelSmith.email} (Winter Retreat 2026)`);
  console.log(`   - ${carlosGarcia.email} (Beach Getaway 2025 - draft)`);
  console.log(`✅ Gear items and assignments created`);
  console.log('\n🔑 Login credentials (all users):');
  console.log('   Password: password123');
  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
