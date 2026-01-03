const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function checkUsers() {
  try {
    const admins = await db.admin.findMany({
      select: {
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log('Admin users:');
    admins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.role}, active: ${admin.isActive})`);
    });
    
    const customers = await db.customer.findMany({
      select: {
        email: true,
        businessName: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\nCustomers:');
    customers.forEach(customer => {
      console.log(`- ${customer.email} (${customer.businessName}, status: ${customer.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUsers();