import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSchema() {
  console.log('🔄 Migrating schema to new format...');

  try {
    // Get existing subscriptions
    const existingSubscriptions = await prisma.$queryRaw`SELECT * FROM subscriptions` as any[];
    
    if (existingSubscriptions.length > 0) {
      console.log(`Found ${existingSubscriptions.length} existing subscriptions to migrate...`);
      
      // Update existing subscriptions to add UUID
      for (const sub of existingSubscriptions) {
        const uuid = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        await prisma.$executeRaw`UPDATE subscriptions SET uuid = ${uuid} WHERE id = ${sub.id}`;
      }
      
      console.log('✅ Updated existing subscriptions with UUIDs');
    }

    // Get existing invoices
    const existingInvoices = await prisma.$queryRaw`SELECT * FROM invoices` as any[];
    
    if (existingInvoices.length > 0) {
      console.log(`Found ${existingInvoices.length} existing invoices to migrate...`);
      
      // Update existing invoices to add UUID and rename columns
      for (const inv of existingInvoices) {
        const uuid = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        await prisma.$executeRaw`UPDATE invoices SET uuid = ${uuid} WHERE id = ${inv.id}`;
      }
      
      console.log('✅ Updated existing invoices with UUIDs');
    }

    console.log('🎉 Schema migration completed!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

migrateSchema()
  .catch((e) => {
    console.error('❌ Failed to migrate:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });