import {
  PrismaClient,
  Role,
  FamilyStatus,
  UserType,
  MessageEventType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.whatsAppMessage.deleteMany({});
  await prisma.whatsAppMessageTemplate.deleteMany({});
  await prisma.log.deleteMany({});
  await prisma.tripScheduleItem.deleteMany({});
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
      name: 'משפחת מנהל',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'שרה כהן',
            email: 'admin@example.com',
            passwordHash: hashedPassword,
            role: Role.SUPER_ADMIN,
            age: 45,
          },
        ],
      },
    },
    include: { members: true },
  });

  console.log(`✅ Super Admin: ${superAdminFamily.members[0].email}`);

  // Create 11 Families
  console.log('👨‍👩‍👧‍👦 Creating 11 families...');

  const leviFam = await prisma.family.create({
    data: {
      name: 'משפחת לוי',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'יוסי לוי',
            email: 'john.johnson@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 42,
          },
          {
            type: UserType.ADULT,
            name: 'רחל לוי',
            email: 'jane.johnson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 40,
          },
          {
            type: UserType.CHILD,
            name: 'דניאל לוי',
            email: 'jimmy.johnson@child.local',
            age: 12,
          },
          {
            type: UserType.CHILD,
            name: 'נועה לוי',
            email: 'jenny.johnson@child.local',
            age: 9,
          },
        ],
      },
    },
    include: { members: true },
  });

  const avniFam = await prisma.family.create({
    data: {
      name: 'משפחת אבני',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'מיכאל אבני',
            email: 'michael.smith@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 38,
          },
          {
            type: UserType.ADULT,
            name: 'שירה אבני',
            email: 'sarah.smith@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 36,
          },
          {
            type: UserType.CHILD,
            name: 'תמר אבני',
            email: 'sophie.smith@child.local',
            age: 7,
          },
        ],
      },
    },
    include: { members: true },
  });

  const mizrahiFam = await prisma.family.create({
    data: {
      name: 'משפחת מזרחי',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'אבי מזרחי',
            email: 'carlos.garcia@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 45,
          },
          {
            type: UserType.ADULT,
            name: 'מיכל מזרחי',
            email: 'maria.garcia@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 43,
          },
          {
            type: UserType.CHILD,
            name: 'אייל מזרחי',
            email: 'diego.garcia@child.local',
            age: 15,
          },
          {
            type: UserType.CHILD,
            name: 'ליאור מזרחי',
            email: 'isabella.garcia@child.local',
            age: 13,
          },
          {
            type: UserType.CHILD,
            name: 'יונתן מזרחי',
            email: 'lucas.garcia@child.local',
            age: 8,
          },
        ],
      },
    },
    include: { members: true },
  });

  const shafirFam = await prisma.family.create({
    data: {
      name: 'משפחת שפיר',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'דוד שפיר',
            email: 'david.chen@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 35,
          },
          {
            type: UserType.ADULT,
            name: 'עדי שפיר',
            email: 'lisa.chen@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 33,
          },
          {
            type: UserType.CHILD,
            name: 'מאיה שפיר',
            email: 'emily.chen@child.local',
            age: 6,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Friedman family (2 parents, no children - pending status)
  await prisma.family.create({
    data: {
      name: 'משפחת פרידמן',
      status: FamilyStatus.PENDING,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'רון פרידמן',
            email: 'robert.wilson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 50,
          },
          {
            type: UserType.ADULT,
            name: 'ענת פרידמן',
            email: 'emma.wilson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 48,
          },
        ],
      },
    },
    include: { members: true },
  });

  // Create the Barn family (2 parents, 2 children)
  // Inactive family
  await prisma.family.create({
    data: {
      name: 'משפחת ברון',
      status: FamilyStatus.APPROVED,
      isActive: false,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'אריאל ברון',
            email: 'thomas.brown@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 55,
          },
        ],
      },
    },
    include: { members: true },
  });

  const benDavidFam = await prisma.family.create({
    data: {
      name: 'משפחת בן-דוד',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'אלי בן-דוד',
            email: 'luis.rodriguez@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 41,
          },
          {
            type: UserType.ADULT,
            name: 'אנה בן-דוד',
            email: 'ana.rodriguez@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 39,
          },
          {
            type: UserType.CHILD,
            name: 'עומר בן-דוד',
            email: 'miguel.rodriguez@child.local',
            age: 11,
          },
          {
            type: UserType.CHILD,
            name: 'שני בן-דוד',
            email: 'sofia.rodriguez@child.local',
            age: 14,
          },
        ],
      },
    },
    include: { members: true },
  });

  const refaeliFam = await prisma.family.create({
    data: {
      name: 'משפחת רפאלי',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'עמית רפאלי',
            email: 'james.lee@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 44,
          },
          {
            type: UserType.ADULT,
            name: 'ליאת רפאלי',
            email: 'michelle.lee@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 42,
          },
          {
            type: UserType.CHILD,
            name: 'איתי רפאלי',
            email: 'kevin.lee@child.local',
            age: 10,
          },
          {
            type: UserType.CHILD,
            name: 'רוני רפאלי',
            email: 'amy.lee@child.local',
            age: 8,
          },
        ],
      },
    },
    include: { members: true },
  });

  const kaplanFam = await prisma.family.create({
    data: {
      name: 'משפחת כפלן',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'גיל כפלן',
            email: 'raj.patel@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 37,
          },
          {
            type: UserType.ADULT,
            name: 'דנה כפלן',
            email: 'priya.patel@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 35,
          },
          {
            type: UserType.CHILD,
            name: 'עדן כפלן',
            email: 'aisha.patel@child.local',
            age: 9,
          },
          {
            type: UserType.CHILD,
            name: 'טל כפלן',
            email: 'arjun.patel@child.local',
            age: 5,
          },
        ],
      },
    },
    include: { members: true },
  });

  const rosenbergFam = await prisma.family.create({
    data: {
      name: 'משפחת רוזנברג',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'נתן רוזנברג',
            email: 'mark.anderson@example.com',
            passwordHash: hashedPassword,
            role: Role.TRIP_ADMIN,
            age: 46,
          },
          {
            type: UserType.ADULT,
            name: 'הדס רוזנברג',
            email: 'jennifer.anderson@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 44,
          },
          {
            type: UserType.CHILD,
            name: 'אור רוזנברג',
            email: 'tyler.anderson@child.local',
            age: 16,
          },
        ],
      },
    },
    include: { members: true },
  });

  const baruchFam = await prisma.family.create({
    data: {
      name: 'משפחת ברוך',
      status: FamilyStatus.APPROVED,
      isActive: true,
      members: {
        create: [
          {
            type: UserType.ADULT,
            name: 'יניב ברוך',
            email: 'daniel.kim@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 40,
          },
          {
            type: UserType.ADULT,
            name: 'כרמל ברוך',
            email: 'hannah.kim@example.com',
            passwordHash: hashedPassword,
            role: Role.FAMILY,
            age: 38,
          },
          {
            type: UserType.CHILD,
            name: 'אלמוג ברוך',
            email: 'grace.kim@child.local',
            age: 12,
          },
        ],
      },
    },
    include: { members: true },
  });

  console.log('✅ Created 11 families (9 active, 1 pending, 1 inactive)');

  // Create 8 Trips
  console.log('🏔️  Creating 8 trips...');

  const summerCamp = await prisma.trip.create({
    data: {
      name: 'מחנה קיץ 2025',
      location: 'חניון אגם ההרים',
      description:
        'מחנה קיץ שנתי למשפחות עם פעילויות חוצות, טיולים וערבי מדורה.',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-20'),
      draft: false,
      attendanceCutoffDate: new Date('2025-06-30'),
      photoAlbumLink: 'https://photos.example.com/summer-camp-2025',
      admins: {
        connect: [
          {
            id: leviFam.members.find(
              (m) => m.email === 'john.johnson@example.com',
            )!.id,
          },
          {
            id: superAdminFamily.members[0].id,
          },
        ],
      },
    },
  });

  const winterRetreat = await prisma.trip.create({
    data: {
      name: 'מפגש חורף 2026',
      location: 'אכסניית פסגות השלג',
      description: 'מפגש חורף נעים עם סקי, סנובורד ושוקו חם ליד האח.',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-01-15'),
      draft: false,
      attendanceCutoffDate: new Date('2025-12-20'),
      admins: {
        connect: {
          id: avniFam.members.find(
            (m) => m.email === 'michael.smith@example.com',
          )!.id,
        },
      },
    },
  });

  const beachGetaway = await prisma.trip.create({
    data: {
      name: 'חופשת חוף 2025',
      location: 'חוף החולות המבריקים',
      description: 'חופשת חוף מרגיעה - עדיין בשלבי תכנון.',
      startDate: new Date('2025-08-20'),
      endDate: new Date('2025-08-25'),
      draft: true,
      attendanceCutoffDate: new Date('2025-08-01'),
      admins: {
        connect: {
          id: mizrahiFam.members.find(
            (m) => m.email === 'carlos.garcia@example.com',
          )!.id,
        },
      },
    },
  });

  const autumnHiking = await prisma.trip.create({
    data: {
      name: 'הרפתקת טיולים בסתיו 2025',
      location: 'הפארק הלאומי קניון הסלעים האדומים',
      description:
        'חוו את צבעי הסתיו העוצרי נשימה על שבילי הליכה נופיים. מושלם למשפחות אוהבות טבע.',
      startDate: new Date('2025-10-12'),
      endDate: new Date('2025-10-15'),
      draft: false,
      attendanceCutoffDate: new Date('2025-10-01'),
      photoAlbumLink: 'https://photos.example.com/autumn-hiking-2025',
      admins: {
        connect: {
          id: benDavidFam.members.find(
            (m) => m.email === 'luis.rodriguez@example.com',
          )!.id,
        },
      },
    },
  });

  const springFestival = await prisma.trip.create({
    data: {
      name: 'סוף שבוע פסטיבל האביב 2026',
      location: 'מרכז קהילתי עמק הפריחה',
      description:
        'סוף שבוע של חגיגות אביב עם הופעות תרבותיות, משחקים חיצוניים ואוכל מסורתי.',
      startDate: new Date('2026-04-17'),
      endDate: new Date('2026-04-19'),
      draft: false,
      attendanceCutoffDate: new Date('2026-04-10'),
      admins: {
        connect: {
          id: rosenbergFam.members.find(
            (m) => m.email === 'mark.anderson@example.com',
          )!.id,
        },
      },
    },
  });

  const cityTour = await prisma.trip.create({
    data: {
      name: 'סיור היסטורי בעיר 2026',
      location: 'מחוז המורשת במרכז העיר',
      description:
        'גלו את ההיסטוריה העשירה עם סיורים מודרכים, ביקורים במוזיאונים ושחזורים היסטוריים.',
      startDate: new Date('2026-05-23'),
      endDate: new Date('2026-05-24'),
      draft: false,
      attendanceCutoffDate: new Date('2026-05-15'),
      admins: {
        connect: [
          {
            id: superAdminFamily.members[0].id,
          },
        ],
      },
    },
  });

  const familyReunion = await prisma.trip.create({
    data: {
      name: 'מפגש קהילתי משפחתי 2026',
      location: 'פארק ואזור בילוי ריברסייד',
      description:
        'מפגש קהילתי שנתי עם ברביקיו, פעילויות ספורט, מופע כשרונות וזמן קשר.',
      startDate: new Date('2026-07-04'),
      endDate: new Date('2026-07-06'),
      draft: false,
      attendanceCutoffDate: new Date('2026-06-25'),
      photoAlbumLink: 'https://photos.example.com/reunion-2026',
      admins: {
        connect: [
          {
            id: avniFam.members.find(
              (m) => m.email === 'michael.smith@example.com',
            )!.id,
          },
          {
            id: benDavidFam.members.find(
              (m) => m.email === 'luis.rodriguez@example.com',
            )!.id,
          },
        ],
      },
    },
  });

  const memorialDay = await prisma.trip.create({
    data: {
      name: 'קמפינג יום הזיכרון 2025',
      location: 'חניון שפת האגם',
      description:
        'טיול קמפינג בעבר - סוף שבוע יום הזיכרון עם שייט בקיאק וחקר שבילים.',
      startDate: new Date('2025-05-24'),
      endDate: new Date('2025-05-27'),
      draft: false,
      attendanceCutoffDate: new Date('2025-05-15'),
      photoAlbumLink: 'https://photos.example.com/memorial-day-2025',
      admins: {
        connect: {
          id: mizrahiFam.members.find(
            (m) => m.email === 'carlos.garcia@example.com',
          )!.id,
        },
      },
    },
  });

  console.log('✅ Created 8 trips (6 published, 1 draft, 1 past)');

  // Add Trip Attendances with Dietary Requirements
  console.log('📋 Adding trip attendances with dietary requirements...');

  await prisma.tripAttendance.createMany({
    data: [
      // Summer Camp - 7 families (including super admin)
      {
        tripId: summerCamp.id,
        familyId: superAdminFamily.id,
        dietaryRequirements: 'צמחוני',
      },
      {
        tripId: summerCamp.id,
        familyId: leviFam.id,
        dietaryRequirements: 'ללא גלוטן עבור נועה',
      },
      { tripId: summerCamp.id, familyId: avniFam.id },
      {
        tripId: summerCamp.id,
        familyId: mizrahiFam.id,
        dietaryRequirements: 'מועדפות ארוחות צמחוניות, ללא חזיר',
      },
      {
        tripId: summerCamp.id,
        familyId: shafirFam.id,
        dietaryRequirements: 'אלרגיות לאגוזים - מאיה',
      },
      {
        tripId: summerCamp.id,
        familyId: refaeliFam.id,
        dietaryRequirements: 'נדרש בשר כשר',
      },
      {
        tripId: summerCamp.id,
        familyId: kaplanFam.id,
        dietaryRequirements: 'משפחה צמחונית, ללא ביצים',
      },
      // Winter Retreat - 5 families
      { tripId: winterRetreat.id, familyId: avniFam.id },
      {
        tripId: winterRetreat.id,
        familyId: mizrahiFam.id,
        dietaryRequirements: 'מועדף צמחוני',
      },
      {
        tripId: winterRetreat.id,
        familyId: leviFam.id,
        dietaryRequirements: 'נדרשות אפשרויות ללא גלוטן',
      },
      { tripId: winterRetreat.id, familyId: baruchFam.id },
      {
        tripId: winterRetreat.id,
        familyId: rosenbergFam.id,
        dietaryRequirements: 'אי סבילות ללקטוז - הדס',
      },
      // Beach Getaway (draft) - 2 families
      { tripId: beachGetaway.id, familyId: mizrahiFam.id },
      {
        tripId: beachGetaway.id,
        familyId: shafirFam.id,
        dietaryRequirements: 'אלרגיות לאגוזים',
      },
      // Autumn Hiking - 5 families
      { tripId: autumnHiking.id, familyId: benDavidFam.id },
      {
        tripId: autumnHiking.id,
        familyId: refaeliFam.id,
        dietaryRequirements: 'ארוחות כשרות',
      },
      {
        tripId: autumnHiking.id,
        familyId: kaplanFam.id,
        dietaryRequirements: 'צמחוני, העדפות תזונה ג׳ייניות',
      },
      { tripId: autumnHiking.id, familyId: baruchFam.id },
      {
        tripId: autumnHiking.id,
        familyId: leviFam.id,
        dietaryRequirements: 'ללא גלוטן',
      },
      // Spring Festival - 7 families
      { tripId: springFestival.id, familyId: rosenbergFam.id },
      {
        tripId: springFestival.id,
        familyId: mizrahiFam.id,
        dietaryRequirements: 'צמחוני',
      },
      {
        tripId: springFestival.id,
        familyId: shafirFam.id,
        dietaryRequirements: 'אלרגיות חמורות לאגוזים - לשמור בנפרד',
      },
      { tripId: springFestival.id, familyId: avniFam.id },
      {
        tripId: springFestival.id,
        familyId: refaeliFam.id,
        dietaryRequirements: 'נדרש כשר',
      },
      {
        tripId: springFestival.id,
        familyId: kaplanFam.id,
        dietaryRequirements: 'צמחוני קפדן',
      },
      { tripId: springFestival.id, familyId: benDavidFam.id },
      // City Tour - 4 families (including super admin)
      { tripId: cityTour.id, familyId: superAdminFamily.id },
      { tripId: cityTour.id, familyId: leviFam.id },
      { tripId: cityTour.id, familyId: baruchFam.id },
      {
        tripId: cityTour.id,
        familyId: rosenbergFam.id,
        dietaryRequirements: 'ללא לקטוז',
      },
      // Family Reunion - 9 families
      {
        tripId: familyReunion.id,
        familyId: leviFam.id,
        dietaryRequirements: 'ללא גלוטן',
      },
      { tripId: familyReunion.id, familyId: avniFam.id },
      {
        tripId: familyReunion.id,
        familyId: mizrahiFam.id,
        dietaryRequirements: 'מועדף צמחוני',
      },
      {
        tripId: familyReunion.id,
        familyId: shafirFam.id,
        dietaryRequirements: 'אלרגיות לאגוזים',
      },
      {
        tripId: familyReunion.id,
        familyId: refaeliFam.id,
        dietaryRequirements: 'כשר',
      },
      {
        tripId: familyReunion.id,
        familyId: kaplanFam.id,
        dietaryRequirements: 'צמחוני',
      },
      { tripId: familyReunion.id, familyId: benDavidFam.id },
      { tripId: familyReunion.id, familyId: baruchFam.id },
      {
        tripId: familyReunion.id,
        familyId: rosenbergFam.id,
        dietaryRequirements: 'אי סבילות ללקטוז',
      },
      // Memorial Day (past) - 3 families
      { tripId: memorialDay.id, familyId: mizrahiFam.id },
      { tripId: memorialDay.id, familyId: leviFam.id },
      { tripId: memorialDay.id, familyId: refaeliFam.id },
    ],
  });

  console.log('✅ Added trip attendances with dietary requirements');

  // Create Gear Items
  console.log('🎒 Creating gear items and assignments...');

  // Summer Camp Gear
  const tent = await prisma.gearItem.create({
    data: {
      tripId: summerCamp.id,
      name: 'אוהלים (ל-4 אנשים)',
      quantityNeeded: 8,
    },
  });
  const sleepingBag = await prisma.gearItem.create({
    data: { tripId: summerCamp.id, name: 'שקי שינה', quantityNeeded: 24 },
  });
  const campStove = await prisma.gearItem.create({
    data: { tripId: summerCamp.id, name: 'כיריים קמפינג', quantityNeeded: 5 },
  });
  const cooler = await prisma.gearItem.create({
    data: {
      tripId: summerCamp.id,
      name: 'צידניות (גדולות)',
      quantityNeeded: 7,
    },
  });

  await prisma.gearAssignment.createMany({
    data: [
      {
        gearItemId: tent.id,
        familyId: superAdminFamily.id,
        quantityAssigned: 1,
      },
      {
        gearItemId: sleepingBag.id,
        familyId: superAdminFamily.id,
        quantityAssigned: 1,
      },
      { gearItemId: tent.id, familyId: leviFam.id, quantityAssigned: 2 },
      {
        gearItemId: sleepingBag.id,
        familyId: leviFam.id,
        quantityAssigned: 4,
      },
      { gearItemId: tent.id, familyId: avniFam.id, quantityAssigned: 1 },
      {
        gearItemId: sleepingBag.id,
        familyId: avniFam.id,
        quantityAssigned: 3,
      },
      { gearItemId: campStove.id, familyId: avniFam.id, quantityAssigned: 1 },
      { gearItemId: tent.id, familyId: mizrahiFam.id, quantityAssigned: 2 },
      {
        gearItemId: sleepingBag.id,
        familyId: mizrahiFam.id,
        quantityAssigned: 5,
      },
      {
        gearItemId: campStove.id,
        familyId: mizrahiFam.id,
        quantityAssigned: 1,
      },
      { gearItemId: cooler.id, familyId: mizrahiFam.id, quantityAssigned: 2 },
      { gearItemId: tent.id, familyId: shafirFam.id, quantityAssigned: 1 },
      {
        gearItemId: sleepingBag.id,
        familyId: shafirFam.id,
        quantityAssigned: 3,
      },
      { gearItemId: cooler.id, familyId: shafirFam.id, quantityAssigned: 2 },
      { gearItemId: tent.id, familyId: refaeliFam.id, quantityAssigned: 1 },
      {
        gearItemId: sleepingBag.id,
        familyId: refaeliFam.id,
        quantityAssigned: 4,
      },
      {
        gearItemId: campStove.id,
        familyId: refaeliFam.id,
        quantityAssigned: 1,
      },
      {
        gearItemId: sleepingBag.id,
        familyId: kaplanFam.id,
        quantityAssigned: 3,
      },
      { gearItemId: cooler.id, familyId: kaplanFam.id, quantityAssigned: 2 },
      { gearItemId: campStove.id, familyId: kaplanFam.id, quantityAssigned: 1 },
    ],
  });

  // Winter Retreat Gear
  const skiEquip = await prisma.gearItem.create({
    data: {
      tripId: winterRetreat.id,
      name: 'ערכות ציוד סקי',
      quantityNeeded: 12,
    },
  });
  const snowboard = await prisma.gearItem.create({
    data: { tripId: winterRetreat.id, name: 'סנובורדים', quantityNeeded: 6 },
  });

  await prisma.gearAssignment.createMany({
    data: [
      { gearItemId: skiEquip.id, familyId: avniFam.id, quantityAssigned: 3 },
      {
        gearItemId: snowboard.id,
        familyId: mizrahiFam.id,
        quantityAssigned: 2,
      },
      { gearItemId: skiEquip.id, familyId: leviFam.id, quantityAssigned: 4 },
      { gearItemId: skiEquip.id, familyId: baruchFam.id, quantityAssigned: 3 },
      {
        gearItemId: snowboard.id,
        familyId: rosenbergFam.id,
        quantityAssigned: 1,
      },
    ],
  });

  // Autumn Hiking Gear
  const backpack = await prisma.gearItem.create({
    data: {
      tripId: autumnHiking.id,
      name: 'תיקי גב לטיולים',
      quantityNeeded: 15,
    },
  });
  const poles = await prisma.gearItem.create({
    data: {
      tripId: autumnHiking.id,
      name: 'מקלות טיול',
      quantityNeeded: 10,
    },
  });

  await prisma.gearAssignment.createMany({
    data: [
      {
        gearItemId: backpack.id,
        familyId: benDavidFam.id,
        quantityAssigned: 4,
      },
      { gearItemId: poles.id, familyId: benDavidFam.id, quantityAssigned: 2 },
      { gearItemId: backpack.id, familyId: refaeliFam.id, quantityAssigned: 4 },
      { gearItemId: poles.id, familyId: refaeliFam.id, quantityAssigned: 4 },
      { gearItemId: backpack.id, familyId: kaplanFam.id, quantityAssigned: 4 },
      { gearItemId: poles.id, familyId: baruchFam.id, quantityAssigned: 2 },
      { gearItemId: backpack.id, familyId: leviFam.id, quantityAssigned: 3 },
      { gearItemId: poles.id, familyId: leviFam.id, quantityAssigned: 2 },
    ],
  });

  console.log('✅ Created gear items and assignments');

  // Create Trip Schedules
  console.log('📅 Creating detailed trip schedules...');

  // Summer Camp Schedule (3 days, 15 items)
  await prisma.tripScheduleItem.createMany({
    data: [
      {
        tripId: summerCamp.id,
        day: 1,
        startTime: '10:00',
        endTime: '12:00',
        title: 'הגעה והקמה',
        description: 'צ׳ק-אין, הקמת אוהלים והדרכת פתיחה',
        location: 'אזור המחנה הראשי',
      },
      {
        tripId: summerCamp.id,
        day: 1,
        startTime: '12:30',
        endTime: '13:30',
        title: 'ארוחת צהריים',
        description: 'ארוחת ברביקיו לקבלת פנים',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 1,
        startTime: '14:00',
        endTime: '17:00',
        title: 'פעילויות באגם',
        description: 'שחייה, קיאקים וגלשנים',
        location: 'חוף אגם ההרים',
      },
      {
        tripId: summerCamp.id,
        day: 1,
        startTime: '18:00',
        endTime: '19:00',
        title: 'ארוחת ערב',
        description: 'ארוחת ערב במתכונת משפחתית',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 1,
        startTime: '20:00',
        endTime: '22:00',
        title: 'ערב מדורה',
        description: 'סיפורים, שירים ומרשמלו',
        location: 'מדורה מרכזית',
      },
      {
        tripId: summerCamp.id,
        day: 2,
        startTime: '08:00',
        endTime: '09:00',
        title: 'ארוחת בוקר',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 2,
        startTime: '09:30',
        endTime: '12:00',
        title: 'טיול בוקר',
        description: 'טיול שביל נופי לתצפית נקודת הנשר',
        location: 'תחילת השביל',
      },
      {
        tripId: summerCamp.id,
        day: 2,
        startTime: '12:30',
        endTime: '13:30',
        title: 'ארוחת צהריים',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 2,
        startTime: '14:00',
        endTime: '17:00',
        title: 'זמן חופשי / פעילויות אופציונליות',
        description: 'אומנות ויצירה, ספורט או מנוחה',
      },
      {
        tripId: summerCamp.id,
        day: 2,
        startTime: '18:00',
        endTime: '19:00',
        title: 'ארוחת ערב',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 2,
        startTime: '20:00',
        endTime: '22:00',
        title: 'מופע כשרונות',
        description: 'הופעות משפחתיות ובידור',
        location: 'אמפיתיאטרון',
      },
      {
        tripId: summerCamp.id,
        day: 3,
        startTime: '08:00',
        endTime: '09:00',
        title: 'ארוחת בוקר',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 3,
        startTime: '09:30',
        endTime: '11:00',
        title: 'ציד אוצר בטבע',
        description: 'תחרות משפחתית עם פרסים',
      },
      {
        tripId: summerCamp.id,
        day: 3,
        startTime: '12:00',
        endTime: '13:00',
        title: 'ארוחת צהריים',
        location: 'ביתן האוכל',
      },
      {
        tripId: summerCamp.id,
        day: 3,
        startTime: '14:00',
        endTime: '16:00',
        title: 'איסוף ויציאה',
        description: 'ניקיון, פירוק ופרידות',
      },
    ],
  });

  // Winter Retreat Schedule (3 days, 13 items)
  await prisma.tripScheduleItem.createMany({
    data: [
      {
        tripId: winterRetreat.id,
        day: 1,
        startTime: '14:00',
        endTime: '16:00',
        title: 'צ׳ק-אין',
        description: 'שיבוץ חדרים והכרת האכסניה',
        location: 'לובי ראשי אכסניית פסגות השלג',
      },
      {
        tripId: winterRetreat.id,
        day: 1,
        startTime: '18:00',
        endTime: '19:30',
        title: 'ארוחת קבלת פנים',
        description: 'ארוחה חמה וסקירת הטיול',
        location: 'חדר אוכל האכסניה',
      },
      {
        tripId: winterRetreat.id,
        day: 1,
        startTime: '20:00',
        endTime: '22:00',
        title: 'שוקו חם ליד האח',
        description: 'התרועעות נינוחה ומשחקי קופסה',
        location: 'טרקלין ראשי',
      },
      {
        tripId: winterRetreat.id,
        day: 2,
        startTime: '08:00',
        endTime: '09:00',
        title: 'ארוחת בוקר',
        location: 'חדר אוכל האכסניה',
      },
      {
        tripId: winterRetreat.id,
        day: 2,
        startTime: '09:30',
        endTime: '12:00',
        title: 'סשן סקי בוקר',
        description: 'לשליפות! שיעורים זמינים למתחילים',
        location: 'אתר הסקי',
      },
      {
        tripId: winterRetreat.id,
        day: 2,
        startTime: '12:30',
        endTime: '13:30',
        title: 'ארוחת צהריים',
        location: 'בית קפה בצד המדרון',
      },
      {
        tripId: winterRetreat.id,
        day: 2,
        startTime: '14:00',
        endTime: '17:00',
        title: 'סקי/סנובורד אחר הצהריים',
        location: 'אתר הסקי',
      },
      {
        tripId: winterRetreat.id,
        day: 2,
        startTime: '18:30',
        endTime: '20:00',
        title: 'ארוחת ערב',
        location: 'חדר אוכל האכסניה',
      },
      {
        tripId: winterRetreat.id,
        day: 2,
        startTime: '20:30',
        endTime: '22:00',
        title: 'ערב סרט',
        description: 'הקרנת סרט ידידותי למשפחה',
        location: 'אולם קולנוע האכסניה',
      },
      {
        tripId: winterRetreat.id,
        day: 3,
        startTime: '08:00',
        endTime: '09:00',
        title: 'ארוחת בוקר',
        location: 'חדר אוכל האכסניה',
      },
      {
        tripId: winterRetreat.id,
        day: 3,
        startTime: '10:00',
        endTime: '12:00',
        title: 'סשן סקי אחרון',
        location: 'אתר הסקי',
      },
      {
        tripId: winterRetreat.id,
        day: 3,
        startTime: '12:30',
        endTime: '14:00',
        title: 'ארוחת בראנץ׳ לסיום',
        location: 'חדר אוכל האכסניה',
      },
      {
        tripId: winterRetreat.id,
        day: 3,
        startTime: '14:00',
        title: 'צ׳ק-אאוט ויציאה',
        location: 'לובי ראשי האכסניה',
      },
    ],
  });

  // Autumn Hiking Schedule (2 days, 9 items)
  await prisma.tripScheduleItem.createMany({
    data: [
      {
        tripId: autumnHiking.id,
        day: 1,
        startTime: '09:00',
        endTime: '10:00',
        title: 'הגעה ורישום',
        description: 'מפגש במרכז המבקרים של הפארק',
        location: 'מרכז מבקרים קניון הסלעים האדומים',
      },
      {
        tripId: autumnHiking.id,
        day: 1,
        startTime: '10:30',
        endTime: '13:00',
        title: 'טיול שביל שפת הקניון',
        description: 'טיול בינוני של 8 ק״מ עם נופי עלווה סתווית מדהימים',
        location: 'תחילת שביל שפת הקניון',
      },
      {
        tripId: autumnHiking.id,
        day: 1,
        startTime: '13:00',
        endTime: '14:00',
        title: 'ארוחת פיקניק',
        description: 'הכינו ארוחת צהריים משלכם',
        location: 'אזור פיקניק בתצפית נופית',
      },
      {
        tripId: autumnHiking.id,
        day: 1,
        startTime: '15:00',
        endTime: '17:00',
        title: 'סיור צילום',
        description: 'תפסו את צבעי הסתיו עם צלם מקצועי',
        location: 'שביל לולאת העמק',
      },
      {
        tripId: autumnHiking.id,
        day: 1,
        startTime: '18:00',
        endTime: '19:30',
        title: 'ארוחת ערב במסעדה מקומית',
        location: 'גריל נוף הקניון',
      },
      {
        tripId: autumnHiking.id,
        day: 2,
        startTime: '08:00',
        endTime: '09:00',
        title: 'ארוחת בוקר',
        location: 'מלון',
      },
      {
        tripId: autumnHiking.id,
        day: 2,
        startTime: '09:30',
        endTime: '12:30',
        title: 'טיול שביל המפל',
        description: 'טיול ידידותי למשפחה של 5 ק״מ למפל עונתי',
        location: 'תחילת שביל מפלי קסקייד',
      },
      {
        tripId: autumnHiking.id,
        day: 2,
        startTime: '13:00',
        endTime: '14:00',
        title: 'ארוחת צהריים',
        location: 'בית קפה בפארק',
      },
      {
        tripId: autumnHiking.id,
        day: 2,
        startTime: '14:30',
        title: 'יציאה',
        description: 'נסיעה בטוחה הביתה!',
      },
    ],
  });

  // Spring Festival Schedule (2 days, 11 items)
  await prisma.tripScheduleItem.createMany({
    data: [
      {
        tripId: springFestival.id,
        day: 1,
        startTime: '10:00',
        endTime: '11:00',
        title: 'טקס פתיחה',
        description: 'נאום קבלת פנים והופעת ריקוד מסורתית',
        location: 'במה ראשית',
      },
      {
        tripId: springFestival.id,
        day: 1,
        startTime: '11:30',
        endTime: '13:00',
        title: 'יריד תרבות',
        description: 'סיור בדוכנים עם מלאכה, אוכל ותערוכות תרבותיות',
        location: 'שטחי הפסטיבל',
      },
      {
        tripId: springFestival.id,
        day: 1,
        startTime: '13:00',
        endTime: '14:00',
        title: 'ארוחת צהריים',
        description: 'דוכני אוכל מסורתי',
        location: 'אזור מתחם האוכל',
      },
      {
        tripId: springFestival.id,
        day: 1,
        startTime: '14:30',
        endTime: '16:00',
        title: 'פעילויות לילדים',
        description: 'ציור פנים, משחקים וסיפורים',
        location: 'ביתן הילדים',
      },
      {
        tripId: springFestival.id,
        day: 1,
        startTime: '16:30',
        endTime: '18:00',
        title: 'הופעות מוזיקליות',
        description: 'מוזיקה חיה מאמנים מקומיים',
        location: 'במה ראשית',
      },
      {
        tripId: springFestival.id,
        day: 1,
        startTime: '18:30',
        endTime: '20:00',
        title: 'ארוחת ערב קהילתית',
        description: 'ארוחה בסגנון פוטלאק (מנות מוקצות לפי משפחה)',
        location: 'חדר אוכל',
      },
      {
        tripId: springFestival.id,
        day: 2,
        startTime: '09:00',
        endTime: '10:00',
        title: 'ארוחת בוקר',
        location: 'חדר אוכל',
      },
      {
        tripId: springFestival.id,
        day: 2,
        startTime: '10:30',
        endTime: '12:00',
        title: 'טורניר משחקים חיצוניים',
        description: 'מרוצי שליחים, משיכת חבל ועוד',
        location: 'מגרש ספורט',
      },
      {
        tripId: springFestival.id,
        day: 2,
        startTime: '12:30',
        endTime: '13:30',
        title: 'ארוחת צהריים',
        location: 'אזור מתחם האוכל',
      },
      {
        tripId: springFestival.id,
        day: 2,
        startTime: '14:00',
        endTime: '16:00',
        title: 'מצעד האביב',
        description: 'מצעד צבעוני עם רכבים ותחפושות',
        location: 'מסלול רחוב ראשי',
      },
      {
        tripId: springFestival.id,
        day: 2,
        startTime: '16:30',
        title: 'טקס סיום ופרידה',
        location: 'במה ראשית',
      },
    ],
  });

  console.log('✅ Created detailed trip schedules');

  // Create WhatsApp Message Templates
  console.log('💬 Creating WhatsApp message templates...');

  const templates = [
    {
      name: 'Trip Created - Hebrew',
      eventType: MessageEventType.TRIP_CREATED,
      content: `🎉 *טיול חדש נוצר!*

📍 *{tripName}* ב{location}

📅 *תאריכים:*
מתאריך: {startDate}
עד תאריך: {endDate}

📝 *תיאור:*
{description}

👥 *מנהלי הטיול:*
{admins}

להרשמה ופרטים נוספים, אנא היכנסו למערכת.`,
      description: 'Template for new trip creation notifications',
      isActive: true,
    },
    {
      name: 'Trip Published - Hebrew',
      eventType: MessageEventType.TRIP_PUBLISHED,
      content: `📢 *הטיול פורסם!*

🎯 *{tripName}* ב{location}

📅 *תאריכים:*
מתאריך: {startDate}
עד תאריך: {endDate}

⏰ *מועד אחרון להרשמה:*
{cutoffDate}

👥 *מנהלי הטיול:*
{admins}

להרשמה, היכנסו למערכת ועדכנו את ההשתתפות שלכם!`,
      description: 'Template for trip publishing notifications',
      isActive: true,
    },
    {
      name: 'Attendance Update - Hebrew',
      eventType: MessageEventType.ATTENDANCE_UPDATE,
      content: `📊 *עדכון משתתפים* - {tripName}

👨‍👩‍👧‍👦 *מספר משפחות רשומות:* {attendeeCount}

📋 *רשימת משתתפים:*
{attendeeList}

תודה לכולם שנרשמו! מחכים לראותכם 🎉`,
      description: 'Template for attendance update notifications',
      isActive: true,
    },
    {
      name: 'Gear Assignment - Hebrew',
      eventType: MessageEventType.GEAR_ASSIGNMENT,
      content: `🎒 *חלוקת ציוד* - {tripName}

להלן רשימת הציוד וההתנדבויות:

{gearList}

תודה רבה לכל המשפחות שהתנדבו! 🙏

אם יש שינויים, אנא עדכנו במערכת.`,
      description: 'Template for gear assignment notifications',
      isActive: true,
    },
    {
      name: 'Trip Reminder - Hebrew',
      eventType: MessageEventType.TRIP_REMINDER,
      content: `⏰ *תזכורת טיול!*

🎯 *{tripName}* ב{location}

📅 *תאריך יציאה:*
{startDate}

⌛ *נותרו {daysUntilTrip} ימים!*

אנא וודאו שהכנתם את כל הציוד הנדרש.
נתראה בקרוב! 🚗✨`,
      description: 'Template for trip reminder notifications',
      isActive: true,
    },
    {
      name: 'Trip Start - Hebrew',
      eventType: MessageEventType.TRIP_START,
      content: `🎊 *הטיול מתחיל היום!*

🎯 *{tripName}*
📍 *{location}*

📋 *תוכנית היום:*
{schedule}

בהצלחה וטיול מהנה לכולם! 🌟`,
      description: 'Template for trip start day notifications',
      isActive: true,
    },
    {
      name: 'Attendance Cutoff Reminder - Hebrew',
      eventType: MessageEventType.ATTENDANCE_CUTOFF_REMINDER,
      content: `⚠️ *תזכורת אחרונה!*

🎯 *{tripName}*

⏰ *המועד האחרון להרשמה:*
{cutoffDate}

⌛ *נותרו {daysUntilCutoff} ימים!*

אם עדיין לא נרשמתם ואתם מעוניינים להשתתף, זה הזמן!
היכנסו למערכת ועדכנו את ההשתתפות שלכם.`,
      description: 'Template for attendance cutoff reminders',
      isActive: true,
    },
    {
      name: 'Custom Message - Hebrew',
      eventType: MessageEventType.CUSTOM,
      content: `שלום,

{message}

תודה,
מנהלי הטיול`,
      description: 'Customizable template for manual messages',
      isActive: true,
    },
  ];

  for (const template of templates) {
    await prisma.whatsAppMessageTemplate.create({
      data: template,
    });
  }

  console.log(`✅ Created ${templates.length} WhatsApp message templates`);

  // Summary
  console.log('\n📊 Enhanced Seeding Summary:');
  console.log('='.repeat(60));
  console.log(`✅ 1 Super Admin: ${superAdminFamily.members[0].email}`);
  console.log(`✅ 11 Families (9 active approved, 1 pending, 1 inactive)`);
  console.log(`✅ 8 Trips (6 active, 1 draft, 1 past)`);
  console.log(`✅ 5 Trip Admins`);
  console.log(`✅ 40+ Trip Attendances with Dietary Requirements`);
  console.log(`✅ 31 Gear Items across 3 Trips`);
  console.log(`✅ 48 Detailed Schedule Items across 4 Trips`);
  console.log(`✅ ${templates.length} WhatsApp Message Templates`);
  console.log(`\n🎯 Key Features Demonstrated:`);
  console.log('   ✓ Dietary Requirements Tracking');
  console.log('   ✓ Detailed Trip Schedules');
  console.log('   ✓ Multiple Trip Admins');
  console.log('   ✓ Comprehensive Gear Management');
  console.log('   ✓ Draft and Published Trips');
  console.log('   ✓ Past Trips with Historical Data');
  console.log('   ✓ WhatsApp Message Generation System');
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
