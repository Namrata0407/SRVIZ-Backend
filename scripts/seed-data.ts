import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    await prisma.quote.deleteMany().catch(() => {});
    await prisma.leadStatusHistory.deleteMany().catch(() => {});
    await prisma.lead.deleteMany().catch(() => {});
    await prisma.package.deleteMany().catch(() => {});
    await prisma.event.deleteMany().catch(() => {});
  } catch (error) {
    console.log('Clearing existing data...');
  }

  const event1 = await prisma.event.create({
    data: {
      name: 'FIFA World Cup 2024',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-07-15'),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Summer Olympics 2024',
      startDate: new Date('2024-07-26'),
      endDate: new Date('2024-08-11'),
    },
  });

  const event3 = await prisma.event.create({
    data: {
      name: 'UEFA Champions League Final 2024',
      startDate: new Date('2024-05-31'),
      endDate: new Date('2024-06-01'),
    },
  });

  await prisma.package.create({
    data: {
      eventId: event1.id,
      title: 'Standard Package',
      basePrice: 5000.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event1.id,
      title: 'Premium Package',
      basePrice: 8000.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event2.id,
      title: 'Basic Package',
      basePrice: 6000.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event2.id,
      title: 'Deluxe Package',
      basePrice: 10000.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event3.id,
      title: 'Economy Package',
      basePrice: 3000.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event3.id,
      title: 'VIP Package',
      basePrice: 12000.00,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   - Created 3 events`);
  console.log(`   - Created 6 packages`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

