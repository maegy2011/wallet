export type Permission = string
export type Role = string

export interface PermissionDefinition {
  name: Permission
  description: string
  category: string
}

export interface RoleDefinition {
  name: Role
  description: string
  permissions: Permission[]
  isSystemRole?: boolean // Cannot be deleted
}

export const PERMISSIONS: PermissionDefinition[] = [
  // User Management
  {
    name: 'users:read',
    description: 'عرض قائمة المستخدمين',
    category: 'إدارة المستخدمين'
  },
  {
    name: 'users:create',
    description: 'إنشاء مستخدم جديد',
    category: 'إدارة المستخدمين'
  },
  {
    name: 'users:update',
    description: 'تعديل بيانات المستخدم',
    category: 'إدارة المستخدمين'
  },
  {
    name: 'users:delete',
    description: 'حذف المستخدم',
    category: 'إدارة المستخدمين'
  },
  {
    name: 'users:manage_status',
    description: 'تغيير حالة المستخدم',
    category: 'إدارة المستخدمين'
  },

  // Account Management
  {
    name: 'accounts:read',
    description: 'عرض الحسابات',
    category: 'إدارة الحسابات'
  },
  {
    name: 'accounts:create',
    description: 'إنشاء حساب جديد',
    category: 'إدارة الحسابات'
  },
  {
    name: 'accounts:update',
    description: 'تعديل بيانات الحساب',
    category: 'إدارة الحسابات'
  },
  {
    name: 'accounts:delete',
    description: 'حذف الحساب',
    category: 'إدارة الحسابات'
  },
  {
    name: 'accounts:manage_balance',
    description: 'إدارة رصيد الحساب',
    category: 'إدارة الحسابات'
  },

  // Transaction Management
  {
    name: 'transactions:read',
    description: 'عرض المعاملات',
    category: 'إدارة المعاملات'
  },
  {
    name: 'transactions:create',
    description: 'إنشاء معاملة جديدة',
    category: 'إدارة المعاملات'
  },
  {
    name: 'transactions:approve',
    description: 'الموافقة على المعاملات',
    category: 'إدارة المعاملات'
  },
  {
    name: 'transactions:reject',
    description: 'رفض المعاملات',
    category: 'إدارة المعاملات'
  },

  // Admin Functions
  {
    name: 'admin:dashboard',
    description: 'الوصول لوحة تحكم المشرفين',
    category: 'وظائف المشرفين'
  },
  {
    name: 'admin:system_settings',
    description: 'إعدادات النظام',
    category: 'وظائف المشرفين'
  },
  {
    name: 'admin:audit_logs',
    description: 'عرض سجلات التدقيق',
    category: 'وظائف المشرفين'
  },
  {
    name: 'admin:manage_roles',
    description: 'إدارة الأدوار والصلاحيات',
    category: 'وظائف المشرفين'
  },

  // User Permissions
  {
    name: 'user:profile',
    description: 'عرض وتعديل الملف الشخصي',
    category: 'صلاحيات المستخدم'
  },
  {
    name: 'user:transactions',
    description: 'إجراء المعاملات المالية',
    category: 'صلاحيات المستخدم'
  },
  {
    name: 'user:accounts',
    description: 'إدارة الحسابات الشخصية',
    category: 'صلاحيات المستخدم'
  }
]

export const ROLES: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'مدير النظام - صلاحيات كاملة',
    permissions: PERMISSIONS.map(p => p.name),
    isSystemRole: true
  },
  {
    name: 'ADMIN',
    description: 'مشرف - صلاحيات إدارية محدودة',
    permissions: [
      'users:read',
      'users:update',
      'users:manage_status',
      'accounts:read',
      'accounts:update',
      'transactions:read',
      'transactions:approve',
      'transactions:reject',
      'admin:dashboard',
      'admin:audit_logs'
    ],
    isSystemRole: true
  },
  {
    name: 'USER',
    description: 'مستخدم عادي - صلاحيات أساسية',
    permissions: [
      'user:profile',
      'user:transactions',
      'user:accounts',
      'accounts:read',
      'transactions:read'
    ],
    isSystemRole: true
  },
  {
    name: 'VERIFIED_USER',
    description: 'مستخدم موثق - صلاحيات إضافية',
    permissions: [
      'user:profile',
      'user:transactions',
      'user:accounts',
      'accounts:read',
      'accounts:create',
      'transactions:read',
      'transactions:create'
    ],
    isSystemRole: true
  }
]

export class PermissionManager {
  /**
   * Get all available permissions
   */
  static getAllPermissions(): PermissionDefinition[] {
    return PERMISSIONS
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): RoleDefinition[] {
    return ROLES
  }

  /**
   * Get permissions for a specific role
   */
  static getRolePermissions(roleName: string): Permission[] {
    const role = ROLES.find(r => r.name === roleName)
    return role?.permissions || []
  }

  /**
   * Check if a role has a specific permission
   */
  static hasPermission(roleName: string, permission: Permission): boolean {
    const rolePermissions = this.getRolePermissions(roleName)
    return rolePermissions.includes(permission)
  }

  /**
   * Get all permissions for a user (including role permissions)
   */
  static getUserPermissions(userRole: string, userPermissions: Permission[] = []): Permission[] {
    const rolePermissions = this.getRolePermissions(userRole)
    return [...new Set([...rolePermissions, ...userPermissions])]
  }

  /**
   * Check if user has a specific permission
   */
  static canUserDo(userRole: string, permission: Permission, userPermissions: Permission[] = []): boolean {
    const allPermissions = this.getUserPermissions(userRole, userPermissions)
    return allPermissions.includes(permission)
  }

  /**
   * Get permissions by category
   */
  static getPermissionsByCategory(category: string): PermissionDefinition[] {
    return PERMISSIONS.filter(p => p.category === category)
  }

  /**
   * Get all categories
   */
  static getCategories(): string[] {
    const categories = PERMISSIONS.map(p => p.category)
    return [...new Set(categories)]
  }

  /**
   * Validate if a permission exists
   */
  static isValidPermission(permission: Permission): boolean {
    return PERMISSIONS.some(p => p.name === permission)
  }

  /**
   * Validate if a role exists
   */
  static isValidRole(role: Role): boolean {
    return ROLES.some(r => r.name === role)
  }

  /**
   * Get system roles (cannot be deleted)
   */
  static getSystemRoles(): RoleDefinition[] {
    return ROLES.filter(r => r.isSystemRole)
  }

  /**
   * Get custom roles (can be modified/deleted)
   */
  static getCustomRoles(): RoleDefinition[] {
    return ROLES.filter(r => !r.isSystemRole)
  }
}