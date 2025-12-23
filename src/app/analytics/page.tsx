import { requireAuth, getCurrentTenant } from "@/lib/tenant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Clock,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

// Mock analytics data for demonstration
const generateMockData = () => {
  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 10) + 1,
      projects: Math.floor(Math.random() * 5) + 1,
      tasks: Math.floor(Math.random() * 20) + 5,
      logins: Math.floor(Math.random() * 15) + 2,
    }
  })

  return {
    dailyStats: last30Days,
    summary: {
      totalUsers: 5,
      totalProjects: 3,
      totalTasks: 47,
      totalLogins: 156,
      avgSessionDuration: "12 دقيقة",
      growthRate: {
        users: 15.2,
        projects: 8.7,
        tasks: 23.1,
        logins: 12.4,
      }
    },
    topUsers: [
      { name: "أحمد محمد", tasksCompleted: 12, projectsCount: 2, lastActive: "منذ ساعتين" },
      { name: "فاطمة علي", tasksCompleted: 8, projectsCount: 1, lastActive: "منذ 5 ساعات" },
      { name: "محمد خالد", tasksCompleted: 6, projectsCount: 1, lastActive: "منذ يوم" },
    ],
    projectStats: [
      { name: "موقع الشركة الجديد", tasks: 12, completed: 8, progress: 67 },
      { name: "تطبيق الموبايل", tasks: 8, completed: 3, progress: 38 },
      { name: "نظام إدارة المحتوى", tasks: 15, completed: 15, progress: 100 },
    ],
    usageByHour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.floor(Math.random() * 20) + 2,
    })),
  }
}

export default async function AnalyticsPage() {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()
  const analyticsData = generateMockData()

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
            <Link href="/onboarding">
              <Button className="w-full">إنشاء مؤسسة جديدة</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { dailyStats, summary, topUsers, projectStats, usageByHour } = analyticsData

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
              <span className="font-semibold">التحليلات</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Link>
            <Badge variant="outline" className="flex items-center">
              <Calendar className="ml-2 h-4 w-4" />
              آخر 30 يوم
            </Badge>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">التحليلات والإحصائيات</h1>
          <p className="text-gray-600">
            نظرة شاملة على استخدام مؤسسة {tenant.name}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUsers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="ml-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+{summary.growthRate.users}%</span>
                <span className="mr-1">من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProjects}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="ml-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+{summary.growthRate.projects}%</span>
                <span className="mr-1">من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTasks}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="ml-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+{summary.growthRate.tasks}%</span>
                <span className="mr-1">من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الجلسة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgSessionDuration}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowDown className="ml-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">-5%</span>
                <span className="mr-1">من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="activity">النشاط</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="ml-2 h-5 w-5" />
                    النمو اليومي (30 يوم)
                  </CardTitle>
                  <CardDescription>
                    تتبع النمو في المستخدمين والمشاريع والمهام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>مخطط النمو اليومي</p>
                      <p className="text-sm">سيتم عرض الرسم البياني هنا</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="ml-2 h-5 w-5" />
                    توزيع الاستخدام
                  </CardTitle>
                  <CardDescription>
                    كيفية استخدام الموارد المختلفة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>مخطط دائري</p>
                      <p className="text-sm">سيتم عرض التوزيع هنا</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="ml-2 h-5 w-5" />
                  أفضل المستخدمين نشاطاً
                </CardTitle>
                <CardDescription>
                  المستخدمون الأكثر نشاطاً في المؤسسة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">آخر نشاط: {user.lastActive}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-4 space-x-reverse text-sm">
                          <span className="flex items-center">
                            <CheckSquare className="ml-1 h-4 w-4 text-gray-400" />
                            {user.tasksCompleted} مهمة
                          </span>
                          <span className="flex items-center">
                            <FolderOpen className="ml-1 h-4 w-4 text-gray-400" />
                            {user.projectsCount} مشروع
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="ml-2 h-5 w-5" />
                  أداء المشاريع
                </CardTitle>
                <CardDescription>
                  تقدم المشاريع الحالية في المؤسسة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectStats.map((project, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge variant={project.progress === 100 ? "default" : "secondary"}>
                          {project.progress}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>المهام المكتملة</span>
                          <span>{project.completed} من {project.tasks}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="ml-2 h-5 w-5" />
                    النشاط بالساعة
                  </CardTitle>
                  <CardDescription>
                    مستوى النشاط على مدار 24 ساعة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>مخطط النشاط بالساعة</p>
                      <p className="text-sm">سيتم عرض النشاط هنا</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات سريعة</CardTitle>
                  <CardDescription>
                    معلومات إضافية عن الاستخدام
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">إجمالي تسجيلات الدخول</span>
                    <span className="font-semibold">{summary.totalLogins}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">معدل النمو الشهري</span>
                    <span className="font-semibold text-green-600">+18.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">أكثر أيام نشاطاً</span>
                    <span className="font-semibold">الأحد</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm">متوسط المهام اليومية</span>
                    <span className="font-semibold">7.2</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}