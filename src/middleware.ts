import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for basic protection
export function middleware(request: NextRequest) {
  // For now, allow all requests
  // In production, you would check for authentication here
  // and protect admin routes
  
  // Example protection (commented out for now):
  // if (request.nextUrl.pathname.startsWith('/admin')) {
  //   const token = request.cookies.get('auth-token')?.value
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/auth/login', request.url))
  //   }
  // }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}