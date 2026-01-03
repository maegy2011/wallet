const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function checkPasswords() {
  try {
    const admins = await db.admin.findMany({
      select: {
        email: true,
        password: true,
        role: true
      }
    });
    
    console.log('Admin passwords:');
    admins.forEach(admin => {
      console.log(`- ${admin.email}:`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Password starts with $2: ${admin.password.startsWith('$2')}`);
      console.log(`  Password starts with $2a: ${admin.password.startsWith('$2a')}`);
      console.log(`  Password starts with $2b: ${admin.password.startsWith('$2b')}`);
      console.log(`  Password (first 20 chars): ${admin.password.substring(0, 20)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkPasswords();