'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Shield, 
  Building, 
  UserCheck, 
  UserX,
  ArrowUpDown,
  Settings,
  UserPlus
} from 'lucide-react'

interface User {
  id: string
  username: string
  email?: string
  phone?: string
  nationalId?: string
  isActive: boolean
  createdAt: string
  userRoles: {
    id: string
    role: {
      id: string
      name: string
      permissions: string[]
    }
    branch: {
      id: string
      name: string
      address: string
      isActive: boolean
    }
  }[]
}

interface Branch {
  id: string
  name: string
  address: string
  isActive: boolean
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    role: '',
    branches: [] as string[]
  })

  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    phone: '',
    nationalId: '',
    isActive: true,
    roles: [] as { roleId: string; branchId: string }[]
  })

  useEffect(() => {
    fetchUsers()
    fetchBranches()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/business/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/business/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/business/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email || undefined,
          phone: newUser.phone || undefined,
          nationalId: newUser.nationalId || undefined,
          password: newUser.password,
          role: newUser.role,
          branches: newUser.branches
        }),
      })

      if (response.ok) {
        setShowAddUserDialog(false)
        setNewUser({
          username: '',
          email: '',
          phone: '',
          nationalId: '',
          password: '',
          role: '',
          branches: []
        })
        fetchUsers()
      }
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/business/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editUser.username,
          email: editUser.email || undefined,
          phone: editUser.phone || undefined,
          nationalId: editUser.nationalId || undefined,
          isActive: editUser.isActive,
          roles: editUser.roles
        }),
      })

      if (response.ok) {
        setShowEditUserDialog(false)
        setSelectedUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return

    try {
      const response = await fetch(`/api/business/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      nationalId: user.nationalId || '',
      isActive: user.isActive,
      roles: user.userRoles.map(ur => ({
        roleId: ur.role.id,
        branchId: ur.branch.id
      }))
    })
    setShowEditUserDialog(true)
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'merchant':
        return 'bg-purple-100 text-purple-800'
      case 'seller':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case 'merchant':
        return 'تاجر'
      case 'seller':
        return 'بائع'
      default:
        return roleName
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm)
    
    const matchesRole = filterRole === 'all' || 
                       user.userRoles.some(ur => ur.role.name === filterRole)
    
    const matchesBranch = filterBranch === 'all' || 
                         user.userRoles.some(ur => ur.branch.id === filterBranch)
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive)

    return matchesSearch && matchesRole && matchesBranch && matchesStatus
  })

  const activeUsersCount = users.filter(u => u.isActive).length
  const inactiveUsersCount = users.filter(u => !u.isActive).length
  const merchantsCount = users.filter(u => u.userRoles.some(ur => ur.role.name === 'merchant')).length
  const sellersCount = users.filter(u => u.userRoles.some(ur => ur.role.name === 'seller')).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600 mt-2">إدارة حسابات المستخدمين والصلاحيات والفروع</p>
        </div>
        <Button 
          onClick={() => setShowAddUserDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="h-4 w-4 ml-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المستخدمون النشطون</p>
                <p className="text-2xl font-bold text-green-600">{activeUsersCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المستخدمون غير النشطين</p>
                <p className="text-2xl font-bold text-red-600">{inactiveUsersCount}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التجار / البائعون</p>
                <p className="text-2xl font-bold">{merchantsCount} / {sellersCount}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="merchant">التجار</SelectItem>
                <SelectItem value="seller">البائعون</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الفرع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة المستخدمين ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.username}</h3>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {user.email && <p>📧 {user.email}</p>}
                        {user.phone && <p>📱 {user.phone}</p>}
                        {user.nationalId && <p>🆔 {user.nationalId}</p>}
                        <p>📅 تاريخ الإنشاء: {new Date(user.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.userRoles.map(userRole => (
                          <div key={userRole.id} className="flex items-center gap-1">
                            <Badge className={getRoleBadgeColor(userRole.role.name)}>
                              {getRoleName(userRole.role.name)}
                            </Badge>
                            <span className="text-sm text-gray-600">({userRole.branch.name})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد مستخدمون مطابقون للبحث</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>
              قم بإنشاء حساب مستخدم جديد وتحديد صلاحياته والفروع التي سيعمل عليها
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">اسم المستخدم *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="أدخل كلمة المرور"
                />
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="أدخل البريد الإلكتروني (اختياري)"
                />
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="أدخل رقم الهاتف (اختياري)"
                />
              </div>

              <div>
                <Label htmlFor="nationalId">الرقم القومي</Label>
                <Input
                  id="nationalId"
                  value={newUser.nationalId}
                  onChange={(e) => setNewUser({...newUser, nationalId: e.target.value})}
                  placeholder="أدخل الرقم القومي (اختياري)"
                />
              </div>

              <div>
                <Label htmlFor="role">الدور *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merchant">تاجر</SelectItem>
                    <SelectItem value="seller">بائع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>الفروع المعين لها *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {branches.map(branch => (
                  <div key={branch.id} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`branch-${branch.id}`}
                      checked={newUser.branches.includes(branch.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewUser({
                            ...newUser,
                            branches: [...newUser.branches, branch.id]
                          })
                        } else {
                          setNewUser({
                            ...newUser,
                            branches: newUser.branches.filter(id => id !== branch.id)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`branch-${branch.id}`} className="text-sm">
                      {branch.name} ({branch.address})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
                إضافة المستخدم
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات المستخدم وصلاحياته والفروع المعين لها
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-username">اسم المستخدم *</Label>
                  <Input
                    id="edit-username"
                    value={editUser.username}
                    onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone">رقم الهاتف</Label>
                  <Input
                    id="edit-phone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-nationalId">الرقم القومي</Label>
                  <Input
                    id="edit-nationalId"
                    value={editUser.nationalId}
                    onChange={(e) => setEditUser({...editUser, nationalId: e.target.value})}
                    placeholder="أدخل الرقم القومي"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="edit-isActive"
                  checked={editUser.isActive}
                  onCheckedChange={(checked) => setEditUser({...editUser, isActive: checked})}
                />
                <Label htmlFor="edit-isActive">حساب نشط</Label>
              </div>

              <div>
                <Label>إدارة الصلاحيات والفروع</Label>
                <div className="space-y-2 mt-2">
                  {branches.map(branch => {
                    const currentRole = editUser.roles.find(r => r.branchId === branch.id)
                    return (
                      <div key={branch.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="checkbox"
                              id={`edit-branch-${branch.id}`}
                              checked={!!currentRole}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditUser({
                                    ...editUser,
                                    roles: [...editUser.roles, { roleId: 'seller', branchId: branch.id }]
                                  })
                                } else {
                                  setEditUser({
                                    ...editUser,
                                    roles: editUser.roles.filter(r => r.branchId !== branch.id)
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`edit-branch-${branch.id}`} className="font-medium">
                              {branch.name}
                            </Label>
                          </div>
                          
                          {currentRole && (
                            <Select 
                              value={currentRole.roleId} 
                              onValueChange={(value) => {
                                setEditUser({
                                  ...editUser,
                                  roles: editUser.roles.map(r => 
                                    r.branchId === branch.id ? { ...r, roleId: value } : r
                                  )
                                })
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="merchant">تاجر</SelectItem>
                                <SelectItem value="seller">بائع</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700">
                  تحديث البيانات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}