// Notification System Helper Functions
// وظائف مساعدة لنظام الإشعارات

import { db } from '@/lib/db'
import {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  NotificationQueue,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationCategory,
  NotificationChannel,
  User,
  Tenant,
  Invoice,
  Payment,
  Subscription
} from '@prisma/client'

// نوع البيانات للإشعار
export interface NotificationData {
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  link?: string
  thumbnail?: string
  data?: string // JSON string
  
  // Channels
  channels?: NotificationChannel[]
  
  // Actionable
  actionType?: string
  actionId?: string
  actionLabel?: string
  actionUrl?: string
  
  // Expiration
  expiresAt?: Date
  
  // Related Entities
  tenantId: string
  userId?: string
  subscriptionId?: string
  invoiceId?: string
  paymentId?: string
  
  // Offline Sync
  isOffline?: boolean
  syncedAt?: Date
  syncedDeviceId?: string
}

// إنشاء إشعار جديد
export async function createNotification(data: NotificationData) {
  try {
    // الحصول على تفضيلات المستخدم
    const preferences = data.userId
      ? await getNotificationPreferences(data.userId)
      : null
    
    // التحقق من قنوات الإشعار المفعلة
    const inAppEnabled = preferences?.inAppNotifications ?? true
    const emailEnabled = preferences?.emailNotifications ?? true
    const pushEnabled = preferences?.pushNotifications ?? true
    
    // التحقق من فئات الإشعار المفعلة
    const categoryEnabled = data.category === NotificationCategory.INVOICES
      ? preferences?.invoicesEnabled ?? true
      : data.category === NotificationCategory.PAYMENTS
      ? preferences?.paymentsEnabled ?? true
      : data.category === NotificationCategory.SUBSCRIPTIONS
      ? preferences?.subscriptionsEnabled ?? true
      : data.category === NotificationCategory.TRANSACTIONS
      ? preferences?.transactionsEnabled ?? true
      : data.category === NotificationCategory.REPORTS
      ? preferences?.reportsEnabled ?? true
      : data.category === NotificationCategory.SYSTEM
      ? preferences?.systemEnabled ?? true
      : true
    
    if (!categoryEnabled) {
      console.log(`Notification category ${data.category} is disabled for user ${data.userId}`)
      return null
    }
    
    // التحقق من الفترة الصامتة (Quiet Hours)
    if (preferences?.quietHoursEnabled) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const quietStart = parseTime(preferences.quietHoursStart || '22:00')
      const quietEnd = parseTime(preferences.quietHoursEnd || '08:00')
      
      // إذا كان الوقت في الفترة الصامتة، لا ترسل إشعارات عالية الأهمية
      if (currentTime >= quietStart || currentTime < quietEnd) {
        if (data.priority !== NotificationPriority.URGENT) {
          console.log(`Quiet hours enabled, skipping notification with priority ${data.priority}`)
          return null
        }
      }
    }
    
    // إنشاء الإشعار
    const notification = await db.notification.create({
      data: {
        type: data.type,
        category: data.category,
        priority: data.priority,
        title: data.title,
        message: data.message,
        link: data.link,
        thumbnail: data.thumbnail,
        data: data.data,
        channels: data.channels?.join(',') || 'IN_APP',
        
        // Channels Sent Status
        sentViaInApp: inAppEnabled,
        sentViaEmail: emailEnabled,
        sentViaPush: pushEnabled,
        sentViaSMS: false,
        
        // Read/Dismiss Status
        isRead: false,
        isDismissed: false,
        expiresAt: data.expiresAt,
        
        // Actionable
        actionType: data.actionType,
        actionId: data.actionId,
        actionLabel: data.actionLabel,
        actionUrl: data.actionUrl,
        
        // Tenant & User
        tenantId: data.tenantId,
        userId: data.userId,
        
        // Related Entities
        subscriptionId: data.subscriptionId,
        invoiceId: data.invoiceId,
        paymentId: data.paymentId,
        
        // Offline Sync
        isOffline: data.isOffline ?? false,
        syncedAt: data.syncedAt,
        syncedDeviceId: data.syncedDeviceId
      }
    })
    
    // إرسال الإشعار عبر القنوات المفعلة
    if (inAppEnabled) {
      // إشعار داخل التطبيق - تم إنشاؤه تلقائياً
      console.log('In-app notification created:', notification.id)
    }
    
    if (emailEnabled) {
      // إرسال إيميل (placeholder)
      await sendEmail({
        to: await getUserEmail(data.userId),
        subject: data.title,
        body: data.message,
        notificationId: notification.id
      }).catch(error => {
        console.error('Failed to send email notification:', error)
      })
    }
    
    if (pushEnabled) {
      // إرسال push notification (placeholder)
      await sendPushNotification({
        title: data.title,
        body: data.message,
        userId: data.userId,
        notificationId: notification.id
      }).catch(error => {
        console.error('Failed to send push notification:', error)
      })
    }
    
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw new Error('فشل في إنشاء الإشعار')
  }
}

// إرسال إشعار بريد إلكتروني (placeholder)
export async function sendEmail(data: {
  to: string
  subject: string
  body: string
  notificationId?: string
}) {
  // TODO: تنفيذ إرسال الإيميل باستخدام مكتبة مثل Nodemailer أو Resend
  console.log('Sending email to:', data.to)
  console.log('Subject:', data.subject)
  console.log('Body:', data.body)
  
  // Placeholder return
  return { success: true }
}

// إرسال push notification (placeholder)
export async function sendPushNotification(data: {
  title: string
  body: string
  userId: string
  notificationId?: string
}) {
  // TODO: تنفيذ إرسال Push باستخدام مكتبة مثل web-push أو OneSignal
  console.log('Sending push notification to:', data.userId)
  console.log('Title:', data.title)
  console.log('Body:', data.body)
  
  // Placeholder return
  return { success: true }
}

// تعليم الإشعار كمقروء
export async function markAsRead(notificationId: string, userId: string) {
  try {
    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId: userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
    
    return notification
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw new Error('فشل في تعليم الإشعار كمقروء')
  }
}

// تعليم الإشعار كمستبعد
export async function markAsDismissed(notificationId: string, userId: string) {
  try {
    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId: userId
      },
      data: {
        isDismissed: true,
        dismissedAt: new Date()
      }
    })
    
    return notification
  } catch (error) {
    console.error('Error marking notification as dismissed:', error)
    throw new Error('فشل في تعليم الإشعار كمستبعد')
  }
}

// الحصول على إشعارات المستخدم
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    type?: NotificationType
    category?: NotificationCategory
    includeDismissed?: boolean
  } = {}
) {
  try {
    const where: any = {
      userId: userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
    
    // التصفية حسب حالة القراءة
    if (options.unreadOnly) {
      where.isRead = false
    }
    
    // التصفية حسب النوع
    if (options.type) {
      where.type = options.type
    }
    
    // التصفية حسب الفئة
    if (options.category) {
      where.category = options.category
    }
    
    // استبعاد الإشعارات المستبعدة
    if (!options.includeDismissed) {
      where.isDismissed = false
    }
    
    const notifications = await db.notification.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: options.limit || 20,
      skip: options.offset || 0
    })
    
    // الحصول على عدد الإشعارات غير المقروءة
    const unreadCount = await db.notification.count({
      where: {
        userId: userId,
        isRead: false,
        isDismissed: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })
    
    return {
      notifications,
      unreadCount,
      hasMore: notifications.length === (options.limit || 20)
    }
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw new Error('فشل في الحصول على إشعارات المستخدم')
  }
}

