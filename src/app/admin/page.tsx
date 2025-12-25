'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Settings, BarChart3, Smartphone, DollarSign, TrendingUp, Search, Filter } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthGuard } from "@/components/auth/auth-guard"

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    mobileNumber: "01234567890",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    status: "ACTIVE",
    createdAt: "2024-01-15",
    accountsCount: 1
  },
  {
    id: "2", 
    mobileNumber: "01123456789",
    name: "فاطمة عبدالله",
    email: "fatima@example.com",
    status: "ACTIVE",
    createdAt: "2024-01-14",
    accountsCount: 2
  },
  {
    id: "3",
    mobileNumber: "01098765432",
    name: "محمد علي",
    email: "mohamed@example.com", 
    status: "INACTIVE",
    createdAt: "2024-01-13",
    accountsCount: 1
  }
]

const mockStats = {
  totalUsers: 1250,
  activeUsers: 1180,
  totalAccounts: 1450,
  totalBalance: 2500000,
  todayTransactions: 342
}

export default function AdminDashboard() {
  const [users] = useState(mockUsers)
  const [stats] = useState(mockStats)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">غير نشط</Badge>
      case "SUSPENDED":
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
      case "BLOCKED":
        return <Badge className="bg-red-100 text-red-800">محظور</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <AuthGuard requiredRole={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h1 className="mr-3 text-xl font-bold text-gray-900 dark:text-white">
                  لوحة تحكم المشرفين
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button variant="outline" size="sm">
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString('ar-EG')}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} نشط
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الحسابات</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAccounts.toLocaleString('ar-EG')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الرصيد</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalBalance.toLocaleString('ar-EG')} ج.م
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معاملات اليوم</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayTransactions.toLocaleString('ar-EG')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل النشاط</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
              <TabsTrigger value="transactions">المعاملات</TabsTrigger>
              <TabsTrigger value="accounts">الحسابات</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>إدارة المستخدمين</CardTitle>
                      <CardDescription>
                        عرض وإدارة جميع مستخدمي التطبيق
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="بحث مستخدم..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 ml-2" />
                        فلترة
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المستخدم</TableHead>
                        <TableHead>رقم الموبايل</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الحسابات</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.mobileNumber}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.createdAt}</TableCell>
                          <TableCell>{user.accountsCount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                عرض
                              </Button>
                              <Button variant="outline" size="sm">
                                تعديل
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>المعاملات المالية</CardTitle>
                  <CardDescription>
                    عرض جميع المعاملات المالية في النظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    سيتم عرض المعاملات المالية هنا
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الحسابات</CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع الحسابات المصرفية والمحافظ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    سيتم عرض الحسابات هنا
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات النظام</CardTitle>
                  <CardDescription>
                    تكوين إعدادات النظام والمتغيرات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    سيتم عرض إعدادات النظام هنا
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}