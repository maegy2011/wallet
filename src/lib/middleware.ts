import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Track usage for authenticated users
  if (token && token.tenantId) {
    // Only track specific routes to avoid too many calls
    const trackedPaths = ['/dashboard', '/projects', '/analytics']
    const isTrackedPath = trackedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )

    if (isTrackedPath) {
      // Record page view asynchronously
      fetch(`${request.nextUrl.origin}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          metric: 'page_views',
          value: 1,
          date: new Date().toISOString(),
        }),
      }).catch(console.error) // Ignore errors to not affect user experience
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
}