// إرسال إشعار للمطور
export async function sendDeveloperNotification(data: {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  tenantId: string
  link?: string
  actionUrl?: string
}) {
  try {
    // إرسال الإشعار لجميع المطورين في المستأجر
    const developers = await db.user.findMany({
      where: {
        tenantId: data.tenantId,
        role: 'TENANT_OWNER',
        isActive: true
      },
      select: {
        id: true
      }
    })
    
    // إنشاء إشعارات لكل مطور
    const notifications = await Promise.all(
      developers.map(dev => createNotification({
        type: data.type,
        category: NotificationCategory.SYSTEM,
        priority: data.priority || NotificationPriority.NORMAL,
        title: data.title,
        message: data.message,
        link: data.link,
        actionUrl: data.actionUrl,
        tenantId: data.tenantId,
        userId: dev.id,
        channels: ['IN_APP', 'EMAIL', 'PUSH'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // تنتهي بعد 7 أيام
      }))
    )
    
    return {
      success: true,
      sentTo: notifications.filter(n => n !== null).length
    }
  } catch (error) {
    console.error('Error sending developer notification:', error)
    throw new Error('فشل في إرسال إشعار للمطور')
  }
}

// الحصول على تفضيلات الإشعارات
export async function getNotificationPreferences(userId: string) {
  try {
    let preferences = await db.notificationPreference.findUnique({
      where: {
        userId: userId
      }
    })
    
    // إذا لم توجد تفضيلات، أنشئ واحدة افتراضية
    if (!preferences) {
      preferences = await db.notificationPreference.create({
        data: {
          userId: userId,
          tenantId: (await db.user.findUnique({
            where: { id: userId }
          }))?.tenantId || '',
          
          // Channel Preferences
          inAppNotifications: true,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          
          // Category Preferences
          generalEnabled: true,
          invoicesEnabled: true,
          paymentsEnabled: true,
          subscriptionsEnabled: true,
          transactionsEnabled: true,
          reportsEnabled: true,
          systemEnabled: true,
          securityEnabled: true,
          
          // Frequency Preferences
          emailFrequency: 'real-time',
          pushFrequency: 'real-time',
          
          // Quiet Hours
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          
          // Additional Settings
          soundEnabled: true,
          vibrationEnabled: true,
          desktopEnabled: true
        }
      })
    }
    
    return preferences
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    throw new Error('فشل في الحصول على تفضيلات الإشعارات')
  }
}

// تحديث تفضيلات الإشعارات
export async function updateNotificationPreferences(
  userId: string,
  data: Partial<NotificationPreference>
) {
  try {
    const preferences = await db.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        tenantId: (await db.user.findUnique({
          where: { id: userId }
        }))?.tenantId || '',
        ...data
      },
      update: {
        ...data,
        updatedAt: new Date()
      }
    })
    
    return preferences
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    throw new Error('فشل في تحديث تفضيلات الإشعارات')
  }
}

// جدولة إشعار مستقبلي
export async function scheduleNotification(data: {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  scheduledAt: Date
  tenantId: string
  userId?: string
  roleId?: string
  expiresAt?: Date
  actionType?: string
  actionId?: string
  actionLabel?: string
  actionUrl?: string
}) {
  try {
    const queuedNotification = await db.notificationQueue.create({
      data: {
        type: data.type,
        category: NotificationCategory.GENERAL,
        priority: data.priority || NotificationPriority.NORMAL,
        title: data.title,
        message: data.message,
        link: data.actionUrl,
        actionType: data.actionType,
        actionId: data.actionId,
        actionLabel: data.actionLabel,
        channels: 'IN_APP,EMAIL,PUSH',
        
        // Target Audience
        tenantId: data.tenantId,
        userId: data.userId, // null = all users
        roleId: data.roleId,
        
        // Schedule
        scheduledAt: data.scheduledAt,
        expiresAt: data.expiresAt || new Date(data.scheduledAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        
        // Status
        status: 'SCHEDULED',
        attempts: 0,
        maxAttempts: 3,
        lastError: null,
        
        // Processing
        processedBy: null,
        processedAt: null,
        processingTime: null,
        
        // Offline Sync
        isOffline: false,
        syncedAt: null,
        syncedDeviceId: null
      }
    })
    
    return queuedNotification
  } catch (error) {
    console.error('Error scheduling notification:', error)
    throw new Error('فشل في جدولة الإشعار')
  }
}

// الحصول على بريد إلكتروني المستخدم
async function getUserEmail(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })
  
  return user?.email || ''
}

// تحويل الوقت HH:MM إلى دقائق
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// إشعارات جاهزة للاستخدام

// إشعار الفاتورة الجديدة
export const INVOICE_CREATED_NOTIFICATION = (
  tenantId: string,
  userId: string,
  invoiceNumber: string,
  clientName: string,
  amount: number,
  currency: string
) => ({
  type: NotificationType.INVOICE_CREATED,
  category: NotificationCategory.INVOICES,
  priority: NotificationPriority.NORMAL,
  title: 'فاتورة جديدة',
  message: `فاتورة رقم ${invoiceNumber} للعميل ${clientName} بمبلغ ${amount.toLocaleString()} ${currency}`,
  actionType: 'view_invoice',
  actionLabel: 'عرض الفاتورة',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // تنتهي بعد 30 يوم
})

