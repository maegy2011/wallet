// Financial Reports Helper Functions
// وظائف مساعدة للتقارير المالية

import { db } from '@/lib/db'
import { 
  Invoice, 
  Payment, 
  Wallet, 
  Transaction,
  Subscription,
  Tenant 
} from '@prisma/client'

// نوع البيانات للقرير
export interface FinancialReportData {
  // الفواتير
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  cancelledInvoices: number
  
  // المدفوعات
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  refundedPayments: number
  
  // الإيرادات
  totalRevenue: number
  paidInvoicesAmount: number
  pendingInvoicesAmount: number
  
  // المصروفات
  totalExpenses: number
  
  // الأرباح
  netProfit: number
  grossProfit: number
  
  // تدفقات نقدية
  cashInflow: number
  cashOutflow: number
  netCashFlow: number
  
  // المقاييس
  averageInvoiceAmount: number
  averagePaymentAmount: number
  collectionRate: number
  profitMargin: number
  
  // تواريخ
  startDate: Date
  endDate: Date
}

// إنشاء تقرير مالي
export async function createFinancialReport(tenantId: string, startDate: Date, endDate: Date): Promise<FinancialReportData> {
  try {
    // الفواتير
    const invoices = await db.invoice.findMany({
      where: {
        tenantId,
        issueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        status: true,
        total: true,
        amountPaid: true,
        balance: true,
        issueDate: true,
        dueDate: true,
        currency: true
      }
    })

    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length
    const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING').length
    const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE').length
    const cancelledInvoices = invoices.filter(inv => inv.status === 'CANCELLED').length

    // المدفوعات
    const payments = await db.payment.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        createdAt: true
      }
    })

    const totalPayments = payments.length
    const successfulPayments = payments.filter(pay => pay.status === 'COMPLETED').length
    const failedPayments = payments.filter(pay => pay.status === 'FAILED').length
    const refundedPayments = payments.filter(pay => pay.status === 'REFUNDED').length

    // المعاملات
    const transactions = await db.transaction.findMany({
      where: {
        tenantId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        date: true
      }
    })

    const incomeTransactions = transactions.filter(tx => tx.type === 'income')
    const expenseTransactions = transactions.filter(tx => tx.type === 'expense')

    // الحسابات المالية
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0) +
                           incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const successfulPaymentsAmount = successfulPayments.reduce((sum, pay) => sum + pay.amount, 0)
    
    const netProfit = totalRevenue - totalExpenses
    const grossProfit = totalRevenue - (totalExpenses * 0.8) // تقدير 20% هامش تشغيلي
    
    const cashInflow = totalRevenue
    const cashOutflow = totalExpenses + (refundedPayments.reduce((sum, pay) => sum + pay.refundAmount, 0) || 0)
    const netCashFlow = cashInflow - cashOutflow

    // المقاييس
    const averageInvoiceAmount = totalInvoices > 0 
      ? invoices.reduce((sum, inv) => sum + inv.total, 0) / totalInvoices 
      : 0
    
    const averagePaymentAmount = successfulPayments > 0 
      ? payments.filter(pay => pay.status === 'COMPLETED').reduce((sum, pay) => sum + pay.amount, 0) / successfulPayments 
      : 0
    
    const pendingInvoicesAmount = invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + inv.balance, 0)
    
    const collectionRate = totalInvoices > 0 
      ? (paidInvoices / totalInvoices) * 100 
      : 0
    
    const profitMargin = totalRevenue > 0 
      ? ((netProfit / totalRevenue) * 100) 
      : 0

    return {
      // الفواتير
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      cancelledInvoices,
      
      // المدفوعات
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      
      // الإيرادات
      totalRevenue,
      paidInvoicesAmount: paidInvoices > 0 
        ? invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amountPaid, 0) 
        : 0,
      pendingInvoicesAmount,
      
      // المصروفات
      totalExpenses,
      
      // الأرباح
      netProfit,
      grossProfit,
      
      // تدفقات نقدية
      cashInflow,
      cashOutflow,
      netCashFlow,
      
      // المقاييس
      averageInvoiceAmount,
      averagePaymentAmount,
      collectionRate,
      profitMargin,
      
      // تواريخ
      startDate,
      endDate
    }
  } catch (error) {
    console.error('Error creating financial report:', error)
    throw new Error('فشل في إنشاء التقرير المالي')
  }
}

