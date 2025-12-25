// Export Helper Functions
// وظائف مساعدة لتصدير البيانات (PDF, Excel, CSV)

import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { tmpdir } from 'os'

// نوع البيانات المصدرة
export interface ExportData {
  // الفواتير
  invoices?: any[]
  
  // المدفوعات
  payments?: any[]
  
  // المعاملات
  transactions?: any[]
  
  // تقارير مالية
  financialReport?: any
  
  // تحليلات مالية
  financialAnalysis?: any
}

// إعدادات التصدير
export interface ExportOptions {
  // نوع التصدير
  format: 'PDF' | 'EXCEL' | 'CSV'
  
  // اسم الملف
  fileName?: string
  
  // حقول التصدير
  fields?: string[]
  
  // معلومات العنوان
  title?: string
  subtitle?: string
  
  // حقول إضافية
  additionalFields?: Record<string, string>
  
  // هل يضمن العناوين
  includeHeaders?: boolean
  
  // تنسيق الخلايا
  dateFormat?: string
  
  // تنسيق الأرقام
  numberFormat?: string
}

// تصدير البيانات إلى CSV
export async function exportToCSV(
  data: any[], 
  options: ExportOptions
): Promise<string> {
  try {
    const fields = options.fields || Object.keys(data[0] || {})
    const fileName = options.fileName || `export-${Date.now()}.csv`
    
    // إنشاء رأس CSV
    let csvContent = ''
    
    if (options.includeHeaders !== false) {
      csvContent += fields.join(',') + '\n'
    }
    
    // إضافة البيانات
    data.forEach(item => {
      const values = fields.map(field => {
        const value = item[field]
        
        // تنسيق التواريخ
        if (value instanceof Date) {
          return value.toISOString()
        }
        
        // تنسيق الأرقام
        if (typeof value === 'number') {
          return value.toString()
        }
        
        // إضافة علامات تنصيص للنصوص
        const stringValue = String(value || '')
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        
        return stringValue
      })
      
      csvContent += values.join(',') + '\n'
    })
    
    // حفظ الملف
    const exportDir = join(tmpdir(), 'exports')
    await mkdir(exportDir, { recursive: true })
    const filePath = join(exportDir, fileName)
    
    await writeFile(filePath, csvContent, 'utf-8')
    
    console.log(`CSV file saved to: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    throw new Error('فشل في تصدير البيانات إلى CSV')
  }
}

// تصدير البيانات إلى Excel
export async function exportToExcel(
  data: any[], 
  options: ExportOptions
): Promise<string> {
  try {
    const fields = options.fields || Object.keys(data[0] || {})
    const fileName = options.fileName || `export-${Date.now()}.xlsx`
    
    // إنشاء ورقة العمل
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: options.includeHeaders !== false ? fields : undefined,
      skipHeader: options.includeHeaders === false
    })
    
    // إنشاء المصنف
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    
    // حفظ الملف
    const exportDir = join(tmpdir(), 'exports')
    await mkdir(exportDir, { recursive: true })
    const filePath = join(exportDir, fileName)
    
    XLSX.writeFile(workbook, filePath)
    
    console.log(`Excel file saved to: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw new Error('فشل في تصدير البيانات إلى Excel')
  }
}

// تصدير البيانات إلى PDF
export async function exportToPDF(
  data: any[], 
  options: ExportOptions
): Promise<string> {
  try {
    const fileName = options.fileName || `export-${Date.now()}.pdf`
    
    // إنشاء مستند PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // إضافة العنوان
    if (options.title) {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(options.title, pageWidth / 2, 20, { align: 'center' })
    }
    
    // إضافة العنوان الفرعي
    if (options.subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(options.subtitle, pageWidth / 2, 30, { align: 'center' })
    }
    
    // إعداد البيانات للجدول
    const fields = options.fields || Object.keys(data[0] || {})
    const tableData = data.map(item => 
      fields.map(field => item[field] || '')
    )
    
    // تحديد الأعمدة
    const columnStyles = {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      // إضافة المزيد حسب الحاجة
    }
    
    // إنشاء الجدول
    autoTable(doc, {
      head: options.includeHeaders !== false ? [fields] : [],
      body: tableData,
      startY: 50,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: columnStyles,
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })
    
    // حفظ الملف
    const exportDir = join(tmpdir(), 'exports')
    await mkdir(exportDir, { recursive: true })
    const filePath = join(exportDir, fileName)
    
    const buffer = Buffer.from(doc.output('arraybuffer'))
    await writeFile(filePath, buffer)
    
    console.log(`PDF file saved to: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('فشل في تصدير البيانات إلى PDF')
  }
}

// تصدير تقرير مالي إلى PDF
export async function exportFinancialReportToPDF(
  data: any, 
  options: ExportOptions
): Promise<string> {
  try {
    const fileName = options.fileName || `financial-report-${Date.now()}.pdf`
    
    // إنشاء مستند PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    
    // إضافة العنوان
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('التقرير المالي', pageWidth / 2, margin, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`من: ${data.startDate.toLocaleDateString('ar-SA')} إلى: ${data.endDate.toLocaleDateString('ar-SA')}`, pageWidth / 2, margin + 10, { align: 'center' })
    
    doc.line(margin, margin + 20, pageWidth - margin * 2, margin + 20)
    
    // إضافة ملخص الإيرادات
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ملخص الإيرادات:', margin, margin + 30)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const revenueY = margin + 45
    doc.text(`الإجمالي: ${data.totalRevenue.toLocaleString()}`, margin, revenueY)
    doc.text(`المتوسط: ${data.averageRevenue.toLocaleString()}`, margin + 100, revenueY)
    
    revenueY += 10
    doc.text(`عدد الفواتير المدفوعة: ${data.paidInvoices}`, margin, revenueY)
    doc.text(`مجموع المدفوعات: ${data.paidInvoicesAmount.toLocaleString()}`, margin + 100, revenueY)
    
    // إضافة ملخص المصروفات
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const expenseY = revenueY + 20
    doc.text('ملخص المصروفات:', margin, expenseY)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`الإجمالي: ${data.totalExpenses.toLocaleString()}`, margin, expenseY + 15)
    doc.text(`المتوسط: ${data.averageExpenses.toLocaleString()}`, margin + 100, expenseY + 15)
    
    // إضافة ملخص الأرباح
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const profitY = expenseY + 35
    doc.text('ملخص الأرباح:', margin, profitY)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`صافي الربح: ${data.netProfit.toLocaleString()}`, margin, profitY + 15)
    doc.text(`هامش الربح: ${data.profitMargin}%`, margin + 100, profitY + 15)
    
    doc.text(`إجمالي الربح: ${data.grossProfit.toLocaleString()}`, margin, profitY + 30)
    
    // إضافة ملخص السيولة
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const cashFlowY = profitY + 45
    doc.text('تدفق السيولة:', margin, cashFlowY)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`التدفق الداخل: ${data.cashInflow.toLocaleString()}`, margin, cashFlowY + 15)
    doc.text(`التدفق الخارج: ${data.cashOutflow.toLocaleString()}`, margin + 100, cashFlowY + 15)
    doc.text(`صافي التدفق: ${data.netCashFlow.toLocaleString()}`, margin, cashFlowY + 30)
    
    // حفظ الملف
    const exportDir = join(tmpdir(), 'exports')
    await mkdir(exportDir, { recursive: true })
    const filePath = join(exportDir, fileName)
    
    const buffer = Buffer.from(doc.output('arraybuffer'))
    await writeFile(filePath, buffer)
    
    console.log(`Financial report PDF saved to: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error('Error exporting financial report to PDF:', error)
    throw new Error('فشل في تصدير التقرير المالي إلى PDF')
  }
}

// تصدير فواتير إلى PDF
export async function exportInvoicesToPDF(
  invoices: any[], 
  options: ExportOptions
): Promise<string> {
  try {
    const fileName = options.fileName || `invoices-${Date.now()}.pdf`
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    
    // إضافة العنوان
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(options.title || 'تقرير الفواتير', pageWidth / 2, margin, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`الفترة: ${options.subtitle || 'كل الفواتير'}`, pageWidth / 2, margin + 10, { align: 'center' })
    
    doc.line(margin, margin + 20, pageWidth - margin * 2, margin + 20)
    
    // إعداد البيانات
    const tableData = invoices.map(inv => {
      return [
        inv.invoiceNumber,
        inv.issueDate.toLocaleDateString('ar-SA'),
        inv.clientName,
        inv.total.toLocaleString(),
        inv.amountPaid.toLocaleString(),
        inv.balance.toLocaleString(),
        inv.status
      ]
    })
    
    autoTable(doc, {
      head: [['رقم الفاتورة', 'تاريخ الإصدار', 'العميل', 'المبلغ', 'المدفوع', 'الرصيد', 'الحالة']],
      body: tableData,
      startY: margin + 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 25 },
        6: { cellWidth: 25 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })
    
    // حفظ الملف
    const exportDir = join(tmpdir(), 'exports')
    await mkdir(exportDir, { recursive: true })
    const filePath = join(exportDir, fileName)
    
    const buffer = Buffer.from(doc.output('arraybuffer'))
    await writeFile(filePath, buffer)
    
    console.log(`Invoices PDF saved to: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error('Error exporting invoices to PDF:', error)
    throw new Error('فشل في تصدير الفواتير إلى PDF')
  }
}

// تصدير مدفوعات إلى Excel
export async function exportPaymentsToExcel(
  payments: any[], 
  options: ExportOptions
): Promise<string> {
  try {
    const fileName = options.fileName || `payments-${Date.now()}.xlsx`
    
    // إعداد البيانات للتصدير
    const exportData = payments.map(payment => ({
      'رقم الدفعة': payment.paymentNumber,
      'المبلغ': payment.amount,
      'العملة': payment.currency,
      'طريقة الدفع': payment.paymentMethod,
      'الحالة': payment.status,
      'تاريخ الدفعة': payment.processedAt ? new Date(payment.processedAt).toLocaleDateString('ar-SA') : '',
      'اسم الدافع': payment.payerName || '-',
      'رقم الفاتورة': payment.invoice?.invoiceNumber || '-'
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المدفوعات')
    
    // حفظ الملف
    const exportDir = join(tmpdir(), 'exports')
    await mkdir(exportDir, { recursive: true })
    const filePath = join(exportDir, fileName)
    
    XLSX.writeFile(workbook, filePath)
    
    console.log(`Payments Excel file saved to: ${filePath}`)
    
    return filePath
  } catch (error) {
    console.error('Error exporting payments to Excel:', error)
    throw new Error('فشل في تصدير المدفوعات إلى Excel')
  }
}

export default {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportFinancialReportToPDF,
  exportInvoicesToPDF,
  exportPaymentsToExcel
}
