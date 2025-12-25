import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  mobileNumber: z.string().regex(/^01[0-9]{9}$/, 'رقم الموبايل المصري غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        mobileNumber: { label: "رقم الموبايل", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.mobileNumber || !credentials?.password) {
            return null
          }

          // Validate input
          const validatedData = loginSchema.parse({
            mobileNumber: credentials.mobileNumber,
            password: credentials.password
          })

          // Find user by mobile number
          const user = await db.user.findUnique({
            where: {
              mobileNumber: validatedData.mobileNumber
            },
            include: {
              accounts: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          })

          if (!user) {
            return null
          }

          // Check user status
          if (user.status !== 'ACTIVE') {
            return null
          }

          // In a real app, you should verify the password hash
          // For now, we'll just check if password exists (not secure for production)
          // This is just a placeholder - you should implement proper password verification with bcrypt
          
          // Note: In production, you should store hashed passwords and verify them like this:
          // const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)
          // if (!isPasswordValid) {
          //   return null
          // }

          // For demo purposes, we'll accept any non-empty password
          if (!validatedData.password) {
            return null
          }

          // Return user object
          return {
            id: user.id,
            mobileNumber: user.mobileNumber,
            name: user.name,
            email: user.email,
            role: user.role,
            mobileVerified: user.mobileVerified,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.mobileNumber = user.mobileNumber
        token.mobileVerified = user.mobileVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.mobileNumber = token.mobileNumber as string
        session.user.mobileVerified = token.mobileVerified as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
  debug: process.env.NODE_ENV === "development",
}