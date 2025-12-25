import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
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
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        arrayBuffers: Math.round(process.memoryUsage().arrayBuffers / 1024 / 1024)
      }
    }
    
    // Calculate memory usage percentage
    const heapUsed = systemInfo.memory.heapUsed
    const heapTotal = systemInfo.memory.heapTotal
    const memoryUsagePercentage = heapTotal > 0 ? ((heapUsed / heapTotal) * 100).toFixed(1) : '0'
    const memoryUsageStatus = parseFloat(memoryUsagePercentage) < 80 ? 'normal' : parseFloat(memoryUsagePercentage) < 90 ? 'warning' : 'critical'
    
    // Overall health status
    const overallStatus = dbStatus === 'healthy' && responseTime < 1000 ? 'ok' : dbStatus === 'healthy' ? 'degraded' : 'error'
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
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
        uptimeFormatted: formatUptime(Math.round(process.uptime())),
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
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days} يوم، ${hours} ساعة، ${minutes} دقيقة`
  } else if (hours > 0) {
    return `${hours} ساعة، ${minutes} دقيقة`
  } else {
    return `${minutes} دقيقة`
  }
}
