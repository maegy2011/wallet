import { requireAuth, getCurrentTenant } from "@/lib/tenant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, Calendar, Users, CheckSquare } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockProjects = [
  {
    id: "1",
    name: "موقع الشركة الجديد",
    description: "تصميم وتطوير الموقع الرسمي الجديد للشركة",
    status: "ACTIVE" as const,
    createdAt: new Date("2024-01-15"),
    _count: {
      tasks: 12,
    },
    createdBy: {
      user: {
        name: "أحمد محمد",
      },
    },
  },
  {
    id: "2",
    name: "تطبيق الموبايل",
    description: "تطبيق موبايل للعملاء لإدارة الخدمات",
    status: "ACTIVE" as const,
    createdAt: new Date("2024-01-20"),
    _count: {
      tasks: 8,
    },
    createdBy: {
      user: {
        name: "فاطمة علي",
      },
    },
  },
]

export default async function ProjectsPage() {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>مؤسسة غير موجودة</CardTitle>
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/dashboard" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">س</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ساسaaS</span>
            </Link>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-gray-500">/</span>
              <span className="font-semibold">المشاريع</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="ml-2 h-4 w-4" />
                مشروع جديد
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المشاريع</h1>
          <p className="text-gray-600">
            إدارة مشاريع {tenant.name} وتتبع التقدم
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">جميع المشاريع</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                مشاريع نشطة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام الكلية</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockProjects.reduce((sum, project) => sum + project._count.tasks, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                عبر جميع المشاريع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمون</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenant._count.users}</div>
              <p className="text-xs text-muted-foreground">
                أعضاء في المؤسسة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                مشاريع جديدة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                    {project.status === "ACTIVE" ? "نشط" : "مؤرشف"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CheckSquare className="h-4 w-4 text-gray-500" />
                      <span>{project._count.tasks} مهام</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>فريق</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>أنشأه {project.createdBy.user.name}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/projects/${project.id}`}>
                      عرض التفاصيل
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Project Card */}
          <Card className="border-dashed border-2 hover:border-blue-300 transition-colors cursor-pointer">
            <Link href="/projects/new">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">مشروع جديد</CardTitle>
                <CardDescription>
                  أنشئ مشروعاً جديداً لبدء العمل
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="ghost">
                  إنشاء مشروع
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {mockProjects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد مشاريع بعد
              </h3>
              <p className="text-gray-600 mb-4">
                ابدأ بإنشاء مشروع جديد لتنظيم عملك
              </p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء المشروع الأول
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}