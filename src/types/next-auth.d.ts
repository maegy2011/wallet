import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      mobileNumber: string
      mobileVerified: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    mobileNumber: string
    mobileVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    mobileNumber: string
    mobileVerified: boolean
  }
}