// تقارير الفواتير
export async function generateInvoiceReport(tenantId: string, startDate: Date, endDate: Date) {
  try {
    const invoices = await db.invoice.findMany({
      where: {
        tenantId,
        issueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: true,
        payments: true,
        tenant: {
          select: {
            name: true,
            email: true,
            businessName: true
          }
        },
        company: {
          select: {
            name: true,
            taxId: true
          }
        },
        branch: {
          select: {
            name: true,
            address: true
          }
        },
        category: {
          select: {
            name: true,
            type: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        issueDate: 'desc'
      }
    })

    // الحسابات الإجمالية
    const totalInvoices = invoices.length
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const totalBalance = invoices.reduce((sum, inv) => sum + inv.balance, 0)

    // تقسيم حسب الحالة
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID')
    const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING')
    const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE')
    const cancelledInvoices = invoices.filter(inv => inv.status === 'CANCELLED')
    const draftInvoices = invoices.filter(inv => inv.status === 'DRAFT')

    return {
      totalInvoices,
      totalAmount,
      totalPaid,
      totalBalance,
      status: {
        paid: paidInvoices.length,
        paidAmount: paidInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
        pending: pendingInvoices.length,
        pendingAmount: pendingInvoices.reduce((sum, inv) => sum + inv.total, 0),
        overdue: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.total, 0),
        cancelled: cancelledInvoices.length,
        cancelledAmount: cancelledInvoices.reduce((sum, inv) => sum + inv.total, 0),
        draft: draftInvoices.length
      },
      invoices,
      summary: {
        averageInvoiceAmount: totalInvoices > 0 ? totalAmount / totalInvoices : 0,
        averagePaidAmount: paidInvoices.length > 0 ? totalPaid / paidInvoices.length : 0,
        collectionRate: totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0,
        overdueRate: totalInvoices > 0 ? (overdueInvoices.length / totalInvoices) * 100 : 0
      },
      period: {
        startDate,
        endDate
      }
    }
  } catch (error) {
    console.error('Error generating invoice report:', error)
    throw new Error('فشل في إنشاء تقرير الفواتير')
  }
}

// تقارير المدفوعات
export async function generatePaymentReport(tenantId: string, startDate: Date, endDate: Date) {
  try {
    const payments = await db.payment.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            clientName: true,
            total: true,
            status: true,
            currency: true
          }
        },
        tenant: {
          select: {
            name: true,
            email: true
          }
        },
        company: {
          select: {
            name: true
          }
        },
        branch: {
          select: {
            name: true
          }
        },
        wallet: {
          select: {
            name: true,
            currency: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // الحسابات الإجمالية
    const totalPayments = payments.length
    const totalAmount = payments.reduce((sum, pay) => sum + pay.amount, 0)
    
    // تقسيم حسب الحالة
    const successfulPayments = payments.filter(pay => pay.status === 'COMPLETED')
    const pendingPayments = payments.filter(pay => pay.status === 'PENDING')
    const failedPayments = payments.filter(pay => pay.status === 'FAILED')
    const refundedPayments = payments.filter(pay => pay.status === 'REFUNDED')

    // تقسيم حسب طريقة الدفع
    const paymentsByMethod = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1
      acc[`${payment.paymentMethod}_amount`] = (acc[`${payment.paymentMethod}_amount`] || 0) + payment.amount
      return acc
    }, {} as Record<string, number>)

    return {
      totalPayments,
      totalAmount,
      status: {
        successful: successfulPayments.length,
        successfulAmount: successfulPayments.reduce((sum, pay) => sum + pay.amount, 0),
        pending: pendingPayments.length,
        pendingAmount: pendingPayments.reduce((sum, pay) => sum + pay.amount, 0),
        failed: failedPayments.length,
        failedAmount: failedPayments.reduce((sum, pay) => sum + pay.amount, 0),
        refunded: refundedPayments.length,
        refundedAmount: refundedPayments.reduce((sum, pay) => sum + pay.refundAmount, 0)
      },
      byMethod: paymentsByMethod,
      averagePaymentAmount: totalPayments > 0 ? totalAmount / totalPayments : 0,
      successRate: totalPayments > 0 ? (successfulPayments.length / totalPayments) * 100 : 0,
      payments,
      period: {
        startDate,
        endDate
      }
    }
  } catch (error) {
    console.error('Error generating payment report:', error)
    throw new Error('فشل في إنشاء تقرير المدفوعات')
  }
}

