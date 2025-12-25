import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
]

const devPaths = [
  '/api/dev',
  '/dev'
]

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url)
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication required', requiresAuth: true }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token', requiresAuth: true }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('expired', 'true')
    return NextResponse.redirect(loginUrl)
  }

  if (devPaths.some(path => pathname.startsWith(path))) {
    if (payload.role !== 'TENANT_OWNER') {
      return NextResponse.json({ error: 'Developer access only', requiresDevRole: true }, { status: 403 })
    }
  }

  const response = NextResponse.next()
  response.headers.set('x-user-id', payload.userId)
  response.headers.set('x-user-email', payload.email)
  response.headers.set('x-user-role', payload.role)
  
  if (payload.tenantId) {
    response.headers.set('x-tenant-id', payload.tenantId)
  }
  
  if (payload.companyId) {
    response.headers.set('x-company-id', payload.companyId)
  }
  
  if (payload.branchId) {
    response.headers.set('x-branch-id', payload.branchId)
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
