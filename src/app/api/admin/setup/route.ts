import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/setup
 * Initial setup to create super admin (remove in production)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if any admin exists
    const existingAdmin = await db.admin.findFirst();
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin already exists',
      });
    }

    // Create Super Admin
    const superAdminPassword = 'Admin@2025!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    
    const superAdmin = await db.admin.create({
      data: {
        email: 'mohamed.adel@lab.com',
        name: 'Mohamed Adel',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    // Create Free Package
    const freePackage = await db.package.create({
      data: {
        uuid: 'PKG-FREE-001',
        name: 'Mahfza Free',
        description: 'Perfect for getting started with basic features',
        type: 'FREE',
        price: 0,
        duration: 30,
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

    // Create Pro Package
    const proPackage = await db.package.create({
      data: {
        uuid: 'PKG-PRO-001',
        name: 'Mahfza Pro',
        description: 'Advanced features for professionals and growth',
        type: 'PAID',
        price: 60,
        duration: 30,
        currency: 'EGP',
        taxIncluded: true,
        taxType: 'VAT',
        taxRate: 0.14,
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

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          email: superAdmin.email,
          role: superAdmin.role,
        },
        password: superAdminPassword,
        packages: [
          { name: freePackage.name, type: freePackage.type },
          { name: proPackage.name, type: proPackage.type },
        ],
      },
      message: 'Setup completed successfully',
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Setup failed',
    }, { status: 500 });
  }
}