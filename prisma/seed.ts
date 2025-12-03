import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.quote.deleteMany();
  await prisma.leadStatusHistory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.package.deleteMany();
  await prisma.event.deleteMany();

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
      title: 'Basic Package - World Cup',
      basePrice: 1500.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event1.id,
      title: 'Premium Package - World Cup',
      basePrice: 3500.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event2.id,
      title: 'Standard Package - Olympics',
      basePrice: 2800.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event2.id,
      title: 'VIP Package - Olympics',
      basePrice: 5500.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event3.id,
      title: 'Economy Package - Champions League',
      basePrice: 1200.00,
    },
  });

  await prisma.package.create({
    data: {
      eventId: event3.id,
      title: 'Deluxe Package - Champions League',
      basePrice: 2400.00,
    },
  });

  console.log('✅ Seeding completed successfully!');
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

