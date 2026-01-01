import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users from mock database
async function getUsers(): Promise<any[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Helper function to write users to mock database
async function saveUsers(users: any[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
    throw new Error('Failed to save user data');
  }
}

// Helper function to find user by email
async function findUserByEmail(email: string): Promise<any | undefined> {
  try {
    const users = await getUsers();
    return users.find(user => user.email === email);
  } catch (error) {
    console.error('Error finding user by email:', error);
    return undefined;
  }
}

// Helper function to create a new user
async function createUser(userData: any): Promise<any> {
  try {
    const users = await getUsers();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      onboarded: false,
      plan: 'free',
      emailVerified: false,
      loginAttempts: 0
    };
    
    users.push(newUser);
    await saveUsers(users);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
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

          if (!email || !password) {
            throw new Error('Email and password are required');
          }

          // In production, you would verify the captcha token here
          // For now, we'll just check if it exists
          if (!captchaToken) {
            throw new Error('CAPTCHA verification is required');
          }

          // More robust boolean checking
          const isSignupBool = isSignup === true || isSignup === 'true' || isSignup === 1;
          const isSigninBool = !isSignupBool;

          if (isSignupBool) {
            // Signup flow
            if (!name) {
              throw new Error('Name is required for signup');
            }

            // Check if user already exists
            const existingUser = await findUserByEmail(email as string);
            if (existingUser) {
              throw new Error('User already exists with this email');
            }

            // Create new user
            const newUser = await createUser({
              name: name as string,
              email: email as string,
              password: password as string
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
            const user = await findUserByEmail(email as string);

            if (!user) {
              throw new Error('No user found with this email');
            }

            const isPasswordValid = await bcrypt.compare(password as string, user.password);
            if (!isPasswordValid) {
              throw new Error('Invalid password');
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              onboarded: user.onboarded,
              plan: user.plan,
              emailVerified: user.emailVerified
            };
          } else {
            throw new Error('Invalid authentication request');
          }
        } catch (error) {
          console.error('AUTH ERROR:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
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