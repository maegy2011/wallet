import { SignJWT, VerifyJWT } from 'jose'
import { cookies } from 'next/headers'

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)
const JWT_ALGORITHM = 'HS256'

// Token Payload Types
export interface JWTPayload {
  userId: string
  email: string
  role: string
  tenantId?: string
  companyId?: string
  branchId?: string
  iat?: number
  exp?: number
}

// Generate JWT Token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(JWT_SECRET)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days expiration
    .sign(payload)
  
  return token
}

// Verify JWT Token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await new VerifyJWT(JWT_SECRET)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .verify(token)
    
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Generate Refresh Token
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = await new SignJWT(JWT_SECRET)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days expiration
    .sign({ userId, type: 'refresh' })
  
  return token
}

// Decode JWT without verification (for debugging)
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid token')
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString()
    )
    
    return payload
  } catch (error) {
    console.error('Token decoding failed:', error)
    return null
  }
}

// Set cookie helpers
export async function setAuthCookie(token: string, userId: string) {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  
  cookies().set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

// Clear auth cookies
export async function clearAuthCookies() {
  cookies().delete('auth_token')
  cookies().delete('user_id')
}
