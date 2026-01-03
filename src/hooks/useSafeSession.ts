'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * Safe session hook that doesn't throw error on admin routes
 * Returns a mock session for admin routes to prevent NextAuth errors
 * 
 * Note: This hook should only be used in components that are wrapped
 * with the conditional SessionProvider in Header component
 */
export function useSafeSession() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Always call useSession to follow Rules of Hooks
  const session = useSession();
  
  // For admin routes, return unauthenticated status regardless of session
  // This prevents admin users from being treated as regular users
  if (isAdminRoute) {
    return { data: null, status: 'unauthenticated' as const };
  }
  
  return session;
}