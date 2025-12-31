/**
 * NextAuth.js type extensions
 * 
 * Extends the default NextAuth types to include custom user properties
 * and session data for the Mahfza application.
 */

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extended session interface with custom user properties
   */
  interface Session {
    user: {
      /** Unique user identifier */
      id: string;
      /** User's full name */
      name: string;
      /** User's email address */
      email: string;
      /** Whether user has completed onboarding */
      onboarded: boolean;
      /** User's subscription plan */
      plan: 'free' | 'pro';
      /** Whether user's email is verified */
      emailVerified: boolean;
      /** User's avatar image URL (optional) */
      image?: string;
    } & DefaultSession['user'];
  }

  /**
   * Extended user interface for authentication callbacks
   */
  interface User {
    /** Unique user identifier */
    id: string;
    /** User's full name */
    name: string;
    /** User's email address */
    email: string;
    /** Whether user has completed onboarding */
    onboarded: boolean;
    /** User's subscription plan */
    plan: 'free' | 'pro';
    /** Whether user's email is verified */
    emailVerified: boolean;
    /** User's avatar image URL (optional) */
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface with custom token properties
   */
  interface JWT {
    /** Unique user identifier */
    id: string;
    /** Whether user has completed onboarding */
    onboarded: boolean;
    /** User's subscription plan */
    plan: 'free' | 'pro';
    /** Whether user's email is verified */
    emailVerified: boolean;
    /** User's avatar image URL (optional) */
    image?: string;
  }
}

/**
 * Type definitions for authentication credentials
 * Used in the CredentialsProvider configuration
 */
export interface AuthCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's full name (required for signup) */
  name?: string;
  /** Whether this is a signup request */
  isSignup?: boolean;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  /** Whether authentication was successful */
  success: boolean;
  /** User data (if successful) */
  user?: {
    id: string;
    name: string;
    email: string;
    onboarded: boolean;
    plan: 'free' | 'pro';
    emailVerified: boolean;
  };
  /** Error message (if failed) */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: string;
}