import { PrismaClient, AdminRole, CustomerType, CustomerStatus, PackageType, PackageStatus, RenewalPolicy, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function addUsers() {
  console.log('👥 Adding users to the database...');

  try {
    // 1. Add Super Admin
    const superAdmin = await prisma.admin.upsert({
      where: { email: 'developer@mahfza.com' },
      update: {},
      create: {
        email: 'developer@mahfza.com',
        password: 'admin123456', // Plain text for now
        role: AdminRole.SUPER_ADMIN,
        twoFactorEnabled: false,
        isActive: true,
      },
    });

    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // 2. Add Admin
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@mahfza.com' },
      update: {},
      create: {
        email: 'admin@mahfza.com',
        password: 'admin123456', // Plain text for now
        role: AdminRole.ADMIN,
        twoFactorEnabled: false,
        isActive: true,
      },
    });

    console.log(`✅ Admin created: ${admin.email}`);

    // 3. Add Client (Customer)
    const customer = await prisma.customer.upsert({
      where: { email: 'ma.egy2011@gmail.com' },
      update: {},
      create: {
        uuid: `CUS-${Date.now().toString(36).toUpperCase()}`,
        name: 'Mahfza Client',
        businessName: 'Mahfza Client Business',
        customerType: CustomerType.INDIVIDUAL,
        email: 'ma.egy2011@gmail.com',
        mobile: '+201234567890',
        address: 'Cairo, Egypt',
        province: 'Cairo',
        city: 'Cairo',
        street: 'Tahrir Square',
        currency: 'EGP',
        status: CustomerStatus.ACTIVE,
      },
    });

    console.log(`✅ Client created: ${customer.email}`);

    // 4. Get the free package for the client
    const freePackage = await prisma.package.findFirst({
      where: { 
        type: PackageType.FREE,
        status: PackageStatus.ACTIVE
      }
    });

    if (freePackage) {
      // Create a trial subscription for the client
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

      const subscription = await prisma.subscription.create({
        data: {
          uuid: `SUB-${Date.now().toString(36).toUpperCase()}`,
          customerId: customer.id,
          packageId: freePackage.id,
          startDate: new Date(),
          endDate: trialEndDate,
          status: SubscriptionStatus.TRIAL,
          autoRenew: false,
        },
      });

      console.log(`✅ Trial subscription created for client (ends: ${trialEndDate.toDateString()})`);
    } else {
      console.log(`⚠️  No free package found for client subscription`);
    }

    console.log('\n🎉 All users added successfully!');
    console.log('\n📋 User Credentials:');
    console.log(`🔑 Super Admin: developer@mahfza.com / admin123456`);
    console.log(`🔑 Admin: admin@mahfza.com / admin123456`);
    console.log(`🔑 Client: ma.egy2011@gmail.com / client123456`);

  } catch (error) {
    console.error('❌ Error adding users:', error);
    throw error;
  }
}

addUsers()
  .catch((e) => {
    console.error('❌ Failed to add users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });