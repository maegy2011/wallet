import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول', requiresAuth: true },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح. يرجى تسجيل الدخول مرة أخرى.', requiresAuth: true },
        { status: 401 }
      )
    }

    // Verify TENANT_OWNER role
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json(
        { error: 'غير مصرح - هذه الصفحة متاحة فقط لملك المستأجر', requiresDevRole: true },
        { status: 403 }
      )
    }

    const startTime = Date.now()
    
    // Database health check with more details
    let dbStatus = 'healthy'
    let dbError = null
    let dbConnectionTime = 0
    let dbConnectionDetails = null
    
    const dbStartTime = Date.now()
    try {
      // Test database connection with a simple query
      const tenantCount = await db.tenant.count()
      const companyCount = await db.company.count()
      
      dbConnectionTime = Date.now() - dbStartTime
      
      dbConnectionDetails = {
        tenantCount,
        companyCount,
        queryExecuted: true
      }
      
      dbStatus = 'healthy'
    } catch (error) {
      dbConnectionTime = Date.now() - dbStartTime
      dbStatus = 'unhealthy'
      dbError = error instanceof Error ? error.message : 'Unknown error'
      dbConnectionDetails = {
        queryExecuted: false,
        error: dbError
      }
    }
    
    const responseTime = Date.now() - startTime
    
    // System information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        arrayBuffers: Math.round(process.memoryUsage().arrayBuffers / 1024 / 1024),
        usagePercentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 1000) / 10 + '%',
        usageStatus: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) < 80 ? 'normal' : Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) < 90 ? 'warning' : 'critical'
      }
    }
    
    // Calculate memory usage percentage
    const heapUsed = systemInfo.memory.heapUsed
    const heapTotal = systemInfo.memory.heapTotal
    const memoryUsagePercentage = ((heapUsed / heapTotal) * 100).toFixed(1)
    const memoryUsageStatus = parseFloat(memoryUsagePercentage) < 80 ? 'normal' : parseFloat(memoryUsagePercentage) < 90 ? 'warning' : 'critical'
    
    // Overall health status
    const overallStatus = dbStatus === 'healthy' && responseTime < 1000 ? 'ok' : dbStatus === 'healthy' ? 'degraded' : 'error'
    
    // Format uptime
    const formatUptime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24))
      const hours = Math.floor((seconds % (3600 * 24)) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (days > 0) {
        return \`\${days} يوم، \${hours} ساعة، \${minutes} دقيقة\`
      } else if (hours > 0) {
        return \`\${hours} ساعة، \${minutes} دقيقة\`
      } else {
        return \`\${minutes} دقيقة\`
      }
    }
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      uptimeFormatted: formatUptime(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      responseTime,
      dbConnectionTime,
      healthChecks: {
        database: {
          status: dbStatus,
          connectionTime: dbConnectionTime,
          details: dbConnectionDetails,
          error: dbError
        }
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: Math.round(process.uptime()),
        uptimeFormatted: formatUptime(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          arrayBuffers: Math.round(process.memoryUsage().arrayBuffers / 1024 / 1024),
          usagePercentage: memoryUsagePercentage,
          usageStatus: memoryUsageStatus
        },
        cpu: {
          load: process.cpuUsage ? (process.cpuUsage().user / process.cpuUsage().system).toFixed(2) : 'N/A',
          cores: process.cpus ? process.cpus().length : 'N/A'
        }
      },
      performance: {
        responseTime,
        dbConnectionTime,
        status: responseTime < 100 ? 'excellent' : responseTime < 300 ? 'good' : responseTime < 500 ? 'fair' : 'poor'
      },
      authenticatedUser: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        error: 'Health check failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
