'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Settings, 
  Archive, 
  RotateCcw,
  Eye,
  EyeOff,
  Store,
  UserPlus,
  Shield,
  AlertTriangle
} from 'lucide-react'

interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  businessAccount: {
    id: string
    name: string
  }
}

interface User {
  id: string
  username: string
  email?: string
  phone: string
  nationalId: string
  isActive: boolean
  userRoles: Array<{
    id: string
    role: {
      name: string
      description: string
      permissions: string
    }
    businessAccount?: {
      id: string
      name: string
    }
    branch?: {
      id: string
      name: string
    }
  }>
}

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [showEditBranch, setShowEditBranch] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [branchToArchive, setBranchToArchive] = useState<Branch | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [selectedBranchForUsers, setSelectedBranchForUsers] = useState<Branch | null>(null)
  
  // Form states
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })
  
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })

  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    const businessData = localStorage.getItem('businessAccounts')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const businessAccounts = businessData ? JSON.parse(businessData) : []
    if (businessAccounts.length === 0) {
      router.push('/business/register')
      return
    }

    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const businessData = localStorage.getItem('businessAccounts')
      const businessAccounts = businessData ? JSON.parse(businessData) : []
      
      if (businessAccounts.length > 0) {
        const response = await fetch(`/api/business/branches?businessAccountId=${businessAccounts[0].id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setBranches(data.branches || [])
        } else {
          setError('فشل في جلب الفروع')
        }
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async (branchId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      const businessData = localStorage.getItem('businessAccounts')
      const businessAccounts = businessData ? JSON.parse(businessData) : []
      
      if (businessAccounts.length > 0) {
        const response = await fetch(`/api/business/users?businessAccountId=${businessAccounts[0].id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        } else {
          setError('فشل في جلب المستخدمين')
        }
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('authToken')
      const businessData = localStorage.getItem('businessAccounts')
      const businessAccounts = businessData ? JSON.parse(businessData) : []
      
      if (businessAccounts.length === 0) {
        setError('لا توجد منشأة تجارية')
        return
      }

      const response = await fetch('/api/business/branches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...branchForm,
          businessAccountId: businessAccounts[0].id
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('تم إضافة الفرع بنجاح')
        setShowAddBranch(false)
        setBranchForm({ name: '', address: '', phone: '', email: '' })
        loadBranches()
      } else {
        setError(data.error || 'فشل في إضافة الفرع')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBranch) return
    
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`/api/business/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('تم تحديث الفرع بنجاح')
        setShowEditBranch(false)
        setSelectedBranch(null)
        loadBranches()
      } else {
        setError(data.error || 'فشل في تحديث الفرع')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleArchiveBranch = async () => {
    if (!branchToArchive) return
    
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`/api/business/branches/${branchToArchive.id}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('تم أرشفة الفرع بنجاح')
        setShowArchiveDialog(false)
        setBranchToArchive(null)
        loadBranches()
      } else {
        setError(data.error || 'فشل في أرشفة الفرع')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const handleRestoreBranch = async (branchId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`/api/business/branches/${branchId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('تم استعادة الفرع بنجاح')
        loadBranches()
      } else {
        setError(data.error || 'فشل في استعادة الفرع')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    }
  }

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch)
    setEditForm({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || ''
    })
    setShowEditBranch(true)
  }

  const openArchiveDialog = (branch: Branch) => {
    setBranchToArchive(branch)
    setShowArchiveDialog(true)
  }

  const openUsersDialog = (branch: Branch) => {
    setSelectedBranchForUsers(branch)
    loadUsers(branch.id)
    setShowUserDialog(true)
  }

  const getUserRole = (user: User) => {
    const merchantRole = user.userRoles.find(role => 
      role.role.name.includes('merchant') || role.role.name.includes('تاجر')
    )
    const sellerRole = user.userRoles.find(role => 
      role.role.name.includes('seller') || role.role.name.includes('بائع')
    )
    
    if (merchantRole) return 'تاجر'
    if (sellerRole) return 'بائع'
    return 'غير محدد'
  }

  const getRoleBadgeColor = (roleName: string) => {
    if (roleName.includes('تاجر') || roleName.includes('merchant')) return 'bg-purple-100 text-purple-800'
    if (roleName.includes('بائع') || roleName.includes('seller')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const activeBranches = branches.filter(b => b.isActive)
  const archivedBranches = branches.filter(b => !b.isActive)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="h-8 w-8 text-blue-600" />
                إدارة الفروع
              </h1>
              <p className="text-gray-600 mt-2">إدارة فروع المنشأة التجارية والمستخدمين</p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  الرئيسية
                </Button>
              </Link>
              <Link href="/business/register">
                <Button variant="outline" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  إضافة منشأة
                </Button>
              </Link>
              <Button 
                onClick={() => setShowAddBranch(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة فرع
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الفروع</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branches.length}</div>
              <p className="text-xs text-muted-foreground">فرع</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الفروع النشطة</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeBranches.length}</div>
              <p className="text-xs text-muted-foreground">فرع نشط</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الفروع المؤرشفة</CardTitle>
              <Archive className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{archivedBranches.length}</div>
              <p className="text-xs text-muted-foreground">فرع مؤرشف</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Branches */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              الفروع النشطة
            </CardTitle>
            <CardDescription>
              الفروع النشطة حالياً في المنشأة التجارية
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeBranches.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد فروع نشطة</p>
                <Button 
                  onClick={() => setShowAddBranch(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة فرع جديد
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBranches.map((branch) => (
                  <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Building className="h-3 w-3" />
                            {branch.businessAccount.name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          نشط
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {branch.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span>{branch.address}</span>
                          </div>
                        )}
                        {branch.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span>{branch.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUsersDialog(branch)}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          المستخدمون
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(branch)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          تعديل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openArchiveDialog(branch)}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                        >
                          <Archive className="h-3 w-3" />
                          أرشفة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archived Branches */}
        {archivedBranches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                الفروع المؤرشفة
              </CardTitle>
              <CardDescription>
                الفروع التي تم أرشفتها ويمكن استعادتها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedBranches.map((branch) => (
                  <Card key={branch.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Building className="h-3 w-3" />
                            {branch.businessAccount.name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          مؤرشف
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {branch.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span>{branch.address}</span>
                          </div>
                        )}
                        {branch.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span>{branch.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBranch(branch.id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <RotateCcw className="h-3 w-3" />
                          استعادة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Branch Dialog */}
        <Dialog open={showAddBranch} onOpenChange={setShowAddBranch}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة فرع جديد</DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات الفرع الجديد
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الفرع *</Label>
                <Input
                  id="name"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم الفرع"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="أدخل عنوان الفرع"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddBranch(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إضافة الفرع
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Branch Dialog */}
        <Dialog open={showEditBranch} onOpenChange={setShowEditBranch}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>تعديل الفرع</DialogTitle>
              <DialogDescription>
                قم بتحديث بيانات الفرع
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditBranch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم الفرع *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم الفرع"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">العنوان</Label>
                <Textarea
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="أدخل عنوان الفرع"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">رقم الهاتف</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditBranch(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  تحديث الفرع
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Archive Branch Dialog */}
        <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد أرشفة الفرع</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أرشفة الفرع "{branchToArchive?.name}"؟
                <br />
                <span className="text-orange-600">ملاحظة: الفرع المؤرشف لن يظهر في القوائم الرئيسية ولكن يمكن استعادته لاحقاً.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowArchiveDialog(false)}>
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleArchiveBranch} className="bg-orange-600 hover:bg-orange-700">
                تأكيد الأرشفة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Users Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                مستخدمو فرع {selectedBranchForUsers?.name}
              </DialogTitle>
              <DialogDescription>
                قائمة المستخدمين المرتبطين بهذا الفرع وصلاحياتهم
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">لا يوجد مستخدمون مرتبطون بهذا الفرع</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email || user.phone}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={getRoleBadgeColor(getUserRole(user))}
                            >
                              {getUserRole(user)}
                            </Badge>
                            {user.isActive ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                نشط
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                غير نشط
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}