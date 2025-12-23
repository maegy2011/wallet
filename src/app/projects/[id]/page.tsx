import { requireAuth, getCurrentTenant } from "@/lib/tenant"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  FolderOpen, 
  CheckSquare, 
  Calendar,
  User,
  Settings,
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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

  // Get project details
  const project = await db.project.findFirst({
    where: {
      id: params.id,
      tenantId: tenant.id,
    },
    include: {
      createdBy: {
        include: {
          user: true,
        },
      },
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  })

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>المشروع غير موجود</CardTitle>
            <CardDescription>
              المشروع الذي تبحث عنه غير موجود أو ليس لديك صلاحية الوصول إليه
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/projects">العودة إلى المشاريع</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "نشط"
      case "ARCHIVED":
        return "مؤرشف"
      default:
        return status
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "TODO":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "مكتملة"
      case "IN_PROGRESS":
        return "قيد التنفيذ"
      case "TODO":
        return "في الانتظار"
      default:
        return status
    }
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
              <Link href="/projects" className="text-gray-600 hover:text-gray-900">
                المشاريع
              </Link>
              <span className="text-gray-500">/</span>
              <span className="font-semibold">{project.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="ml-2 h-4 w-4" />
              إعدادات
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
        <div className="mb-6">
          <Link href="/projects" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى المشاريع
          </Link>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 space-x-reverse">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
              </div>
              <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="ml-2 h-4 w-4" />
                  أنشأه {project.createdBy.user.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="ml-2 h-4 w-4" />
                  {new Date(project.createdAt).toLocaleDateString('ar-SA')}
                </div>
                <div className="flex items-center">
                  <CheckSquare className="ml-2 h-4 w-4" />
                  {project._count.tasks} مهام
                </div>
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button asChild>
                <Link href={`/projects/${project.id}/tasks/new`}>
                  <Plus className="ml-2 h-4 w-4" />
                  مهمة جديدة
                </Link>
              </Button>
            </div>
          </div>
          
          {project.description && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-2">الوصف</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
          )}
        </div>

        {/* Project Details Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">المهام</TabsTrigger>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>المهام</CardTitle>
                    <CardDescription>
                      آخر المهام في هذا المشروع
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/projects/${project.id}/tasks/new`}>
                      <Plus className="ml-2 h-4 w-4" />
                      مهمة جديدة
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {project.tasks.length > 0 ? (
                  <div className="space-y-4">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Badge className={getTaskStatusColor(task.status)}>
                              {getTaskStatusText(task.status)}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              {new Date(task.createdAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      لا توجد مهام بعد
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ابدأ بإضافة المهام الأولى لهذا المشروع
                    </p>
                    <Button asChild>
                      <Link href={`/projects/${project.id}/tasks/new`}>
                        <Plus className="ml-2 h-4 w-4" />
                        إنشاء المهمة الأولى
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات المشروع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">إجمالي المهام</span>
                    <span className="font-semibold">{project._count.tasks}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">الحالة</span>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">تاريخ الإنشاء</span>
                    <span className="font-semibold">
                      {new Date(project.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات المشروع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">المعرف</span>
                      <span className="font-mono text-sm">{project.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">المنشئ</span>
                      <span>{project.createdBy.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">المؤسسة</span>
                      <span>{tenant.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المشروع</CardTitle>
                <CardDescription>
                  إدارة إعدادات وتكوينات المشروع
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/projects/${project.id}/edit`}>
                      <Edit className="ml-2 h-4 w-4" />
                      تعديل معلومات المشروع
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/projects/${project.id}/members`}>
                      <User className="ml-2 h-4 w-4" />
                      إدارة الأعضاء
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/projects/${project.id}/export`}>
                      <FolderOpen className="ml-2 h-4 w-4" />
                      تصدير البيانات
                    </Link>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف المشروع
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}