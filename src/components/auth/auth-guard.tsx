'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle } from "lucide-react"
import { PermissionManager } from "@/lib/permissions/rbac"

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRole?: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requiredPermissions = [], 
  requiredRole = [], 
  redirectTo = "/login", 
  fallback 
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push(redirectTo)
      return
    }
    
    // Check if user has required role
    if (requiredRole.length > 0 && !requiredRole.includes(session.user.role)) {
      router.push("/unauthorized")
      return
    }
  }, [session, status, router, requiredRole, redirectTo])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">مطلوب تسجيل الدخول</CardTitle>
            <CardDescription>
              يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(redirectTo)} 
              className="w-full"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole.length > 0 && !requiredRole.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">غير مصرح بالوصول</CardTitle>
            <CardDescription>
              ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/")} 
              variant="outline"
              className="w-full"
            >
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check permissions (this is a client-side check, server-side should also validate)
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      PermissionManager.hasPermission(session.user.role, permission)
    )
    
    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">صلاحيات غير كافية</CardTitle>
              <CardDescription>
                ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الميزة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push("/")} 
                variant="outline"
                className="w-full"
              >
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}