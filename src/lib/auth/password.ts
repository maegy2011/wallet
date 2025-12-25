import { hash, compare } from 'bcryptjs'

// Hash Password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10) // 10 rounds
}

// Verify Password
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// Validate Password Strength
export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'fair' | 'good' | 'strong'
  requirements: string[]
} {
  const requirements: string[] = []
  
  // Check length
  if (password.length < 8) {
    requirements.push('كلمة المرور يجب أن تكون على الأقل 8 أحرف')
  }
  
  if (password.length > 128) {
    requirements.push('كلمة المرور يجب أن تكون أقل من 128 حرف')
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    requirements.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    requirements.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    requirements.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]/.test(password)) {
    requirements.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
  }
  
  // Calculate strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  const metRequirements = requirements.length === 0 ? 5 : (5 - requirements.length)
  
  if (metRequirements >= 5) {
    strength = 'strong'
  } else if (metRequirements >= 4) {
    strength = 'good'
  } else if (metRequirements >= 3) {
    strength = 'fair'
  }
  
  return {
    isValid: requirements.length === 0,
    strength,
    requirements
  }
}

// Generate Random Password
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}
