import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function executeSQL(statement: string, ignoreExists = true) {
  try {
    await prisma.$executeRawUnsafe(statement);
    return true;
  } catch (error: any) {
    const msg = error.message || '';
    const code = error.meta?.code || '';
    if (ignoreExists && code === '42P07') {
      return false;
    }
    if (ignoreExists && (msg.includes('already exists') && !msg.includes('prepared statement'))) {
      return false;
    }
    if (code === '42P05') {
      console.error('⚠️  Prepared statement error - this is a Supabase pooler issue');
      throw new Error('Prepared statement error - please retry or use direct connection');
    }
    console.error('SQL Error Details:', { message: msg, code, statement: statement.substring(0, 100) });
    throw error;
  }
}

async function checkEnumExists() {
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT 1 FROM pg_type WHERE typname = 'LeadStatus'`);
    return Array.isArray(result) && result.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Running migration...');
  
  console.log('Step 1: Checking/Creating LeadStatus enum...');
  const enumExists = await checkEnumExists();
  if (!enumExists) {
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "LeadStatus" AS ENUM ('New', 'Contacted', 'QuoteSent', 'Interested', 'ClosedWon', 'ClosedLost');`);
      console.log('✅ LeadStatus enum created');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.meta?.code === '42P07') {
        console.log('✅ LeadStatus enum already exists');
      } else {
        console.log('⚠️  LeadStatus enum error:', error.message);
        throw error;
      }
    }
  } else {
    console.log('✅ LeadStatus enum already exists');
  }
  
  const migrationPath = path.join(__dirname, '../prisma/migrations/0_init/migration.sql');
  let migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/) && !s.includes('CREATE TYPE'));
  
  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      const sql = statement + ';';
      
      try {
        if (statement.includes('CREATE TABLE "Lead"')) {
          console.log(`🔍 Attempting to create Lead table...`);
        }
        const executed = await executeSQL(sql, false);
        if (executed) {
          console.log(`✅ [${i + 1}/${statements.length}] Executed: ${statement.substring(0, 50)}...`);
        }
      } catch (error: any) {
        const errorMsg = error.message || '';
        const errorCode = error.meta?.code || '';
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorCode === '42P07') {
          console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else if (errorCode === '42P01' && statement.includes('CREATE INDEX') && statement.includes('Lead')) {
          console.error(`❌ Cannot create index - Lead table doesn't exist. Creating Lead table first...`);
          const leadTableSQL = `CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "eventId" TEXT NOT NULL,
    "travellersCount" INTEGER NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);`;
          try {
            await executeSQL(leadTableSQL, false);
            console.log('✅ Lead table created!');
            await executeSQL(sql, false);
            console.log(`✅ [${i + 1}/${statements.length}] Index created after Lead table`);
          } catch (e: any) {
            console.error('❌ Failed to create Lead table:', e.message);
            throw e;
          }
        } else {
          console.error(`❌ Failed at statement ${i + 1}:`, statement.substring(0, 80) + '...');
          console.error('Error:', errorMsg, 'Code:', errorCode);
          throw error;
        }
      }
    }
    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
