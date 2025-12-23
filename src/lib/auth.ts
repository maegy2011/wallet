import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().optional(),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
        tenantSlug: { label: "اسم المؤسسة", type: "text" },
      },
      async authorize(credentials) {
        try {
          const { email, password, tenantSlug } = loginSchema.parse(credentials)

          // Find user
          const user = await db.user.findUnique({
            where: { email },
            include: {
              tenantUsers: {
                include: {
                  tenant: true,
                },
              },
            },
          })

          if (!user || !user.isActive) {
            throw new Error("المستخدم غير موجود أو غير نشط")
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            throw new Error("كلمة المرور غير صحيحة")
          }

          // If tenantSlug provided, check if user is member of that tenant
          if (tenantSlug) {
            const tenantUser = user.tenantUsers.find(
              (tu) => tu.tenant.slug === tenantSlug && tu.isActive
            )
            
            if (!tenantUser) {
              throw new Error("ليست لديك صلاحية الوصول إلى هذه المؤسسة")
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              tenantId: tenantUser.tenantId,
              tenantSlug: tenantUser.tenant.slug,
              tenantName: tenantUser.tenant.name,
              role: tenantUser.role,
            }
          }

          // If no tenant specified, return user with first tenant (if any)
          const firstTenant = user.tenantUsers.find(tu => tu.isActive)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: firstTenant?.tenantId,
            tenantSlug: firstTenant?.tenant.slug,
            tenantName: firstTenant?.tenant.name,
            role: firstTenant?.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug
        token.tenantName = user.tenantName
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.tenantId = token.tenantId as string
        session.user.tenantSlug = token.tenantSlug as string
        session.user.tenantName = token.tenantName as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      tenantId?: string
      tenantSlug?: string
      tenantName?: string
      role?: string
    }
  }

  interface User {
    tenantId?: string
    tenantSlug?: string
    tenantName?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string
    tenantSlug?: string
    tenantName?: string
    role?: string
  }
}