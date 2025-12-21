'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  UserPlus,
  Settings,
  Building,
  DollarSign,
  FileText,
  Lock,
  AlertCircle
} from 'lucide-react'

interface User {
  id: string
  username: string
  email?: string
  phone: string
  isActive: boolean
  createdAt: string
  roles: UserRole[]
}

interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}

interface UserRole {
  id: string
  userId: string
  roleId: string
  businessAccountId?: string
  branchId?: string
  isActive: boolean
  assignedAt: string
  role: Role
}

interface BusinessAccount {
  id: string
  name: string
  branches: Array<{
    id: string
    name: string
  }>
}

const availablePermissions = [
  { id: 'view_wallets', name: 'عرض المحافظ', description: 'يمكن عرض جميع المحافظ' },
  { id: 'create_wallets', name: 'إنشاء محافظ', description: 'يمكن إنشاء محافظ جديدة' },
  { id: 'edit_wallets', name: 'تعديل المحافظ', description: 'يمكن تعديل بيانات المحافظ' },
  { id: 'delete_wallets', name: 'حذف المحافظ', description: 'يمكن حذف المحافظ' },
  { id: 'view_transactions', name: 'عرض المعاملات', description: 'يمكن عرض جميع المعاملات' },
  { id: 'create_transactions', name: 'إنشاء معاملات', description: 'يمكن إنشاء معاملات جديدة' },
  { id: 'view_reports', name: 'عرض التقارير', description: 'يمكن عرض التقارير المالية' },
  { id: 'manage_users', name: 'إدارة المستخدمين', description: 'يمكن إدارة صلاحيات المستخدمين' },
  { id: 'manage_branches', name: 'إدارة الفروع', description: 'يمكن إدارة فروع الشركة' },
  { id: 'view_cash_treasury', name: 'عرض الخزينة', description: 'يمكن عرض بيانات الخزينة النقدية' },
  { id: 'manage_cash_treasury', name: 'إدارة الخزينة', description: 'يمكن إدارة الخزينة النقدية' }
]

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [businesses, setBusinesses] = useState<BusinessAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    fetchRoleData()
  }, [])

  const fetchRoleData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch users with roles
      const usersResponse = await fetch('/api/admin/users')
      if (!usersResponse.ok) {
        const errorData = await usersResponse.json()
        throw new Error(errorData.error || 'Failed to fetch users')
      }
      const usersData = await usersResponse.json()
      
      // Fetch roles
      const rolesResponse = await fetch('/api/admin/roles')
      if (!rolesResponse.ok) {
        const errorData = await rolesResponse.json()
        throw new Error(errorData.error || 'Failed to fetch roles')
      }
      const rolesData = await rolesResponse.json()
      
      // Fetch businesses
      const businessesResponse = await fetch('/api/admin/businesses')
      if (!businessesResponse.ok) {
        const errorData = await businessesResponse.json()
        throw new Error(errorData.error || 'Failed to fetch businesses')
      }
      const businessesData = await businessesResponse.json()
      
      setUsers(usersData)
      setRoles(rolesData)
      setBusinesses(businessesData)
    } catch (err) {
      console.error('Role management fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load role management data')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleAssignment = async () => {
    if (!selectedUser || !selectedRoleId) {
      setError('يرجى اختيار المستخدم والدور')
      return
    }

    try {
      const response = await fetch('/api/admin/users/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          roleId: selectedRoleId, 
          businessAccountId: selectedBusinessId || undefined, 
          branchId: selectedBranchId || undefined 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign role')
      }
      
      await fetchRoleData()
      setIsRoleDialogOpen(false)
      setSelectedRoleId('')
      setSelectedBusinessId('')
      setSelectedBranchId('')
    } catch (err) {
      console.error('Role assignment error:', err)
      setError(err instanceof Error ? err.message : 'Failed to assign role')
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name || newRole.permissions.length === 0) {
      setError('يرجى إدخال اسم الدور واختيار صلاحية واحدة على الأقل')
      return
    }

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create role')
      }
      
      await fetchRoleData()
      setIsCreateRoleDialogOpen(false)
      setNewRole({ name: '', description: '', permissions: [] })
    } catch (err) {
      console.error('Role creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create role')
    }
  }

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الأدوار...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الأدوار والصلاحيات</h1>
        <p className="text-gray-600">تعيين وإدارة أدوار وصلاحيات موظفي الشركة</p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>المستخدمون</CardTitle>
                <CardDescription>عرض وإدارة أدوار المستخدمين</CardDescription>
              </div>
              <Button
                onClick={() => setIsRoleDialogOpen(true)}
                disabled={!selectedUser}
              >
                <UserPlus className="h-4 w-4 ml-2" />
                تعيين دور
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الأدوار</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    className={selectedUser?.id === user.id ? 'bg-emerald-50' : ''}
                  >
                    <TableCell>
                      <div className="font-medium">{user.username}</div>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((userRole) => (
                          <Badge key={userRole.id} variant="outline">
                            {userRole.role.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Roles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الأدوار المتاحة</CardTitle>
                <CardDescription>إدارة الأدوار والصلاحيات</CardDescription>
              </div>
              <Button
                onClick={() => setIsCreateRoleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 ml-2" />
                إنشاء دور
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <Card key={role.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{role.name}</h4>
                      {role.description && (
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {availablePermissions.find(p => p.id === permission)?.name || permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعيين دور للمستخدم</DialogTitle>
            <DialogDescription>
              تعيين دور لـ {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">اختر الدور</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="business">الشركة (اختياري)</Label>
                <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشركة" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="branch">الفرع (اختياري)</Label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.flatMap((business) =>
                      business.branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      )) || []
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsRoleDialogOpen(false)
                  setSelectedRoleId('')
                  setSelectedBusinessId('')
                  setSelectedBranchId('')
                }}>
                  إلغاء
                </Button>
                <Button onClick={handleRoleAssignment}>
                  تعيين الدور
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء دور جديد</DialogTitle>
            <DialogDescription>
              إنشاء دور جديد مع تحديد الصلاحيات المناسبة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleName">اسم الدور</Label>
              <Input
                id="roleName"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: مدير فرع"
              />
            </div>
            
            <div>
              <Label htmlFor="roleDescription">الوصف</Label>
              <Input
                id="roleDescription"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف الدور ومسؤولياته"
              />
            </div>
            
            <div>
              <Label>الصلاحيات</Label>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2 space-x-reverse">
                    <Checkbox
                      id={permission.id}
                      checked={newRole.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="text-sm font-medium">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateRole}>
                إنشاء الدور
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}