// API Routes for Notifications
// مسارات API للإشعارات

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth/jwt'
import {
  getUserNotifications,
  markAsRead,
  markAsDismissed,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotification,
  sendDeveloperNotification
} from '@/lib/notifications/notification-service'

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    // Verify token
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    const tenantId = payload.tenantId
    
    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const includeDismissed = searchParams.get('includeDismissed') !== 'false'
    
    // Fetch notifications
    const result = await getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
      type: type as any,
      category: category as any,
      includeDismissed
    })
    
    return NextResponse.json({
      notifications: result.notifications,
      unreadCount: result.unreadCount,
      hasMore: result.hasMore,
      pagination: {
        limit,
        offset,
        total: result.notifications.length
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الإشعارات' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH_READ(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    
    const notification = await markAsRead(params.id, userId)
    
    return NextResponse.json({
      message: 'تم تعليم الإشعار كمقروء',
      notification
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'فشل في تعليم الإشعار كمقروء' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications/[id]/dismiss - Mark notification as dismissed
export async function PATCH_DISMISS(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    
    const notification = await markAsDismissed(params.id, userId)
    
    return NextResponse.json({
      message: 'تم استبعاد الإشعار',
      notification
    })
  } catch (error) {
    console.error('Error dismissing notification:', error)
    return NextResponse.json(
      { error: 'فشل في استبعاد الإشعار' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/preferences - Update notification preferences
export async function POST_PREFERENCES(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    const body = await request.json()
    
    const preferences = await updateNotificationPreferences(userId, body)
    
    return NextResponse.json({
      message: 'تم تحديث تفضيلات الإشعارات بنجاح',
      preferences
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث تفضيلات الإشعارات' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/send - Create notification
export async function POST_SEND(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Check if user is tenant owner (can send notifications)
    if (payload.role !== 'TENANT_OWNER' && payload.role !== 'COMPANY_MANAGER') {
      return NextResponse.json(
        { error: 'غير مصرح بإرسال الإشعارات' },
        { status: 403 }
      )
    }
    
    const userId = payload.sub
    const tenantId = payload.tenantId
    const body = await request.json()
    
    const notification = await createNotification({
      type: body.type,
      category: body.category,
      priority: body.priority,
      title: body.title,
      message: body.message,
      link: body.link,
      thumbnail: body.thumbnail,
      data: body.data,
      channels: body.channels,
      actionType: body.actionType,
      actionId: body.actionId,
      actionLabel: body.actionLabel,
      actionUrl: body.actionUrl,
      tenantId,
      userId: body.targetUserId, // If targeting specific user
      subscriptionId: body.subscriptionId,
      invoiceId: body.invoiceId,
      paymentId: body.paymentId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined
    })
    
    return NextResponse.json({
      message: 'تم إرسال الإشعار بنجاح',
      notification
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'فشل في إرسال الإشعار' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/developer - Send developer/admin notifications
export async function POST_DEVELOPER(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Check if user is tenant owner (can send developer notifications)
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح بإرسال إشعارات المطور' },
        { status: 403 }
      )
    }
    
    const tenantId = payload.tenantId
    const body = await request.json()
    
    const result = await sendDeveloperNotification({
      title: body.title,
      message: body.message,
      type: body.type,
      priority: body.priority,
      tenantId,
      link: body.link,
      actionUrl: body.actionUrl
    })
    
    return NextResponse.json({
      message: 'تم إرسال إشعار المطور بنجاح',
      sentTo: result.sentTo,
      success: result.success
    })
  } catch (error) {
    console.error('Error sending developer notification:', error)
    return NextResponse.json(
      { error: 'فشل في إرسال إشعار المطور' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    
    // Delete notification
    await db.notification.delete({
      where: {
        id: params.id,
        userId: userId
      }
    })
    
    return NextResponse.json({
      message: 'تم حذف الإشعار بنجاح'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الإشعار' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/read-all - Mark all notifications as read
export async function DELETE_READ_ALL(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    
    // Mark all notifications as read
    const result = await db.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
        isDismissed: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
    
    return NextResponse.json({
      message: `تم تعليم ${result.count} إشعار كمقروء`,
      count: result.count
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'فشل في تعليم جميع الإشعارات كمقروء' },
      { status: 500 }
    )
  }
}

// GET /api/notifications/preferences - Get notification preferences
export async function GET_PREFERENCES(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const userId = payload.sub
    
    const preferences = await getNotificationPreferences(userId)
    
    return NextResponse.json({
      preferences
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'فشل في جلب تفضيلات الإشعارات' },
      { status: 500 }
    )
  }
}
