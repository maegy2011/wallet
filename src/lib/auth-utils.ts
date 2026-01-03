'use client';

import { signOut } from 'next-auth/react';

/**
 * Authentication utilities for handling admin and user signout
 */

export interface SignOutOptions {
  callbackUrl?: string;
  redirectTo?: string;
}

/**
 * Admin signout function
 * Clears admin token and performs logout API call
 * Returns a promise that resolves when logout is complete
 */
export async function signOutAdmin(): Promise<void> {
  try {
    // Call admin logout API to log the activity
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Admin logout API call failed:', error);
    // Continue with local cleanup even if API fails
  }
  
  // Clear local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
  }
}

/**
 * Admin signout function with redirect (for use in components)
 * This should be called from React components where useRouter is available
 */
export async function signOutAdminWithRedirect(redirectTo: string = '/admin'): Promise<void> {
  await signOutAdmin();
  
  // Use window.location for redirect to avoid hook issues
  if (typeof window !== 'undefined') {
    window.location.href = '/signout';
  }
}

/**
 * User signout function using NextAuth
 * Signs out the user and redirects to specified URL
 */
export function signOutUser(options: SignOutOptions = {}) {
  const { callbackUrl = '/signin' } = options;
  
  // Use NextAuth signOut
  signOut({ 
    callbackUrl,
    // Clear all session data
    redirect: true 
  });
}

/**
 * Unified signout function that handles both admin and user signout
 * Automatically detects the current user type and signs them out appropriately
 * This function performs the signout without redirecting - use for signout page
 */
export async function signOutCurrentUser(options: SignOutOptions = {}) {
  const { redirectTo = '/admin', callbackUrl = '/signin' } = options;
  
  // Check if user is admin (has admin token)
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminToken');
  
  if (isAdmin) {
    await signOutAdmin();
  } else {
    // For users, we need to use NextAuth but without redirecting
    // This is tricky because NextAuth's signOut always redirects
    // We'll use a different approach for the signout page
    return new Promise<void>((resolve) => {
      // Call NextAuth signOut but we'll handle the redirect manually
      signOut({ 
        callbackUrl: '/signout-completed', // Temporary redirect target
        redirect: false // Don't redirect automatically
      }).then(() => {
        resolve();
      }).catch(() => {
        resolve();
      });
    });
  }
}

/**
 * Signout function for components that includes redirect
 * Use this for logout buttons in components
 */
export async function signOutCurrentUserWithRedirect(options: SignOutOptions = {}) {
  const { redirectTo = '/admin', callbackUrl = '/signin' } = options;
  
  // Check if user is admin (has admin token)
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('adminToken');
  
  if (isAdmin) {
    await signOutAdminWithRedirect(redirectTo);
  } else {
    signOutUser({ callbackUrl });
  }
}

/**
 * Check if current user is admin
 */
export function isAdminUser(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem('adminToken');
}

/**
 * Get current admin token
 */
export function getAdminToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
}

/**
 * Set admin token (for login)
 */
export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
}

/**
 * Clear all authentication data
 */
export function clearAllAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    // Clear any other auth-related items
    localStorage.removeItem('userRedirect');
  }
}