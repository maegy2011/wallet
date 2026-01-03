const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function testAuth() {
  try {
    // Test admin password
    const admin = await db.admin.findUnique({
      where: { email: 'admin@mahfza.com' }
    });
    
    if (admin) {
      console.log('Admin found:', admin.email);
      console.log('Password hash exists:', !!admin.password);
      
      // Test password verification
      const isValid = await bcrypt.compare('admin123456', admin.password);
      console.log('Password verification for admin@mahfza.com:', isValid);
    }
    
    // Test super admin password
    const superAdmin = await db.admin.findUnique({
      where: { email: 'developer@mahfza.com' }
    });
    
    if (superAdmin) {
      console.log('\nSuper Admin found:', superAdmin.email);
      console.log('Password hash exists:', !!superAdmin.password);
      
      // Test password verification
      const isValid = await bcrypt.compare('admin123456', superAdmin.password);
      console.log('Password verification for developer@mahfza.com:', isValid);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testAuth();