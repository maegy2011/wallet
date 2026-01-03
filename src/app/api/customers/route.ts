import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminMiddleware, withAdminAuth } from '@/lib/admin-middleware';
import { ErrorLogger, ValidationError, ConflictError, NotFoundError } from '@/lib/errors';
import { CustomerType, CustomerStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/customers
 * List all customers with pagination and filtering
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as CustomerStatus | null;
    const type = searchParams.get('type') as CustomerType | null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { uuid: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.customerType = type;
    }

    // Get customers with pagination
    const [customers, totalCount] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          subscriptions: {
            include: {
              package: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          invoices: {
            select: {
              status: true,
              total: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              subscriptions: true,
              invoices: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    // Calculate additional metrics for each customer
    const customersWithMetrics = customers.map(customer => {
      const paidInvoices = customer.invoices.filter(inv => inv.status === 'PAID');
      const pendingInvoices = customer.invoices.filter(inv => inv.status === 'PENDING');
      const overdueInvoices = customer.invoices.filter(inv => inv.status === 'OVERDUE');
      
      const totalSpent = paidInvoices.reduce((sum, inv) => Number(inv.total), 0);
      const totalPending = pendingInvoices.reduce((sum, inv) => Number(inv.total), 0);
      const totalOverdue = overdueInvoices.reduce((sum, inv) => Number(inv.total), 0);

      const currentSubscription = customer.subscriptions[0];
      
      return {
        ...customer,
        metrics: {
          totalSpent,
          totalPending,
          totalOverdue,
          paidInvoicesCount: paidInvoices.length,
          pendingInvoicesCount: pendingInvoices.length,
          overdueInvoicesCount: overdueInvoices.length,
          currentSubscription: currentSubscription ? {
            id: currentSubscription.id,
            uuid: currentSubscription.uuid,
            packageName: currentSubscription.package.name,
            packageType: currentSubscription.package.type,
            status: currentSubscription.status,
            startDate: currentSubscription.startDate,
            endDate: currentSubscription.endDate,
            autoRenew: currentSubscription.autoRenew,
          } : null,
        },
      };
    });

    // Log access
    await AdminMiddleware.logAction(
      admin.id,
      'READ',
      'CUSTOMER',
      undefined,
      undefined,
      undefined,
      AdminMiddleware.getClientInfo(request)
    );

    return NextResponse.json({
      success: true,
      data: {
        customers: customersWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to get customers'), {
      adminId: admin.id,
      endpoint: '/api/customers',
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve customers',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json();
    const {
      name,
      businessName,
      customerType,
      email,
      mobile,
      address,
      province,
      city,
      street,
      currency = 'EGP',
      defaultPackageId,
    } = body;

    // Validation
    if (!name || !email || !mobile) {
      throw new ValidationError('Name, email, and mobile are required');
    }

    // Check if email already exists
    const existingEmail = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    // Check if mobile already exists
    const existingMobile = await db.customer.findUnique({
      where: { mobile },
    });

    if (existingMobile) {
      throw new ConflictError('Mobile number already exists');
    }

    // Get default package if specified
    let defaultPackage = null;
    if (defaultPackageId) {
      defaultPackage = await db.package.findUnique({
        where: { id: defaultPackageId },
      });

      if (!defaultPackage) {
        throw new ValidationError('Default package not found');
      }
    } else {
      // Get free package as default
      defaultPackage = await db.package.findFirst({
        where: { type: 'FREE', status: 'ACTIVE' },
      });
    }

    // Generate customer UUID
    const customerUuid = `CUS-${uuidv4().toUpperCase().substring(0, 8)}`;

    // Create customer
    const customer = await db.customer.create({
      data: {
        uuid: customerUuid,
        name: name.trim(),
        businessName: businessName?.trim(),
        customerType: customerType || 'INDIVIDUAL',
        email: email.toLowerCase(),
        mobile,
        address,
        province,
        city,
        street,
        currency,
        status: 'ACTIVE',
      },
    });

    // Create trial subscription if default package is provided
    if (defaultPackage) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + (defaultPackage.freeTrialDuration || 7));

      await db.subscription.create({
        data: {
          uuid: `SUB-${uuidv4().toUpperCase().substring(0, 8)}`,
          customerId: customer.id,
          packageId: defaultPackage.id,
          startDate: new Date(),
          endDate: trialEndDate,
          status: 'TRIAL',
          autoRenew: defaultPackage.type === 'PAID',
        },
      });
    }

    // Get created customer with relations
    const createdCustomer = await db.customer.findUnique({
      where: { id: customer.id },
      include: {
        subscriptions: {
          include: {
            package: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Log creation
    await AdminMiddleware.logAction(
      admin.id,
      'CREATE',
      'CUSTOMER',
      customer.id,
      undefined,
      { customer: createdCustomer },
      AdminMiddleware.getClientInfo(request)
    );

    ErrorLogger.info('Customer created successfully', {
      adminId: admin.id,
      customerId: customer.id,
      customerEmail: customer.email,
    });

    return NextResponse.json({
      success: true,
      data: createdCustomer,
      message: 'Customer created successfully',
    });

  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to create customer'), {
      adminId: admin.id,
      endpoint: '/api/customers',
      requestBody: body,
    });

    if (error instanceof ValidationError || 
        error instanceof ConflictError || 
        error instanceof NotFoundError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 
                error instanceof ConflictError ? 'CONFLICT_ERROR' : 
                'NOT_FOUND_ERROR',
          message: error.message,
        },
      }, { status: error instanceof ValidationError ? 400 : 409 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create customer',
      },
    }, { status: 500 });
  }
});