// تقارير الإيرادات
export async function generateRevenueReport(tenantId: string, startDate: Date, endDate: Date) {
  try {
    // الفواتير المدفوعة
    const invoices = await db.invoice.findMany({
      where: {
        tenantId,
        status: 'PAID',
        paidDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        total: true,
        amountPaid: true,
        paidDate: true,
        currency: true,
        clientId: true,
        clientName: true,
        tenantId: true
      },
      orderBy: {
        paidDate: 'desc'
      }
    })

    // معاملات الدخل
    const transactions = await db.transaction.findMany({
      where: {
        tenantId,
        type: 'income',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        amount: true,
        date: true,
        currency: true,
        categoryId: true,
        tenantId: true
      },
      include: {
        category: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // الحسابات
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0) +
                         transactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    const invoiceRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const transactionRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    // الإيرادات حسب التاريخ
    const revenueByDate = [...new Set([
      ...invoices.map(inv => inv.paidDate?.toISOString().split('T')[0]),
      ...transactions.map(tx => tx.date.toISOString().split('T')[0])
    ])].sort().map(date => {
      const dateInvoices = invoices.filter(inv => 
        inv.paidDate?.toISOString().split('T')[0] === date
      )
      const dateTransactions = transactions.filter(tx => 
        tx.date.toISOString().split('T')[0] === date
      )
      
      return {
        date,
        amount: dateInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0) +
                 dateTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        invoices: dateInvoices.length,
        transactions: dateTransactions.length
      }
    })

    // الإيرادات حسب العميل
    const revenueByClient = invoices.reduce((acc, inv) => {
      const key = inv.clientId || 'unknown'
      if (!acc[key]) {
        acc[key] = {
          clientId: inv.clientId,
          clientName: inv.clientName || 'غير معروف',
          totalRevenue: 0,
          invoiceCount: 0
        }
      }
      acc[key].totalRevenue += inv.amountPaid
      acc[key].invoiceCount += 1
      return acc
    }, {} as Record<string, any>)

    // الإيرادات حسب الفئة
    const revenueByCategory = transactions.reduce((acc, tx) => {
      const key = tx.categoryId || 'uncategorized'
      const categoryName = tx.category?.name || 'غير مصنف'
      
      if (!acc[key]) {
        acc[key] = {
          categoryId: tx.categoryId,
          categoryName,
          totalRevenue: 0,
          transactionCount: 0
        }
      }
      acc[key].totalRevenue += tx.amount
      acc[key].transactionCount += 1
      return acc
    }, {} as Record<string, any>)

    return {
      totalRevenue,
      invoiceRevenue,
      transactionRevenue,
      averageRevenuePerInvoice: invoices.length > 0 ? invoiceRevenue / invoices.length : 0,
      averageRevenuePerTransaction: transactions.length > 0 ? transactionRevenue / transactions.length : 0,
      revenueByDate: revenueByDate.sort((a, b) => b.date.localeCompare(a.date)),
      revenueByClient: Object.values(revenueByClient).sort((a, b) => b.totalRevenue - a.totalRevenue),
      revenueByCategory: Object.values(revenueByCategory).sort((a, b) => b.totalRevenue - a.totalRevenue),
      invoices,
      transactions,
      period: {
        startDate,
        endDate
      }
    }
  } catch (error) {
    console.error('Error generating revenue report:', error)
    throw new Error('فشل في إنشاء تقرير الإيرادات')
  }
}

// تقارير المصروفات
export async function generateExpenseReport(tenantId: string, startDate: Date, endDate: Date) {
  try {
    const transactions = await db.transaction.findMany({
      where: {
        tenantId,
        type: 'expense',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        date: true,
        currency: true,
        categoryId: true,
        walletId: true,
        tenantId: true
      },
      include: {
        category: {
          select: {
            name: true,
            type: true
          }
        },
        wallet: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // الحسابات
    const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    // المصروفات حسب الفئة
    const expensesByCategory = transactions.reduce((acc, tx) => {
      const key = tx.categoryId || 'uncategorized'
      const categoryName = tx.category?.name || 'غير مصنف'
      
      if (!acc[key]) {
        acc[key] = {
          categoryId: tx.categoryId,
          categoryName,
          totalAmount: 0,
          transactionCount: 0,
          percentage: 0
        }
      }
      acc[key].totalAmount += tx.amount
      acc[key].transactionCount += 1
      return acc
    }, {} as Record<string, any>)

    // حساب النسب المئوية
    Object.values(expensesByCategory).forEach(cat => {
      cat.percentage = totalExpenses > 0 ? (cat.totalAmount / totalExpenses) * 100 : 0
    })

    // المصروفات حسب التاريخ
    const expensesByDate = [...new Set(
      transactions.map(tx => tx.date.toISOString().split('T')[0])
    )].sort().map(date => {
      const dateTransactions = transactions.filter(tx => 
        tx.date.toISOString().split('T')[0] === date
      )
      
      return {
        date,
        amount: dateTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        count: dateTransactions.length
      }
    })

    // المصروفات حسب المحفظة
    const expensesByWallet = transactions.reduce((acc, tx) => {
      const key = tx.walletId || 'unknown'
      const walletName = tx.wallet?.name || 'غير معروف'
      
      if (!acc[key]) {
        acc[key] = {
          walletId: tx.walletId,
          walletName,
          totalAmount: 0,
          transactionCount: 0
        }
      }
      acc[key].totalAmount += tx.amount
      acc[key].transactionCount += 1
      return acc
    }, {} as Record<string, any>)

    return {
      totalExpenses,
      averageExpenseAmount: transactions.length > 0 ? totalExpenses / transactions.length : 0,
      expensesByCategory: Object.values(expensesByCategory).sort((a, b) => b.totalAmount - a.totalAmount),
      expensesByDate: expensesByDate.sort((a, b) => b.date.localeCompare(a.date)),
      expensesByWallet: Object.values(expensesByWallet).sort((a, b) => b.totalAmount - a.totalAmount),
      topExpenseCategories: Object.values(expensesByCategory)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10),
      transactions,
      period: {
        startDate,
        endDate
      }
    }
  } catch (error) {
    console.error('Error generating expense report:', error)
    throw new Error('فشل في إنشاء تقرير المصروفات')
  }
}

// تقارير الأرباح والخسائر
export async function generateProfitLossReport(tenantId: string, startDate: Date, endDate: Date) {
  try {
    // الإيرادات
    const revenueReport = await generateRevenueReport(tenantId, startDate, endDate)
    const expenseReport = await generateExpenseReport(tenantId, startDate, endDate)
    
    const totalRevenue = revenueReport.totalRevenue
    const totalExpenses = expenseReport.totalExpenses
    const netProfit = totalRevenue - totalExpenses
    
    // تقدير الربح الإجمالي (Gross Profit)
    const grossProfit = totalRevenue - (totalExpenses * 0.8) // 20% تكاليف تشغيلية
    
    // هامش الربح
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
    const grossProfitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0
    
    // تحليل الاتجاه
    const revenueTrend = revenueReport.revenueByDate.map((day, index) => ({
      date: day.date,
      amount: day.amount,
      growth: index > 0 ? ((day.amount - revenueReport.revenueByDate[index - 1].amount) / revenueReport.revenueByDate[index - 1].amount) * 100 : 0
    }))
    
    const expenseTrend = expenseReport.expensesByDate.map((day, index) => ({
      date: day.date,
      amount: day.amount,
      growth: index > 0 ? ((day.amount - expenseReport.expensesByDate[index - 1].amount) / expenseReport.expensesByDate[index - 1].amount) * 100 : 0
    }))
    
    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      grossProfitMargin,
      isProfitable: netProfit >= 0,
      profitLoss: Math.abs(netProfit),
      profitLossType: netProfit >= 0 ? 'profit' : 'loss',
      revenueTrend,
      expenseTrend,
      monthlyAverage: {
        revenue: totalRevenue / 12, // تقدير شهري
        expenses: totalExpenses / 12,
        netProfit: netProfit / 12
      },
      revenueDetails: revenueReport,
      expenseDetails: expenseReport,
      period: {
        startDate,
        endDate
      }
    }
  } catch (error) {
    console.error('Error generating profit loss report:', error)
    throw new Error('فشل في إنشاء تقرير الأرباح والخسائر')
  }
}

// تقارير تدفق السيولة النقدية
export async function generateCashFlowReport(tenantId: string, startDate: Date, endDate: Date) {
  try {
    // جميع المعاملات (دخل ومصروف)
    const transactions = await db.transaction.findMany({
      where: {
        tenantId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        type: true,
        title: true,
        amount: true,
        date: true,
        currency: true,
        status: true,
        categoryId: true
      },
      include: {
        category: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // المدفوعات
    const payments = await db.payment.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true,
        currency: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // حسابات التدفق النقدي
    const cashInflow = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0) +
                       payments.filter(pay => pay.status === 'COMPLETED').reduce((sum, pay) => sum + pay.amount, 0)
    
    const cashOutflow = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0) +
                       (payments.filter(pay => pay.status === 'REFUNDED').reduce((sum, pay) => sum + (pay.refundAmount || 0), 0) || 0)
    
    const netCashFlow = cashInflow - cashOutflow
    
    // تدفق نقدي حسب التاريخ
    const cashFlowByDate = [...new Set([
      ...transactions.map(tx => tx.date.toISOString().split('T')[0]),
      ...payments.map(pay => pay.createdAt.toISOString().split('T')[0])
    ])].sort().map(date => {
      const dateTransactions = transactions.filter(tx => 
        tx.date.toISOString().split('T')[0] === date
      )
      const datePayments = payments.filter(pay => 
        pay.createdAt.toISOString().split('T')[0] === date
      )
      
      const inflow = dateTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0) +
                     datePayments.filter(pay => pay.status === 'COMPLETED').reduce((sum, pay) => sum + pay.amount, 0)
      
      const outflow = dateTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0) +
                      (datePayments.filter(pay => pay.status === 'REFUNDED').reduce((sum, pay) => sum + (pay.refundAmount || 0), 0) || 0)
      
      return {
        date,
        inflow,
        outflow,
        netFlow: inflow - outflow,
        transactionCount: dateTransactions.length + datePayments.length
      }
    })

    // تدفق نقدي حسب الفئة
    const cashFlowByCategory = transactions.reduce((acc, tx) => {
      const key = tx.categoryId || 'uncategorized'
      const categoryName = tx.category?.name || 'غير مصنف'
      const type = tx.type === 'income' ? 'inflow' : 'outflow'
      
      if (!acc[key]) {
        acc[key] = {
          categoryId: tx.categoryId,
          categoryName,
          inflow: 0,
          outflow: 0,
          netFlow: 0
        }
      }
      acc[key][type] += tx.amount
      acc[key].netFlow = acc[key].inflow - acc[key].outflow
      return acc
    }, {} as Record<string, any>)

    // بدء ونهاية الفترة
    const openingBalance = 0 // يمكن حسابه من الأرشفة
    const closingBalance = openingBalance + netCashFlow

    return {
      openingBalance,
      cashInflow,
      cashOutflow,
      netCashFlow,
      closingBalance,
      cashFlowByDate: cashFlowByDate.sort((a, b) => b.date.localeCompare(a.date)),
      cashFlowByCategory: Object.values(cashFlowByCategory).sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow)),
      averageDailyFlow: netCashFlow / 30, // تقدير يومي للشهر
      averageMonthlyFlow: netCashFlow,
      liquidityRatio: cashOutflow > 0 ? cashInflow / cashOutflow : 0,
      transactions,
      payments,
      period: {
        startDate,
        endDate
      }
    }
  } catch (error) {
    console.error('Error generating cash flow report:', error)
    throw new Error('فشل في إنشاء تقرير تدفق السيولة النقدية')
  }
}

