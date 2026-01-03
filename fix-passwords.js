const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function fixPasswords() {
  try {
    // Hash and update admin password
    const adminPassword = await bcrypt.hash('admin123456', 12);
    await db.admin.update({
      where: { email: 'admin@mahfza.com' },
      data: { password: adminPassword }
    });
    console.log('Updated admin@mahfza.com password');
    
    // Hash and update super admin password
    const superAdminPassword = await bcrypt.hash('admin123456', 12);
    await db.admin.update({
      where: { email: 'developer@mahfza.com' },
      data: { password: superAdminPassword }
    });
    console.log('Updated developer@mahfza.com password');
    
    // Hash and update lab admin password
    const labAdminPassword = await bcrypt.hash('Admin@2024!Lab', 12);
    await db.admin.update({
      where: { email: 'mohamed.adel@lab.com' },
      data: { password: labAdminPassword }
    });
    console.log('Updated mohamed.adel@lab.com password');
    
    console.log('All passwords have been updated with proper bcrypt hashes');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

fixPasswords();