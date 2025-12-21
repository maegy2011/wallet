import { db } from '@/lib/db'

const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'صلاحيات كاملة على النظام',
    permissions: [
      'view_wallets', 'create_wallets', 'edit_wallets', 'delete_wallets',
      'view_transactions', 'create_transactions',
      'view_reports',
      'manage_users', 'manage_branches',
      'view_cash_treasury', 'manage_cash_treasury'
    ]
  },
  {
    name: 'Branch Manager',
    description: 'مدير الفرع - صلاحيات على فرع واحد',
    permissions: [
      'view_wallets', 'create_wallets', 'edit_wallets',
      'view_transactions', 'create_transactions',
      'view_reports',
      'view_cash_treasury'
    ]
  },
  {
    name: 'Cashier',
    description: 'أمين الصندوق - صلاحيات محدودة',
    permissions: [
      'view_wallets',
      'view_transactions', 'create_transactions',
      'view_reports'
    ]
  },
  {
    name: 'Viewer',
    description: 'مشاهد فقط - صلاحيات للعرض فقط',
    permissions: [
      'view_wallets',
      'view_transactions',
      'view_reports',
      'view_cash_treasury'
    ]
  }
]

export async function seedRoles() {
  try {
    console.log('Seeding default roles...')
    
    for (const role of defaultRoles) {
      await db.role.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          permissions: JSON.stringify(role.permissions)
        },
        create: {
          name: role.name,
          description: role.description,
          permissions: JSON.stringify(role.permissions)
        }
      })
    }
    
    console.log('Default roles seeded successfully')
  } catch (error) {
    console.error('Error seeding roles:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedRoles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}