import { PrismaClient, AdminRole, PackageType, PackageStatus, RenewalPolicy } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin (Mohamed Adel) - using plain password for now
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'mohamed.adel@lab.com' },
    update: {},
    create: {
      email: 'mohamed.adel@lab.com',
      password: 'Admin@2024!Lab', // Plain text for now - will be hashed in login
      role: AdminRole.SUPER_ADMIN,
      twoFactorEnabled: false, // Disable for initial setup
      isActive: true,
    },
  });

  // Create a regular admin for testing
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mahfza.com' },
    update: {},
    create: {
      email: 'admin@mahfza.com',
      password: 'admin@123', // Plain text for now
      role: AdminRole.ADMIN,
      twoFactorEnabled: false,
      isActive: true,
    },
  });

  // Create default packages
  const freePackage = await prisma.package.upsert({
    where: { uuid: 'PKG-FREE-DEFAULT' },
    update: {},
    create: {
      uuid: 'PKG-FREE-DEFAULT',
      name: 'Mahfza Free',
      type: PackageType.FREE,
      price: 0,
      duration: 365, // 1 year
      taxIncluded: false,
      renewalPolicy: RenewalPolicy.ANNUALLY,
      freeTrialDuration: 0,
      status: PackageStatus.ACTIVE,
    },
  });

  const basicPackage = await prisma.package.upsert({
    where: { uuid: 'PKG-BASIC-PAID' },
    update: {},
    create: {
      uuid: 'PKG-BASIC-PAID',
      name: 'Mahfza Basic',
      type: PackageType.PAID,
      price: 299.99,
      duration: 30, // 1 month
      taxIncluded: true,
      taxRate: 14,
      renewalPolicy: RenewalPolicy.MONTHLY,
      freeTrialDuration: 7,
      status: PackageStatus.ACTIVE,
    },
  });

  const proPackage = await prisma.package.upsert({
    where: { uuid: 'PKG-PRO-PAID' },
    update: {},
    create: {
      uuid: 'PKG-PRO-PAID',
      name: 'Mahfza Pro',
      type: PackageType.PAID,
      price: 799.99,
      duration: 30, // 1 month
      taxIncluded: true,
      taxRate: 14,
      renewalPolicy: RenewalPolicy.MONTHLY,
      freeTrialDuration: 7,
      status: PackageStatus.ACTIVE,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Super Admin: ${superAdmin.email} (Password: Admin@2024!Lab)`);
  console.log(`👤 Admin: ${admin.email} (Password: admin@123)`);
  console.log(`📦 Packages created: ${3} packages`);
  console.log(`   - ${freePackage.name} (FREE)`);
  console.log(`   - ${basicPackage.name} (${basicPackage.price} EGP/month)`);
  console.log(`   - ${proPackage.name} (${proPackage.price} EGP/month)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });