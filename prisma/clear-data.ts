import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllData() {
  console.log('🗑️  Clearing all data from database tables...');

  try {
    // Delete in order of dependencies (child tables first)
    
    // Clear audit logs
    const deletedAuditLogs = await prisma.auditLog.deleteMany();
    console.log(`✅ Deleted ${deletedAuditLogs.count} audit logs`);

    // Clear notifications
    const deletedNotifications = await prisma.notification.deleteMany();
    console.log(`✅ Deleted ${deletedNotifications.count} notifications`);

    // Clear backups
    const deletedBackups = await prisma.backup.deleteMany();
    console.log(`✅ Deleted ${deletedBackups.count} backups`);

    // Clear invoices
    const deletedInvoices = await prisma.invoice.deleteMany();
    console.log(`✅ Deleted ${deletedInvoices.count} invoices`);

    // Clear subscriptions
    const deletedSubscriptions = await prisma.subscription.deleteMany();
    console.log(`✅ Deleted ${deletedSubscriptions.count} subscriptions`);

    // Clear customers
    const deletedCustomers = await prisma.customer.deleteMany();
    console.log(`✅ Deleted ${deletedCustomers.count} customers`);

    // Clear packages
    const deletedPackages = await prisma.package.deleteMany();
    console.log(`✅ Deleted ${deletedPackages.count} packages`);

    // Clear admins (last)
    const deletedAdmins = await prisma.admin.deleteMany();
    console.log(`✅ Deleted ${deletedAdmins.count} admins`);

    console.log('🎉 All data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

clearAllData()
  .catch((e) => {
    console.error('❌ Failed to clear database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });