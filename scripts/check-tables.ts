import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database tables...\n');
  
  const tables = ['Event', 'Package', 'Lead', 'LeadStatusHistory', 'Quote'];
  
  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`✅ ${table} table exists`);
    } catch (error: any) {
      if (error.message?.includes('does not exist') || error.meta?.code === '42P01') {
        console.log(`❌ ${table} table does NOT exist`);
      } else {
        console.log(`⚠️  ${table} table check failed:`, error.message);
      }
    }
  }
  
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT typname FROM pg_type WHERE typname = 'LeadStatus'`);
    if (Array.isArray(result) && result.length > 0) {
      console.log(`✅ LeadStatus enum exists`);
    } else {
      console.log(`❌ LeadStatus enum does NOT exist`);
    }
  } catch (error: any) {
    console.log(`⚠️  LeadStatus enum check failed:`, error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

