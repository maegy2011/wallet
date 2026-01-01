/**
 * Database Seed Script
 * Populates the database with initial data for Mahfza Admin Dashboard
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper functions moved inline to avoid import issues
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean existing data (optional - comment out if you want to preserve data)
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.package.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.backup.deleteMany();

    // Create Super Admin (Mohamed Adel)
    console.log('👑 Creating Super Admin...');
    const superAdminPassword = 'Admin@2025!'; // Change this in production
    const hashedSuperAdminPassword = await hashPassword(superAdminPassword);
    
    const superAdmin = await prisma.admin.create({
      data: {
        email: 'mohamed.adel@lab.com',
        name: 'Mohamed Adel',
        password: hashedSuperAdminPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log(`✅ Super Admin created: ${superAdmin.email}`);
    console.log(`🔑 Password: ${superAdminPassword}`);

    // Create a regular Admin for testing
    console.log('👤 Creating Regular Admin...');
    const adminPassword = 'Admin@2025!';
    const hashedAdminPassword = await hashPassword(adminPassword);
    
    const regularAdmin = await prisma.admin.create({
      data: {
        email: 'admin@mahfza.com',
        name: 'Admin User',
        password: hashedAdminPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log(`✅ Regular Admin created: ${regularAdmin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);

    // Create Packages
    console.log('📦 Creating Packages...');
    
    const freePackage = await prisma.package.create({
      data: {
        uuid: 'PKG-FREE-001',
        name: 'Mahfza Free',
        description: 'Perfect for getting started with basic features',
        type: 'FREE',
        price: 0,
        duration: 30, // days
        currency: 'EGP',
        taxIncluded: false,
        taxRate: 0,
        renewalPolicy: 'MONTHLY',
        freeTrialDuration: 0,
        status: 'ACTIVE',
        maxWallets: 2,
        features: JSON.stringify([
          'Manual Balance Tracking',
          'Basic Reports',
          'Secure Data Encryption',
          '2 Wallets Maximum'
        ]),
      },
    });

    const proPackage = await prisma.package.create({
      data: {
        uuid: 'PKG-PRO-001',
        name: 'Mahfza Pro',
        description: 'Advanced features for professionals and growth',
        type: 'PAID',
        price: 60,
        duration: 30, // days
        currency: 'EGP',
        taxIncluded: true,
        taxType: 'VAT',
        taxRate: 0.14, // 14% VAT
        renewalPolicy: 'MONTHLY',
        freeTrialDuration: 7,
        status: 'ACTIVE',
        maxWallets: 999,
        features: JSON.stringify([
          'Unlimited Wallets',
          'Advanced Reports',
          'Transaction History',
          'Portfolio Overview',
          'Priority Support',
          'API Access',
          'Custom Analytics',
          'Export Features'
        ]),
      },
    });

    console.log(`✅ Created ${freePackage.name} package`);
    console.log(`✅ Created ${proPackage.name} package`);

    // Create Sample Customers
    console.log('👥 Creating Sample Customers...');
    
    const customers = [
      {
        uuid: 'CUS-00000001',
        name: 'Omar Tarek',
        businessName: 'Omar Trading',
        customerType: 'INDIVIDUAL' as const,
        email: 'omar.tarek@example.com',
        mobile: '+201234567890',
        address: '123 Main Street',
        province: 'Cairo',
        city: 'Cairo',
        street: 'Nasr City',
        currency: 'EGP',
        status: 'ACTIVE' as const,
      },
      {
        uuid: 'CUS-00000002',
        name: 'Leila Ahmed',
        businessName: 'Ahmed Investments',
        customerType: 'COMPANY' as const,
        email: 'leila.ahmed@example.com',
        mobile: '+201098765432',
        address: '456 Business Ave',
        province: 'Alexandria',
        city: 'Alexandria',
        street: 'Smouha',
        currency: 'EGP',
        status: 'ACTIVE' as const,
      },
      {
        uuid: 'CUS-00000003',
        name: 'Karim Mohamed',
        customerType: 'INDIVIDUAL' as const,
        email: 'karim.mohamed@example.com',
        mobile: '+201112223344',
        address: '789 Investment Blvd',
        province: 'Giza',
        city: 'Giza',
        street: 'Dokki',
        currency: 'EGP',
        status: 'ACTIVE' as const,
      },
    ];

    const createdCustomers = [];
    for (const customerData of customers) {
      const customer = await prisma.customer.create({
        data: customerData,
      });
      createdCustomers.push(customer);
    }

    console.log(`✅ Created ${createdCustomers.length} sample customers`);

    // Create Subscriptions
    console.log('📋 Creating Subscriptions...');
    
    // Omar - Active Pro Subscription
    const omarSubscription = await prisma.subscription.create({
      data: {
        customerId: createdCustomers[0].id,
        packageId: proPackage.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        autoRenewal: true,
        status: 'ACTIVE',
        upgradeHistory: JSON.stringify([
          {
            date: '2024-01-01',
            fromPackage: 'Mahfza Free',
            toPackage: 'Mahfza Pro',
            reason: 'Upgrade for more features'
          }
        ]),
      },
    });

    // Leila - Active Pro Subscription
    const leilaSubscription = await prisma.subscription.create({
      data: {
        customerId: createdCustomers[1].id,
        packageId: proPackage.id,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2025-02-14'),
        autoRenewal: true,
        status: 'ACTIVE',
      },
    });

    // Karim - Trial Subscription
    const karimSubscription = await prisma.subscription.create({
      data: {
        customerId: createdCustomers[2].id,
        packageId: proPackage.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        autoRenewal: true,
        status: 'TRIAL',
      },
    });

    console.log(`✅ Created subscriptions for all customers`);

    // Create Sample Invoices
    console.log('💰 Creating Sample Invoices...');
    
    const invoices = [
      // Omar's paid invoices
      {
        uuid: 'INV-2024-001',
        customerId: createdCustomers[0].id,
        packageId: proPackage.id,
        subscriptionId: omarSubscription.id,
        issueDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        subtotal: 60,
        tax: 8.4, // 14% VAT
        total: 68.4,
        paymentMethod: 'WALLET_TRANSFER' as const,
        paymentReference: 'PAY-2024-001',
        status: 'PAID' as const,
        paymentDate: new Date('2024-01-10'),
        renewalDate: new Date('2024-02-01'),
      },
      {
        uuid: 'INV-2024-002',
        customerId: createdCustomers[0].id,
        packageId: proPackage.id,
        subscriptionId: omarSubscription.id,
        issueDate: new Date('2024-02-01'),
        dueDate: new Date('2024-02-15'),
        subtotal: 60,
        tax: 8.4,
        total: 68.4,
        paymentMethod: 'WALLET_TRANSFER' as const,
        paymentReference: 'PAY-2024-002',
        status: 'PAID' as const,
        paymentDate: new Date('2024-02-08'),
        renewalDate: new Date('2024-03-01'),
      },
      // Leila's paid invoice
      {
        uuid: 'INV-2024-003',
        customerId: createdCustomers[1].id,
        packageId: proPackage.id,
        subscriptionId: leilaSubscription.id,
        issueDate: new Date('2024-02-15'),
        dueDate: new Date('2024-03-01'),
        subtotal: 60,
        tax: 8.4,
        total: 68.4,
        paymentMethod: 'WALLET_TRANSFER' as const,
        paymentReference: 'PAY-2024-003',
        status: 'PAID' as const,
        paymentDate: new Date('2024-02-20'),
        renewalDate: new Date('2024-03-15'),
      },
      // Omar's pending invoice
      {
        uuid: 'INV-2024-004',
        customerId: createdCustomers[0].id,
        packageId: proPackage.id,
        subscriptionId: omarSubscription.id,
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-15'),
        subtotal: 60,
        tax: 8.4,
        total: 68.4,
        paymentMethod: 'WALLET_TRANSFER' as const,
        status: 'PENDING' as const,
        renewalDate: new Date('2025-01-01'),
      },
    ];

    for (const invoiceData of invoices) {
      await prisma.invoice.create({
        data: invoiceData,
      });
    }

    console.log(`✅ Created ${invoices.length} sample invoices`);

    // Create System Settings
    console.log('⚙️ Creating System Settings...');
    
    const systemSettings = [
      {
        key: 'SITE_NAME',
        value: 'Mahfza | محفظة',
        description: 'Site name displayed in headers and titles',
      },
      {
        key: 'DEFAULT_CURRENCY',
        value: 'EGP',
        description: 'Default currency for all transactions',
      },
      {
        key: 'TRIAL_DURATION_DAYS',
        value: '7',
        description: 'Default trial duration in days',
      },
      {
        key: 'TAX_RATE',
        value: '0.14',
        description: 'Default tax rate (14% VAT)',
      },
      {
        key: 'MAX_LOGIN_ATTEMPTS',
        value: '5',
        description: 'Maximum login attempts before account lockout',
      },
      {
        key: 'ACCOUNT_LOCKOUT_DURATION',
        value: '30',
        description: 'Account lockout duration in minutes',
      },
      {
        key: 'BACKUP_ENCRYPTION_KEY',
        value: 'your-encryption-key-change-in-production',
        description: 'Encryption key for database backups',
      },
      {
        key: 'NOTIFICATION_EMAIL_FROM',
        value: 'noreply@mahfza.com',
        description: 'From email address for notifications',
      },
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.create({
        data: setting,
      });
    }

    console.log(`✅ Created ${systemSettings.length} system settings`);

    // Create Sample Notifications
    console.log('🔔 Creating Sample Notifications...');
    
    const notifications = [
      {
        customerId: createdCustomers[2].id,
        type: 'TRIAL_REMINDER' as const,
        title: 'Trial Ending Soon',
        message: 'Your Mahfza Pro trial will end in 3 days. Upgrade now to continue enjoying premium features!',
        sentVia: JSON.stringify(['Email']),
        sentAt: new Date(),
      },
      {
        customerId: createdCustomers[0].id,
        type: 'PAYMENT_REMINDER' as const,
        title: 'Payment Due',
        message: 'Your monthly subscription payment of EGP 68.40 is due on December 15, 2024.',
        sentVia: JSON.stringify(['Email', 'SMS']),
        scheduledFor: new Date('2024-12-10'),
      },
      {
        customerId: createdCustomers[1].id,
        type: 'SYSTEM_ANNOUNCEMENT' as const,
        title: 'New Features Available',
        message: 'Check out our new advanced reporting features in your Mahfza Pro dashboard!',
        sentVia: JSON.stringify(['Email']),
        sentAt: new Date('2024-11-01'),
      },
    ];

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification,
      });
    }

    console.log(`✅ Created ${notifications.length} sample notifications`);

    // Log admin actions
    console.log('📝 Creating Audit Logs...');
    
    await prisma.auditLog.createMany({
      data: [
        {
          adminId: superAdmin.id,
          action: 'CREATE',
          resource: 'ADMIN',
          resourceId: superAdmin.id,
          newValues: JSON.stringify({
            email: superAdmin.email,
            name: superAdmin.name,
            role: superAdmin.role,
          }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
        {
          adminId: superAdmin.id,
          action: 'CREATE',
          resource: 'PACKAGE',
          resourceId: freePackage.id,
          newValues: JSON.stringify({
            name: freePackage.name,
            type: freePackage.type,
            price: freePackage.price,
          }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
        {
          adminId: superAdmin.id,
          action: 'CREATE',
          resource: 'CUSTOMER',
          resourceId: createdCustomers[0].id,
          newValues: JSON.stringify({
            name: createdCustomers[0].name,
            email: createdCustomers[0].email,
            customerType: createdCustomers[0].customerType,
          }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
      ],
    });

    console.log('✅ Created audit logs');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👤 Admins: 2 (1 Super Admin, 1 Regular Admin)`);
    console.log(`   📦 Packages: 2 (Free, Pro)`);
    console.log(`   👥 Customers: 3`);
    console.log(`   📋 Subscriptions: 3`);
    console.log(`   💰 Invoices: 4`);
    console.log(`   🔔 Notifications: 3`);
    console.log(`   ⚙️ System Settings: 8`);
    console.log(`   📝 Audit Logs: 3`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Super Admin: ${superAdmin.email} / ${superAdminPassword}`);
    console.log(`   Regular Admin: ${regularAdmin.email} / ${adminPassword}`);
    
    console.log('\n🌐 Access the admin dashboard at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
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