// تقارير العملاء
export async function generateCustomerBalanceReport(tenantId: string) {
  try {
    const invoices = await db.invoice.findMany({
      where: {
        tenantId,
        status: {
          in: ['PENDING', 'OVERDUE']
        }
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        clientAddress: true,
        total: true,
        amountPaid: true,
        balance: true,
        dueDate: true,
        issueDate: true,
        currency: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0)
    const totalOverdue = invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.balance, 0)

    // تقسيم العملاء حسب المستحق
    const customersByStatus = invoices.reduce((acc, inv) => {
      const key = inv.clientId || 'unknown'
      
      if (!acc[key]) {
        acc[key] = {
          clientId: inv.clientId,
          clientName: inv.clientName || 'غير معروف',
          clientEmail: inv.clientEmail,
          clientPhone: inv.clientPhone,
          clientAddress: inv.clientAddress,
          totalBalance: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          overdueAmount: 0,
          status: 'good'
        }
      }
      
      acc[key].totalBalance += inv.balance
      if (inv.status === 'PENDING') {
        acc[key].pendingInvoices += 1
      } else if (inv.status === 'OVERDUE') {
        acc[key].overdueInvoices += 1
        acc[key].overdueAmount += inv.balance
        acc[key].status = 'overdue'
      }
      
      return acc
    }, {} as Record<string, any>)

    // تحديد الحالة النهائية
    Object.values(customersByStatus).forEach(customer => {
      if (customer.overdueInvoices > 0) {
        customer.status = 'overdue'
      } else if (customer.totalBalance > 0) {
        customer.status = 'pending'
      } else {
        customer.status = 'cleared'
      }
    })

    return {
      totalOutstanding,
      totalOverdue,
      totalCustomers: Object.keys(customersByStatus).length,
      totalInvoices: invoices.length,
      customersByStatus: Object.values(customersByStatus).sort((a, b) => b.totalBalance - a.totalBalance),
      topDebtors: Object.values(customersByStatus)
        .sort((a, b) => b.totalBalance - a.totalBalance)
        .slice(0, 20),
      overdueCustomers: Object.values(customersByStatus)
        .filter(c => c.status === 'overdue'),
      pendingCustomers: Object.values(customersByStatus)
        .filter(c => c.status === 'pending'),
      invoices
    }
  } catch (error) {
    console.error('Error generating customer balance report:', error)
    throw new Error('فشل في إنشاء تقرير أرصدة العملاء')
  }
}

// تقارير مؤشرات الاشتراك
export async function generateSubscriptionMetricsReport(tenantId: string) {
  try {
    const subscriptions = await db.subscription.findMany({
      where: {
        tenantId,
        isActive: true
      },
      select: {
        id: true,
        planType: true,
        planName: true,
        price: true,
        status: true,
        startDate: true,
        endDate: true,
        nextBillingDate: true,
        autoRenew: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const totalSubscriptions = subscriptions.length
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE').length
    const monthlyRecurringRevenue = subscriptions
      .filter(sub => sub.status === 'ACTIVE' && sub.cycle === 'MONTHLY')
      .reduce((sum, sub) => sum + sub.totalPrice, 0)
    
    const quarterlyRecurringRevenue = subscriptions
      .filter(sub => sub.status === 'ACTIVE' && sub.cycle === 'QUARTERLY')
      .reduce((sum, sub) => sum + (sub.totalPrice / 3), 0)
    
    const yearlyRecurringRevenue = subscriptions
      .filter(sub => sub.status === 'ACTIVE' && sub.cycle === 'YEARLY')
      .reduce((sum, sub) => sum + (sub.totalPrice / 12), 0)
    
    const totalRecurringRevenue = monthlyRecurringRevenue + quarterlyRecurringRevenue + yearlyRecurringRevenue
    
    // تقسيم حسب الخطة
    const subscriptionsByPlan = subscriptions.reduce((acc, sub) => {
      const key = sub.planType
      
      if (!acc[key]) {
        acc[key] = {
          planType: sub.planType,
          count: 0,
          revenue: 0,
          plans: []
        }
      }
      
      acc[key].count += 1
      acc[key].revenue += sub.totalPrice
      acc[key].plans.push({
        id: sub.id,
        planName: sub.planName,
        price: sub.totalPrice,
        startDate: sub.startDate,
        endDate: sub.endDate
      })
      
      return acc
    }, {} as Record<string, any>)

    // الاشتراكات المنتهية
    const today = new Date()
    const expiringSoonSubscriptions = subscriptions.filter(sub => 
      sub.endDate && new Date(sub.endDate.getTime() - 7 * 24 * 60 * 60 * 1000) <= today && sub.endDate > today
    )
    
    const expiredSubscriptions = subscriptions.filter(sub => 
      sub.endDate && sub.endDate < today
    )

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalRecurringRevenue,
      averageRevenuePerSubscription: activeSubscriptions > 0 ? totalRecurringRevenue / activeSubscriptions : 0,
      revenueBreakdown: {
        monthly: monthlyRecurringRevenue,
        quarterly: quarterlyRecurringRevenue,
        yearly: yearlyRecurringRevenue
      },
      subscriptionsByPlan: Object.values(subscriptionsByPlan).sort((a, b) => b.revenue - a.revenue),
      expiringSoonSubscriptions,
      expiredSubscriptions,
      autoRenewEnabled: subscriptions.filter(sub => sub.autoRenew).length,
      autoRenewDisabled: subscriptions.filter(sub => !sub.autoRenew).length,
      subscriptions
    }
  } catch (error) {
    console.error('Error generating subscription metrics report:', error)
    throw new Error('فشل في إنشاء تقرير مؤشرات الاشتراك')
  }
}
