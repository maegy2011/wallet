import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import { ErrorLogger, ValidationError, AuthenticationError, ConflictError, NotFoundError } from '@/lib/errors';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users from mock database with enhanced error handling
async function getUsers(): Promise<any[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    
    // Validate that we have an array
    if (!Array.isArray(users)) {
      throw new Error('Users data is not in expected format');
    }
    
    return users;
  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to read users file'), {
      operation: 'getUsers',
      filePath: usersFilePath
    });
    
    // If file doesn't exist, create it with an empty array
    if (error instanceof Error && error.message.includes('ENOENT')) {
      try {
        await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
        await fs.writeFile(usersFilePath, JSON.stringify([], null, 2));
        return [];
      } catch (createError) {
        ErrorLogger.log(createError instanceof Error ? createError : new Error('Failed to create users file'), {
          operation: 'createUsersFile'
        });
        throw new Error('Unable to initialize user database');
      }
    }
    
    throw new Error('Unable to access user database');
  }
}

// Helper function to write users to mock database with enhanced error handling
async function saveUsers(users: any[]): Promise<void> {
  try {
    // Validate input
    if (!Array.isArray(users)) {
      throw new Error('Users data must be an array');
    }
    
    // Create backup before saving
    const backupPath = usersFilePath + '.backup';
    try {
      await fs.copyFile(usersFilePath, backupPath);
    } catch (backupError) {
      // Backup is optional, don't fail if it doesn't work
      ErrorLogger.warn('Could not create backup of users file', {
        operation: 'backupUsers',
        originalError: backupError instanceof Error ? backupError.message : String(backupError)
      });
    }
    
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    
    ErrorLogger.info('Users data saved successfully', {
      operation: 'saveUsers',
      userCount: users.length
    });
    
  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Failed to save users file'), {
      operation: 'saveUsers',
      userCount: users?.length || 0
    });
    throw new Error('Failed to save user data');
  }
}

// Helper function to find user by email with enhanced error handling
async function findUserByEmail(email: string): Promise<any | undefined> {
  try {
    // Validate email format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }
    
    const users = await getUsers();
    const user = users.find(user => user.email === email);
    
    ErrorLogger.info('User lookup completed', {
      operation: 'findUserByEmail',
      email: email.toLowerCase(),
      found: !!user
    });
    
    return user;
  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Error finding user by email'), {
      operation: 'findUserByEmail',
      email: email.toLowerCase()
    });
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new Error('Unable to search for user');
  }
}