// إشعار الفاتورة المدفوعة
export const INVOICE_PAID_NOTIFICATION = (
  tenantId: string,
  userId: string,
  invoiceNumber: string,
  clientName: string,
  amount: number,
  currency: string
) => ({
  type: NotificationType.INVOICE_PAID,
  category: NotificationCategory.INVOICES,
  priority: NotificationPriority.HIGH,
  title: 'فاتورة مدفوعة',
  message: `تم دفع الفاتورة رقم ${invoiceNumber} للعميل ${clientName} بمبلغ ${amount.toLocaleString()} ${currency}`,
  actionType: 'view_invoice',
  actionLabel: 'عرض الفاتورة',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})

// إشعار الفاتورة المتأخرة
export const INVOICE_OVERDUE_NOTIFICATION = (
  tenantId: string,
  userId: string,
  invoiceNumber: string,
  clientName: string,
  amount: number,
  dueDate: Date
) => ({
  type: NotificationType.INVOICE_OVERDUE,
  category: NotificationCategory.INVOICES,
  priority: NotificationPriority.URGENT,
  title: 'فاتورة متأخرة',
  message: `فاتورة رقم ${invoiceNumber} للعميل ${clientName} متأخرة منذ ${dueDate.toLocaleDateString('ar-SA')}. المبلغ المستحق: ${amount.toLocaleString()}`,
  actionType: 'pay_invoice',
  actionLabel: 'دفع الفاتورة',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // تنتهي بعد 60 يوم
})

// إشعار استلام دفعة
export const PAYMENT_RECEIVED_NOTIFICATION = (
  tenantId: string,
  userId: string,
  paymentNumber: string,
  amount: number,
  currency: string,
  method: string
) => ({
  type: NotificationType.PAYMENT_RECEIVED,
  category: NotificationCategory.PAYMENTS,
  priority: NotificationPriority.HIGH,
  title: 'دفعة مستلمة',
  message: `تم استلام دفعة رقم ${paymentNumber} بمبلغ ${amount.toLocaleString()} ${currency} عبر ${method}`,
  actionType: 'view_payment',
  actionLabel: 'عرض الدفعة',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})

// إشعار فشل الدفعة
export const PAYMENT_FAILED_NOTIFICATION = (
  tenantId: string,
  userId: string,
  paymentNumber: string,
  amount: number,
  currency: string,
  reason: string
) => ({
  type: NotificationType.PAYMENT_FAILED,
  category: NotificationCategory.PAYMENTS,
  priority: NotificationPriority.URGENT,
  title: 'فشل الدفعة',
  message: `فشلت محاولة دفع الدفعة رقم ${paymentNumber} بمبلغ ${amount.toLocaleString()} ${currency}. السبب: ${reason}`,
  actionType: 'retry_payment',
  actionLabel: 'إعادة المحاولة',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // تنتهي بعد 7 أيام
})

// إشعار تجديد الاشتراك
export const SUBSCRIPTION_RENEWED_NOTIFICATION = (
  tenantId: string,
  userId: string,
  planName: string,
  price: number,
  currency: string,
  nextBillingDate: Date
) => ({
  type: NotificationType.SUBSCRIPTION_RENEWED,
  category: NotificationCategory.SUBSCRIPTIONS,
  priority: NotificationPriority.HIGH,
  title: 'تم تجديد الاشتراك',
  message: `تم تجديد اشتراك ${planName} بنجاح. القادم: ${price.toLocaleString()} ${currency}. تاريخ التجديد القادم: ${nextBillingDate.toLocaleDateString('ar-SA')}`,
  actionType: 'view_subscription',
  actionLabel: 'عرض الاشتراك',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})

// إشعار انتهاء الاشتراك
export const SUBSCRIPTION_EXPIRED_NOTIFICATION = (
  tenantId: string,
  userId: string,
  planName: string
  expiryDate: Date
) => ({
  type: NotificationType.SUBSCRIPTION_EXPIRED,
  category: NotificationCategory.SUBSCRIPTIONS,
  priority: NotificationPriority.URGENT,
  title: 'اشتراك منتهي',
  message: `اشتراك ${planName} انتهى في ${expiryDate.toLocaleDateString('ar-SA')}. يرجى التجديد للاستمرار استخدام الخدمة`,
  actionType: 'renew_subscription',
  actionLabel: 'تجديد الاشتراك',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})

// إشعار نهاية الفترة التجريبية
export const SUBSCRIPTION_TRIAL_ENDING_NOTIFICATION = (
  tenantId: string,
  userId: string,
  planName: string,
  trialEndDate: Date
) => ({
  type: NotificationType.SUBSCRIPTION_TRIAL_ENDING,
  category: NotificationCategory.SUBSCRIPTIONS,
  priority: NotificationPriority.NORMAL,
  title: 'نهاية الفترة التجريبية',
  message: `الفترة التجريبية لاشتراك ${planName} تنتهي قريباً في ${trialEndDate.toLocaleDateString('ar-SA')}. يرجى ترقية الاشتراك`,
  actionType: 'upgrade_subscription',
  actionLabel: 'ترقية الاشتراك',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // تنتهي بعد 14 يوم
})

// إشعار تحديث النظام
export const SYSTEM_UPDATE_NOTIFICATION = (
  tenantId: string,
  updateTitle: string,
  updateDescription: string
) => ({
  type: NotificationType.SYSTEM_UPDATE,
  category: NotificationCategory.SYSTEM,
  priority: NotificationPriority.NORMAL,
  title: 'تحديث نظام جديد',
  message: `تحديث جديد: ${updateTitle}. ${updateDescription}`,
  actionType: 'view_updates',
  actionLabel: 'عرض التحديثات',
  tenantId,
  channels: ['IN_APP', 'EMAIL'],
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})

// إشعار صيانة النظام
export const SYSTEM_MAINTENANCE_NOTIFICATION = (
  tenantId: string,
  maintenanceTitle: string,
  maintenanceStartTime: Date,
  maintenanceEndTime: Date
) => ({
  type: NotificationType.SYSTEM_MAINTENANCE,
  category: NotificationCategory.SYSTEM,
  priority: NotificationPriority.URGENT,
  title: 'صيانة النظام',
  message: `سيتم إجراء صيانة النظام من ${maintenanceStartTime.toLocaleTimeString('ar-SA')} إلى ${maintenanceEndTime.toLocaleTimeString('ar-SA')}`,
  actionType: null,
  tenantId,
  channels: ['IN_APP', 'EMAIL', 'PUSH'],
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // تنتهي بعد ساعتين
})

// إشعار الترحيب
export const WELCOME_NOTIFICATION = (
  tenantId: string,
  userId: string,
  userName: string
) => ({
  type: NotificationType.WELCOME,
  category: NotificationCategory.GENERAL,
  priority: NotificationPriority.NORMAL,
  title: 'مرحباً بك في نظامنا',
  message: `مرحباً ${userName}! نحن سعداء بانضمامك إلى نظامنا. نتمنى لك تجربة رائعة`,
  actionType: 'view_dashboard',
  actionLabel: 'لوحة التحكم',
  tenantId,
  userId,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})

export default {
  createNotification,
  sendEmail,
  sendPushNotification,
  markAsRead,
  markAsDismissed,
  getUserNotifications,
  sendDeveloperNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  scheduleNotification,
  
  // إشعارات جاهزة
  INVOICE_CREATED_NOTIFICATION,
  INVOICE_PAID_NOTIFICATION,
  INVOICE_OVERDUE_NOTIFICATION,
  PAYMENT_RECEIVED_NOTIFICATION,
  PAYMENT_FAILED_NOTIFICATION,
  SUBSCRIPTION_RENEWED_NOTIFICATION,
  SUBSCRIPTION_EXPIRED_NOTIFICATION,
  SUBSCRIPTION_TRIAL_ENDING_NOTIFICATION,
  SYSTEM_UPDATE_NOTIFICATION,
  SYSTEM_MAINTENANCE_NOTIFICATION,
  WELCOME_NOTIFICATION
}
