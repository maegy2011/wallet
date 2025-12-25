'use client'

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, DollarSign, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserProfileProps {
  user?: {
    id: string
    mobileNumber: string
    name?: string
    email?: string
    mobileVerified: boolean
    accounts?: Array<{
      accountNumber: string
      accountType: string
      balance: number
      currency: string
    }>
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const { data: session } = useSession()

  const displayUser = user || session?.user

  if (!displayUser) {
    return null
  }

  const totalBalance = displayUser.accounts?.reduce((sum, account) => sum + account.balance, 0) || 0

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>الملف الشخصي</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </CardTitle>
        <CardDescription>
          معلومات حسابك الشخصي
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">رقم الموبايل</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{displayUser.mobileNumber}</span>
            {displayUser.mobileVerified && (
              <Badge variant="secondary" className="text-xs">
                موثق
              </Badge>
            )}
          </div>
        </div>

        {displayUser.name && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">الاسم</span>
            <span className="font-medium">{displayUser.name}</span>
          </div>
        )}

        {displayUser.email && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">البريد الإلكتروني</span>
            <span className="font-medium">{displayUser.email}</span>
          </div>
        )}

        {displayUser.accounts && displayUser.accounts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">إجمالي الرصيد</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-lg">
                  {totalBalance.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">الحسابات</span>
              {displayUser.accounts.map((account) => (
                <div
                  key={account.accountNumber}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {account.accountType === 'WALLET' ? 'محفظة' : 'حساب'}
                    </span>
                  </div>
                  <span className="text-sm">
                    {account.balance.toLocaleString('ar-EG')} {account.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}