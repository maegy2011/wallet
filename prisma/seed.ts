import { db } from '@/lib/db'

async function main() {
  console.log('Start seeding Multi-Tenant SaaS database...')

  // ========================================
  // TENANT 1: Free Plan (مستأجر مع خطة مجانية)
  // ========================================
  const tenant1 = await db.tenant.create({
    data: {
      id: 'tenant-free-1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      businessName: 'متجر الأناقة',
      businessLicense: '1010101010',
      plan: 'FREE',
      isActive: true
    }
  })
  console.log('Created Tenant 1 (Free Plan):', tenant1.name)

  // Create Company for Tenant 1
  const company1 = await db.company.create({
    data: {
      id: 'company-1',
      name: 'شركة الأناقة للتجزئة',
      description: 'شركة تجارة تجزئة للملابس',
      taxId: '300123456789',
      isActive: true,
      tenantId: tenant1.id
    }
  })
  console.log('Created Company 1 for Tenant 1:', company1.name)

  // Create Branches for Company 1
  const branch1_1 = await db.branch.create({
    data: {
      id: 'branch-1-1',
      name: 'فرع الرياض الرئيسي',
      address: 'الرياض، طريق الملك فهد',
      phone: '+966112345678',
      isActive: true,
      companyId: company1.id
    }
  })

  const branch1_2 = await db.branch.create({
    data: {
      id: 'branch-1-2',
      name: 'فرع جدة',
      address: 'جدة، شارع التحلية',
      phone: '+966128765432',
      isActive: true,
      companyId: company1.id
    }
  })
  console.log('Created 2 branches for Company 1')

  // Create Users for Tenant 1
  const user1_1 = await db.user.create({
    data: {
      id: 'user-1-1',
      email: 'ahmed@example.com',
      name: 'أحمد محمد',
      phone: '+966501234567',
      role: 'TENANT_OWNER',
      isActive: true,
      tenantId: tenant1.id,
      companyId: company1.id,
      branchId: branch1_1.id
    }
  })

  const user1_2 = await db.user.create({
    data: {
      id: 'user-1-2',
      email: 'manager1@example.com',
      name: 'خالد العمري',
      phone: '+966502345678',
      role: 'BRANCH_MANAGER',
      isActive: true,
      tenantId: tenant1.id,
      companyId: company1.id,
      branchId: branch1_1.id
    }
  })

  const user1_3 = await db.user.create({
    data: {
      id: 'user-1-3',
      email: 'supervisor1@example.com',
      name: 'سارة الحربي',
      phone: '+966503456789',
      role: 'SUPERVISOR',
      isActive: true,
      tenantId: tenant1.id,
      companyId: company1.id,
      branchId: branch1_1.id
    }
  })

  const user1_4 = await db.user.create({
    data: {
      id: 'user-1-4',
      email: 'employee1@example.com',
      name: 'محمد الغامدي',
      phone: '+966504567890',
      role: 'EMPLOYEE',
      isActive: true,
      tenantId: tenant1.id,
      companyId: company1.id,
      branchId: branch1_1.id
    }
  })
  console.log('Created 4 users for Tenant 1')

  // Create Partner for Tenant 1
  const partner1 = await db.partner.create({
    data: {
      id: 'partner-1',
      name: 'شركة التوريدات السريعة',
      email: 'info@supply-quick.com',
      phone: '+966115678901',
      company: 'شركة التوريدات السريعة',
      role: 'مورد أساسي',
      notes: 'مورد الملابس الرسمي',
      isActive: true,
      tenantId: tenant1.id
    }
  })
  console.log('Created Partner for Tenant 1')

  // Create 2 Wallets (Free Plan limit)
  const wallet1_1 = await db.wallet.create({
    data: {
      id: 'wallet-1-1',
      name: 'المحفظة الرئيسية',
      description: 'محفظة فرع الرياض',
      balance: 15000,
      currency: 'SAR',
      type: 'general',
      icon: 'wallet',
      color: 'primary',
      isActive: true,
      tenantId: tenant1.id,
      branchId: branch1_1.id
    }
  })

  const wallet1_2 = await db.wallet.create({
    data: {
      id: 'wallet-1-2',
      name: 'محفظة جدة',
      description: 'محفظة فرع جدة',
      balance: 8000,
      currency: 'SAR',
      type: 'general',
      icon: 'wallet',
      color: 'success',
      isActive: true,
      tenantId: tenant1.id,
      branchId: branch1_2.id
    }
  })
  console.log('Created 2 wallets for Tenant 1 (Free Plan limit)')

  // ========================================
  // TENANT 2: Merchant Plan (مستأجر مع خطة التاجر)
  // ========================================
  const tenant2 = await db.tenant.create({
    data: {
      id: 'tenant-merchant-1',
      name: 'شركة الأفق للمقاولات',
      email: 'horizon@example.com',
      phone: '+966505555555',
      businessName: 'شركة الأفق للمقاولات والإنشاءات',
      businessLicense: '2020202020',
      plan: 'MERCHANT',
      subscriptionEnd: new Date('2025-12-31'),
      isActive: true
    }
  })
  console.log('Created Tenant 2 (Merchant Plan):', tenant2.name)

  // Create Companies for Tenant 2
  const company2_1 = await db.company.create({
    data: {
      id: 'company-2-1',
      name: 'شركة الأفق للمقاولات',
      description: 'المقر الرئيسي',
      taxId: '400987654321',
      isActive: true,
      tenantId: tenant2.id
    }
  })

  const company2_2 = await db.company.create({
    data: {
      id: 'company-2-2',
      name: 'شركة الأفق للتجارة',
      description: 'قسم التجارة والتوريد',
      taxId: '400987654322',
      isActive: true,
      tenantId: tenant2.id
    }
  })
  console.log('Created 2 companies for Tenant 2')

  // Create Branches for Tenant 2
  const branch2_1_1 = await db.branch.create({
    data: {
      id: 'branch-2-1-1',
      name: 'فرع الدمام',
      address: 'الدمام، الشاطئ',
      phone: '+966131111111',
      isActive: true,
      companyId: company2_1.id
    }
  })

  const branch2_1_2 = await db.branch.create({
    data: {
      id: 'branch-2-1-2',
      name: 'فرع الخبر',
      address: 'الخبر، طريق الملك فهد',
      phone: '+966132222222',
      isActive: true,
      companyId: company2_1.id
    }
  })

  const branch2_2_1 = await db.branch.create({
    data: {
      id: 'branch-2-2-1',
      name: 'مركز التوريد',
      address: 'الدمام، المنطقة الصناعية',
      phone: '+966133333333',
      isActive: true,
      companyId: company2_2.id
    }
  })
  console.log('Created 3 branches for Tenant 2')

  // Create Users for Tenant 2
  const user2_1 = await db.user.create({
    data: {
      id: 'user-2-1',
      email: 'horizon@example.com',
      name: 'عبدالله السالم',
      phone: '+966505555555',
      role: 'TENANT_OWNER',
      isActive: true,
      tenantId: tenant2.id,
      companyId: company2_1.id,
      branchId: branch2_1_1.id
    }
  })

  const user2_2 = await db.user.create({
    data: {
      id: 'user-2-2',
      email: 'manager-horizon@example.com',
      name: 'سعيد القحطاني',
      phone: '+966506666666',
      role: 'COMPANY_MANAGER',
      isActive: true,
      tenantId: tenant2.id,
      companyId: company2_1.id,
      branchId: branch2_1_1.id
    }
  })

  const user2_3 = await db.user.create({
    data: {
      id: 'user-2-3',
      name: 'فهد الدوسري',
      email: 'branch-mgr@example.com',
      phone: '+966507777777',
      role: 'BRANCH_MANAGER',
      isActive: true,
      tenantId: tenant2.id,
      companyId: company2_1.id,
      branchId: branch2_1_2.id
    }
  })

  const user2_4 = await db.user.create({
    data: {
      id: 'user-2-4',
      name: 'ناصر العتيبي',
      email: 'supervisor2@example.com',
      phone: '+966508888888',
      role: 'SUPERVISOR',
      isActive: true,
      tenantId: tenant2.id,
      companyId: company2_1.id,
      branchId: branch2_1_1.id
    }
  })

  const user2_5 = await db.user.create({
    data: {
      id: 'user-2-5',
      name: 'أحمد الحربي',
      email: 'employee2@example.com',
      phone: '+966509999999',
      role: 'EMPLOYEE',
      isActive: true,
      tenantId: tenant2.id,
      companyId: company2_1.id,
      branchId: branch2_1_1.id
    }
  })
  console.log('Created 5 users for Tenant 2')

  // Create Partners for Tenant 2
  await db.partner.create({
    data: {
      id: 'partner-2-1',
      name: 'مصنع الإسمنت الوطني',
      email: 'contact@national-cement.com',
      phone: '+966111111111',
      company: 'مصنع الإسمنت الوطني',
      role: 'مورد مواد بناء',
      notes: 'مورد أساسي للإسمنت',
      isActive: true,
      tenantId: tenant2.id
    }
  })

  await db.partner.create({
    data: {
      id: 'partner-2-2',
      name: 'شركة النقل السريع',
      email: 'info@fast-transport.com',
      phone: '+966112222222',
      company: 'شركة النقل السريع',
      role: 'نقل ومقاولات',
      notes: 'شريك في مشاريع النقل',
      isActive: true,
      tenantId: tenant2.id
    }
  })
  console.log('Created 2 partners for Tenant 2')

  // Create 5 Wallets (Merchant Plan - unlimited)
  const wallet2_1 = await db.wallet.create({
    data: {
      id: 'wallet-2-1',
      name: 'المحفظة الرئيسية - الدمام',
      description: 'محفظة فرع الدمام',
      balance: 500000,
      currency: 'SAR',
      type: 'general',
      icon: 'wallet',
      color: 'primary',
      isActive: true,
      tenantId: tenant2.id,
      branchId: branch2_1_1.id
    }
  })

  const wallet2_2 = await db.wallet.create({
    data: {
      id: 'wallet-2-2',
      name: 'محفظة الخبر',
      description: 'محفظة فرع الخبر',
      balance: 250000,
      currency: 'SAR',
      type: 'general',
      icon: 'wallet',
      color: 'success',
      isActive: true,
      tenantId: tenant2.id,
      branchId: branch2_1_2.id
    }
  })

  const wallet2_3 = await db.wallet.create({
    data: {
      id: 'wallet-2-3',
      name: 'محفظة التوريد',
      description: 'مخصص للمشتريات والتوريدات',
      balance: 150000,
      currency: 'SAR',
      type: 'investment',
      icon: 'briefcase',
      color: 'purple',
      isActive: true,
      tenantId: tenant2.id,
      branchId: branch2_2_1.id
    }
  })

  const wallet2_4 = await db.wallet.create({
    data: {
      id: 'wallet-2-4',
      name: 'محفظة الرواتب',
      description: 'مخصص لرواتب الموظفين',
      balance: 200000,
      currency: 'SAR',
      type: 'savings',
      icon: 'users',
      color: 'warning',
      isActive: true,
      tenantId: tenant2.id
    }
  })

  const wallet2_5 = await db.wallet.create({
    data: {
      id: 'wallet-2-5',
      name: 'محفظة الطوارئ',
      description: 'للاستخدام في حالات الطوارئ',
      balance: 100000,
      currency: 'SAR',
      type: 'savings',
      icon: 'shield',
      color: 'danger',
      isActive: true,
      tenantId: tenant2.id
    }
  })
  console.log('Created 5 wallets for Tenant 2 (Merchant Plan)')

  // ========================================
  // Create Categories for both tenants
  // ========================================
  
  // Categories for Tenant 1
  const incomeCategories1 = [
    { id: 'tenant1-cat-inc-1', name: 'مبيعات الملابس', description: 'مبيعات متجر الملابس', type: 'income', icon: '👕', color: 'emerald' },
    { id: 'tenant1-cat-inc-2', name: 'خصومات وعروض', description: 'عروض خاصة', type: 'income', icon: '🎁', color: 'emerald' },
    { id: 'tenant1-cat-inc-3', name: 'استرجاع بضائع', description: 'استرجاع بضائع من الموردين', type: 'income', icon: '↩️', color: 'emerald' },
    { id: 'tenant1-cat-inc-4', name: 'آخر', description: 'دخل آخر', type: 'income', icon: '📝', color: 'emerald' }
  ]

  for (const category of incomeCategories1) {
    await db.category.create({
      data: {
        ...category,
        tenantId: tenant1.id,
        isActive: true
      }
    })
  }

  const expenseCategories1 = [
    { id: 'tenant1-cat-exp-1', name: 'شراء بضائع', description: 'شراء بضائع من الموردين', type: 'expense', icon: '🛒', color: 'red' },
    { id: 'tenant1-cat-exp-2', name: 'رواتب الموظفين', description: 'رواتب شهرية', type: 'expense', icon: '💰', color: 'red' },
    { id: 'tenant1-cat-exp-3', name: 'إيجار المحل', description: 'إيجار شهري', type: 'expense', icon: '🏢', color: 'red' },
    { id: 'tenant1-cat-exp-4', name: 'فواتير الكهرباء والماء', description: 'فواتير شهرية', type: 'expense', icon: '💡', color: 'red' },
    { id: 'tenant1-cat-exp-5', name: 'تسويق وإعلانات', description: 'حملات تسويقية', type: 'expense', icon: '📢', color: 'red' },
    { id: 'tenant1-cat-exp-6', name: 'شحن وتوصيل', description: 'تكاليف الشحن', type: 'expense', icon: '🚚', color: 'red' },
    { id: 'tenant1-cat-exp-7', name: 'آخر', description: 'مصروفات أخرى', type: 'expense', icon: '📝', color: 'red' }
  ]

  for (const category of expenseCategories1) {
    await db.category.create({
      data: {
        ...category,
        tenantId: tenant1.id,
        isActive: true
      }
    })
  }
  console.log('Created categories for Tenant 1')

  // Categories for Tenant 2
  const incomeCategories2 = [
    { id: 'tenant2-cat-inc-1', name: 'مقاولات مشاريع', description: 'عقود المقاولات', type: 'income', icon: '🏗️', color: 'emerald' },
    { id: 'tenant2-cat-inc-2', name: 'توريد مواد', description: 'توريد مواد بناء', type: 'income', icon: '🧱', color: 'emerald' },
    { id: 'tenant2-cat-inc-3', name: 'استشارات هندسية', description: 'خدمات استشارات', type: 'income', icon: '📐', color: 'emerald' },
    { id: 'tenant2-cat-inc-4', name: 'صيانة وترميم', description: 'أعمال الصيانة', type: 'income', icon: '🔧', color: 'emerald' },
    { id: 'tenant2-cat-inc-5', name: 'آخر', description: 'دخل آخر', type: 'income', icon: '📝', color: 'emerald' }
  ]

  for (const category of incomeCategories2) {
    await db.category.create({
      data: {
        ...category,
        tenantId: tenant2.id,
        isActive: true
      }
    })
  }

  const expenseCategories2 = [
    { id: 'tenant2-cat-exp-1', name: 'شراء مواد بناء', description: 'إسمنت، حديد، إلخ', type: 'expense', icon: '🧱', color: 'red' },
    { id: 'tenant2-cat-exp-2', name: 'رواتب المهندسين والعمال', description: 'رواتب شهرية', type: 'expense', icon: '👷', color: 'red' },
    { id: 'tenant2-cat-exp-3', name: 'معدات وآلات', description: 'شراء وكراء معدات', type: 'expense', icon: '🏗️', color: 'red' },
    { id: 'tenant2-cat-exp-4', name: 'وقود ومحروقات', description: 'وقود الشاحنات والمعدات', type: 'expense', icon: '⛽', color: 'red' },
    { id: 'tenant2-cat-exp-5', name: 'تراخيص ورسوم حكومية', description: 'رسوم التراخيص', type: 'expense', icon: '📋', color: 'red' },
    { id: 'tenant2-cat-exp-6', name: 'تأمينات', description: 'تأمينات مختلفة', type: 'expense', icon: '🛡️', color: 'red' },
    { id: 'tenant2-cat-exp-7', name: 'آخر', description: 'مصروفات أخرى', type: 'expense', icon: '📝', color: 'red' }
  ]

  for (const category of expenseCategories2) {
    await db.category.create({
      data: {
        ...category,
        tenantId: tenant2.id,
        isActive: true
      }
    })
  }
  console.log('Created categories for Tenant 2')

  // ========================================
  // Create Sample Transactions
  // ========================================
  
  // Transactions for Tenant 1
  const transactions1 = [
    {
      id: 'trans-1-1',
      title: 'مبيعات يومية - الملابس الرجالية',
      description: 'مبيعات اليوم من الملابس الرجالية',
      amount: 2500,
      type: 'expense',
      date: new Date('2024-01-15'),
      tenantId: tenant1.id,
      walletId: wallet1_1.id,
      categoryId: 'tenant1-cat-inc-1',
      createdById: user1_4.id,
      status: 'completed'
    },
    {
      id: 'trans-1-2',
      title: 'شراء بضائع من المورد',
      description: 'توريد ملابس موسمية',
      amount: 3000,
      type: 'expense',
      date: new Date('2024-01-16'),
      tenantId: tenant1.id,
      walletId: wallet1_1.id,
      categoryId: 'tenant1-cat-exp-1',
      createdById: user1_2.id,
      status: 'completed'
    },
    {
      id: 'trans-1-3',
      title: 'راتب الموظفين',
      description: 'رواتب شهر يناير',
      amount: 5000,
      type: 'expense',
      date: new Date('2024-01-30'),
      tenantId: tenant1.id,
      walletId: wallet1_1.id,
      categoryId: 'tenant1-cat-exp-2',
      createdById: user1_2.id,
      status: 'completed'
    },
    {
      id: 'trans-1-4',
      title: 'إيجار المحل',
      description: 'إيجار شهر يناير',
      amount: 4000,
      type: 'expense',
      date: new Date('2024-01-01'),
      tenantId: tenant1.id,
      walletId: wallet1_1.id,
      categoryId: 'tenant1-cat-exp-3',
      createdById: user1_1.id,
      status: 'completed'
    }
  ]

  for (const trans of transactions1) {
    await db.transaction.create({ data: trans })
  }
  console.log('Created transactions for Tenant 1')

  // Transactions for Tenant 2
  const transactions2 = [
    {
      id: 'trans-2-1',
      title: 'عقد مشروع بناء فيضان',
      description: 'عقد بناء فيلا',
      amount: 150000,
      type: 'income',
      date: new Date('2024-01-10'),
      tenantId: tenant2.id,
      walletId: wallet2_1.id,
      categoryId: 'tenant2-cat-inc-1',
      createdById: user2_2.id,
      status: 'completed'
    },
    {
      id: 'trans-2-2',
      title: 'شراء مواد بناء',
      description: 'إسمنت وحديد للمشروع',
      amount: 50000,
      type: 'expense',
      date: new Date('2024-01-12'),
      tenantId: tenant2.id,
      walletId: wallet2_1.id,
      categoryId: 'tenant2-cat-exp-1',
      createdById: user2_3.id,
      status: 'completed'
    },
    {
      id: 'trans-2-3',
      title: 'رواتب المشروع',
      description: 'رواتب العمال والمهندسين',
      amount: 30000,
      type: 'expense',
      date: new Date('2024-01-25'),
      tenantId: tenant2.id,
      walletId: wallet2_4.id,
      categoryId: 'tenant2-cat-exp-2',
      createdById: user2_2.id,
      status: 'completed'
    },
    {
      id: 'trans-2-4',
      title: 'كراء معدات',
      description: 'كراء رافعة ومضخة خرسانة',
      amount: 8000,
      type: 'expense',
      date: new Date('2024-01-15'),
      tenantId: tenant2.id,
      walletId: wallet2_3.id,
      categoryId: 'tenant2-cat-exp-3',
      createdById: user2_3.id,
      status: 'completed'
    },
    {
      id: 'trans-2-5',
      title: 'عقد مشروع صيانة',
      description: 'صيانة مدرسة حكومية',
      amount: 25000,
      type: 'income',
      date: new Date('2024-01-20'),
      tenantId: tenant2.id,
      walletId: wallet2_1.id,
      categoryId: 'tenant2-cat-inc-4',
      createdById: user2_1.id,
      status: 'completed'
    }
  ]

  for (const trans of transactions2) {
    await db.transaction.create({ data: trans })
  }
  console.log('Created transactions for Tenant 2')

  console.log('✅ Multi-Tenant SaaS database seeding completed successfully!')
  console.log('\n=== Summary ===')
  console.log(`Tenants: 2 (1 Free Plan, 1 Merchant Plan)`)
  console.log(`Companies: 3 (1 for Tenant 1, 2 for Tenant 2)`)
  console.log(`Branches: 5 (2 for Tenant 1, 3 for Tenant 2)`)
  console.log(`Users: 9 (4 for Tenant 1, 5 for Tenant 2)`)
  console.log(`Partners: 3 (1 for Tenant 1, 2 for Tenant 2)`)
  console.log(`Wallets: 7 (2 for Tenant 1 - Free Plan limit, 5 for Tenant 2)`)
  console.log(`Categories: 22 (11 for each tenant)`)
  console.log(`Transactions: 9 (4 for Tenant 1, 5 for Tenant 2)`)
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await db.$disconnect()
    process.exit(1)
  })
