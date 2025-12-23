import { requireAuth, getCurrentTenant } from "@/lib/tenant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FolderOpen, CheckSquare, TrendingUp, Building, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  try {
    const user = await requireAuth()
    const tenant = await getCurrentTenant()

    if (!tenant) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>أهلاً بك {user.name}</CardTitle>
              <CardDescription>
                يبدو أنك لا تنتمي إلى أي مؤسسة بعد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/onboarding">إنشاء مؤسسة جديدة</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

  // Get some stats for the dashboard
  const stats = {
    users: tenant._count.users,
    projects: tenant._count.projects,
    tasks: 0, // We'll implement this later
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">س</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ساسaaS</span>
            </Link>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Building className="h-5 w-5 text-gray-500" />
              <span className="font-semibold">{tenant.name}</span>
              <Badge variant="secondary">{tenant.plan}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </Link>
            </Button>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600">
            أهلاً بك في لوحة تحكم {tenant.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمون</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground">
                +2% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
              <p className="text-xs text-muted-foreground">
                +1 مشروع جديد هذا الأسبوع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks}</div>
              <p className="text-xs text-muted-foreground">
                +12% من الأسبوع الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">النمو</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15%</div>
              <p className="text-xs text-muted-foreground">
                معدل النمو الشهري
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>
                ابدأ بإنشاء محتوى جديد في مؤسستك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/projects/new">
                  <FolderOpen className="ml-2 h-4 w-4" />
                  إنشاء مشروع جديد
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/users/invite">
                  <Users className="ml-2 h-4 w-4" />
                  دعوة مستخدم جديد
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/analytics">
                  <BarChart3 className="ml-2 h-4 w-4" />
                  عرض التحليلات
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings/subscription">
                  <Settings className="ml-2 h-4 w-4" />
                  ترقية الخطة
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات المؤسسة</CardTitle>
              <CardDescription>
                تفاصيل أساسية عن مؤسستك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">اسم المؤسسة:</span>
                <span className="font-medium">{tenant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">معرف المؤسسة:</span>
                <span className="font-medium">{tenant.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الخطة الحالية:</span>
                <Badge>{tenant.plan}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                <span className="font-medium">
                  {new Date(tenant.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>
              آخر التحديثات في مؤسستك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              لا يوجد نشاط حديث
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
  } catch (error) {
    // If authentication fails, redirect to signin
    redirect("/auth/signin")
  }
}