// Helper function to create a new user with enhanced error handling
async function createUser(userData: any): Promise<any> {
  try {
    // Validate required fields
    const { name, email, password } = userData;
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }
    
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    
    const users = await getUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email.toLowerCase());
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }
    
    // Hash password with error handling
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError) {
      ErrorLogger.log(hashError instanceof Error ? hashError : new Error('Password hashing failed'), {
        operation: 'hashPassword'
      });
      throw new Error('Unable to secure password');
    }
    
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboarded: false,
      plan: 'free',
      emailVerified: false,
      loginAttempts: 0,
      lastLoginAt: null
    };
    
    users.push(newUser);
    await saveUsers(users);
    
    ErrorLogger.info('New user created successfully', {
      operation: 'createUser',
      userId: newUser.id,
      email: newUser.email
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
    
  } catch (error) {
    ErrorLogger.log(error instanceof Error ? error : new Error('Error creating user'), {
      operation: 'createUser',
      email: userData.email?.toLowerCase()
    });
    
    if (error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    
    throw new Error('Failed to create user account');
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignup: { label: 'Is Signup', type: 'boolean' },
        captchaToken: { label: 'CAPTCHA Token', type: 'text' }
      },
      async authorize(credentials) {
        try {
          const { email, password, name, isSignup, captchaToken } = credentials;

          // Validate required credentials
          if (!email || typeof email !== 'string' || !email.includes('@')) {
            throw new ValidationError('Valid email is required');
          }

          if (!password || typeof password !== 'string') {
            throw new ValidationError('Password is required');
          }

          if (!captchaToken) {
            throw new ValidationError('CAPTCHA verification is required');
          }

          // In production, you would verify the captcha token here
          // For now, we'll just check if it exists
          ErrorLogger.info('CAPTCHA verification', {
            operation: 'captchaCheck',
            hasToken: !!captchaToken
          });

          // More robust boolean checking
          const isSignupBool = isSignup === true || isSignup === 'true' || isSignup === 1;
          const isSigninBool = !isSignupBool;

          if (isSignupBool) {
            // Signup flow
            if (!name || typeof name !== 'string' || name.trim().length < 2) {
              throw new ValidationError('Name must be at least 2 characters long');
            }

            ErrorLogger.info('User signup attempt', {
              operation: 'signup',
              email: email.toLowerCase()
            });

            // Create new user (includes duplicate check)
            const newUser = await createUser({
              name: name.trim(),
              email: email.toLowerCase(),
              password: password
            });

            ErrorLogger.info('User signup successful', {
              operation: 'signup',
              userId: newUser.id,
              email: newUser.email
            });

            return {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              onboarded: newUser.onboarded,
              plan: newUser.plan,
              emailVerified: newUser.emailVerified
            };

          } else if (isSigninBool) {
            // Signin flow
            ErrorLogger.info('User signin attempt', {
              operation: 'signin',
              email: email.toLowerCase()
            });

            const user = await findUserByEmail(email.toLowerCase());

            if (!user) {
              throw new AuthenticationError('No user found with this email');
            }

            // Check if account is locked due to too many failed attempts
            if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
              throw new AuthenticationError('Account is temporarily locked due to too many failed attempts');
            }

            let isPasswordValid: boolean;
            try {
              isPasswordValid = await bcrypt.compare(password, user.password);
            } catch (compareError) {
              ErrorLogger.log(compareError instanceof Error ? compareError : new Error('Password comparison failed'), {
                operation: 'comparePassword',
                userId: user.id
              });
              throw new AuthenticationError('Authentication failed');
            }

            if (!isPasswordValid) {
              // Increment login attempts and potentially lock account
              const users = await getUsers();
              const userIndex = users.findIndex(u => u.id === user.id);
              
              if (userIndex !== -1) {
                users[userIndex].loginAttempts = (users[userIndex].loginAttempts || 0) + 1;
                
                // Lock account after 5 failed attempts for 30 minutes
                if (users[userIndex].loginAttempts >= 5) {
                  users[userIndex].lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
                  ErrorLogger.warn('Account locked due to failed attempts', {
                    operation: 'lockAccount',
                    userId: user.id,
                    attempts: users[userIndex].loginAttempts
                  });
                }
                
                await saveUsers(users);
              }
              
              throw new AuthenticationError('Invalid password');
            }

            // Reset login attempts on successful login
            const users = await getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
              users[userIndex].loginAttempts = 0;
              users[userIndex].lockedUntil = null;
              users[userIndex].lastLoginAt = new Date().toISOString();
              await saveUsers(users);
            }

            ErrorLogger.info('User signin successful', {
              operation: 'signin',
              userId: user.id,
              email: user.email
            });

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return {
              id: userWithoutPassword.id,
              name: userWithoutPassword.name,
              email: userWithoutPassword.email,
              onboarded: userWithoutPassword.onboarded,
              plan: userWithoutPassword.plan,
              emailVerified: userWithoutPassword.emailVerified
            };

          } else {
            throw new ValidationError('Invalid authentication request');
          }

        } catch (error) {
          ErrorLogger.log(error instanceof Error ? error : new Error('Authentication error'), {
            operation: 'authorize',
            email: credentials?.email?.toLowerCase(),
            isSignup: credentials?.isSignup
          });

          // Re-throw our custom errors
          if (error instanceof ValidationError || 
              error instanceof AuthenticationError || 
              error instanceof ConflictError) {
            throw error;
          }

          // Wrap unknown errors
          throw new AuthenticationError(
            process.env.NODE_ENV === 'development' 
              ? (error instanceof Error ? error.message : 'Authentication failed')
              : 'Authentication failed'
          );
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.onboarded = user.onboarded;
        token.plan = user.plan;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.onboarded = token.onboarded as boolean;
        session.user.plan = token.plan as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    signUp: '/signup',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };