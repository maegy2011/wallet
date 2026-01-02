'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { ReactNextCaptcha } from '@/components/ReactNextCaptcha';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DashboardStats {
  customers: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    growthRate: number;
  };
  financial: {
    totalInvoices: number;
    totalInvoiceValue: number;
    paidInvoices: number;
    paidInvoiceValue: number;
    overdueInvoices: number;
    overdueInvoiceValue: number;
    collectionRate: number;
  };
  subscriptions: {
    total: number;
    trial: number;
    active: number;
    expired: number;
    cancelled: number;
    conversionRate: number;
  };
  system: {
    totalLogins: number;
    recentLogins: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

interface Customer {
  id: string;
  uuid: string;
  name: string;
  businessName?: string;
  email: string;
  mobile: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISABLED' | 'ARCHIVED';
  customerType: 'INDIVIDUAL' | 'COMPANY';
  createdAt: string;
  lastLoginAt?: string;
  metrics: {
    totalSpent: number;
    totalPending: number;
    totalOverdue: number;
    currentSubscription?: {
      packageName: string;
      packageType: 'FREE' | 'PAID';
      status: string;
      endDate: string;
    };
  };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    captchaId: '',
    captchaAnswer: '',
    twoFactorCode: ''
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  
  // Backup state
  const [backups, setBackups] = useState<any[]>([]);
  const [backupStats, setBackupStats] = useState<any>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupConfig, setBackupConfig] = useState({
    includeCustomers: true,
    includeSubscriptions: true,
    includeInvoices: true,
    includePackages: true,
    includeAdminLogs: false,
    encryptBackup: false,
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Handle hash-based tab switching
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['dashboard', 'customers', 'packages', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, [isAuthenticated]);

  const handleCaptchaChange = (success: boolean, captchaId?: string, captchaAnswer?: string) => {
    if (success && captchaId && captchaAnswer) {
      setLoginForm(prev => ({ ...prev, captchaId, captchaAnswer }));
      if (error) {
        setError('');
      }
    } else {
      setLoginForm(prev => ({ ...prev, captchaId: '', captchaAnswer: '' }));
    }
  };

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setIsLoading(false);
        } else {
          localStorage.setItem('adminToken', data.data.token);
          setIsAuthenticated(true);
          fetchDashboardData();
        }
      } else {
        setError(data.error?.message || 'Login failed');
        setLoginForm(prev => ({ ...prev, captchaId: '', captchaAnswer: '' }));
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setLoginForm(prev => ({ ...prev, captchaId: '', captchaAnswer: '' }));
    }
    setIsLoading(false);
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.data.token);
        setIsAuthenticated(true);
        setRequiresTwoFactor(false);
        fetchDashboardData();
      } else {
        setError(data.error?.message || 'Two-factor authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch statistics
      const statsResponse = await fetch('/api/admin/dashboard/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch customers
      const customersResponse = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.data.customers);
      }

      // Fetch backups
      fetchBackups();
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  // Backup functions
  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/backup', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.data.backups);
        setBackupStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backupConfig),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backup created:', data.data);
        await fetchBackups(); // Refresh backup list
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      setError('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${backupId}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to download backup');
      }
    } catch (error) {
      console.error('Failed to download backup:', error);
      setError('Failed to download backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchBackups(); // Refresh backup list
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to delete backup');
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      setError('Failed to delete backup');
    }
  };

  const handleBackupUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backup restored:', data.data);
        await fetchDashboardData(); // Refresh all data
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to restore backup');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setError('Failed to restore backup');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setStats(null);
    setCustomers([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Mahfza Admin</CardTitle>
              <p className="text-gray-600">Sign in to admin dashboard</p>
            </CardHeader>
            <CardContent>
              {!requiresTwoFactor ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="admin@mahfza.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <ReactNextCaptcha
                    onVerify={handleCaptchaChange}
                    theme="light"
                    lang="en"
                  />

                  <Button type="submit" className="w-full" disabled={isLoading || !loginForm.captchaId || !loginForm.captchaAnswer}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Enter your 2FA code to continue</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twoFactorCode">2FA Code</Label>
                    <Input
                      id="twoFactorCode"
                      type="text"
                      value={loginForm.twoFactorCode}
                      onChange={(e) => setLoginForm({ ...loginForm, twoFactorCode: e.target.value })}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setRequiresTwoFactor(false)}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" id="dashboard" className="space-y-6">
            {stats && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Customer Stats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.customers.total}</div>
                      <p className="text-xs text-muted-foreground">
                        +{stats.customers.newThisMonth} this month
                      </p>
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {stats.customers.growthRate.toFixed(1)}% growth
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Stats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">EGP {stats.financial.paidInvoiceValue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.financial.paidInvoices} paid invoices
                      </p>
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stats.financial.collectionRate.toFixed(1)}% collection rate
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Stats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.subscriptions.active}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.subscriptions.trial} on trial
                      </p>
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {stats.subscriptions.conversionRate.toFixed(1)}% conversion
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Stats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">System Activity</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.system.recentLogins}</div>
                      <p className="text-xs text-muted-foreground">
                        Logins this week
                      </p>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(stats.system.uptime / 3600)}h uptime
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {customers.slice(0, 5).map((customer) => (
                          <div key={customer.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                customer.status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Memory Usage</span>
                          <span className="text-sm text-gray-600">
                            {Math.round(stats.system.memoryUsage.heapUsed / 1024 / 1024)} MB
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Logins</span>
                          <span className="text-sm text-gray-600">{stats.system.totalLogins}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Database Status</span>
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Healthy
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" id="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customer Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search customers..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Subscription</th>
                        <th className="text-left py-3 px-4">Total Spent</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{customer.customerType}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              customer.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800'
                                : customer.status === 'INACTIVE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {customer.metrics.currentSubscription ? (
                              <div>
                                <p className="text-sm font-medium">{customer.metrics.currentSubscription.packageName}</p>
                                <p className="text-xs text-gray-600">{customer.metrics.currentSubscription.status}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No subscription</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium">
                              EGP {customer.metrics.totalSpent.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" id="packages">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Package Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">Package management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" id="settings">
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>
            
            {/* Backup and Restore Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Backup & Restore
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Backup Configuration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Create Backup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data to Include</label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={backupConfig.includeCustomers}
                              onChange={(e) => setBackupConfig({...backupConfig, includeCustomers: e.target.checked})}
                              className="rounded" 
                            />
                            <span className="text-sm">Customers</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={backupConfig.includeSubscriptions}
                              onChange={(e) => setBackupConfig({...backupConfig, includeSubscriptions: e.target.checked})}
                              className="rounded" 
                            />
                            <span className="text-sm">Subscriptions</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={backupConfig.includeInvoices}
                              onChange={(e) => setBackupConfig({...backupConfig, includeInvoices: e.target.checked})}
                              className="rounded" 
                            />
                            <span className="text-sm">Invoices</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={backupConfig.includePackages}
                              onChange={(e) => setBackupConfig({...backupConfig, includePackages: e.target.checked})}
                              className="rounded" 
                            />
                            <span className="text-sm">Packages</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={backupConfig.includeAdminLogs}
                              onChange={(e) => setBackupConfig({...backupConfig, includeAdminLogs: e.target.checked})}
                              className="rounded" 
                            />
                            <span className="text-sm">Admin Logs</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Security Options</label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={backupConfig.encryptBackup}
                              onChange={(e) => setBackupConfig({...backupConfig, encryptBackup: e.target.checked})}
                              className="rounded" 
                            />
                            <span className="text-sm">Encrypt Backup</span>
                          </label>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={createBackup}
                          disabled={isCreatingBackup}
                        >
                          {isCreatingBackup ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating Backup...
                            </>
                          ) : (
                            <>
                              <Package className="h-4 w-4 mr-2" />
                              Create Backup
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Backup History */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Backup History</h3>
                    {backupStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{backupStats.totalBackups}</div>
                          <div className="text-sm text-gray-600">Total Backups</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{(backupStats.totalSize / 1024 / 1024).toFixed(1)}MB</div>
                          <div className="text-sm text-gray-600">Total Size</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{backupStats.encryptedBackups}</div>
                          <div className="text-sm text-gray-600">Encrypted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {backupStats.latestBackup ? new Date(backupStats.latestBackup).toLocaleDateString() : '-'}
                          </div>
                          <div className="text-sm text-gray-600">Latest Backup</div>
                        </div>
                      </div>
                    )}
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Size</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Records</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {backups.length === 0 ? (
                            <tr>
                              <td className="px-4 py-2 text-sm">No backups available</td>
                              <td className="px-4 py-2 text-sm">-</td>
                              <td className="px-4 py-2 text-sm">-</td>
                              <td className="px-4 py-2 text-sm">-</td>
                              <td className="px-4 py-2 text-sm">-</td>
                            </tr>
                          ) : (
                            backups.map((backup) => (
                              <tr key={backup.id}>
                                <td className="px-4 py-2 text-sm">
                                  {new Date(backup.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {(backup.size / 1024).toFixed(1)}KB
                                </td>
                                <td className="px-4 py-2 text-sm">{backup.recordCount}</td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    backup.config.encryptBackup 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {backup.config.encryptBackup ? 'Encrypted' : 'Standard'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadBackup(backup.id)}
                                    >
                                      Download
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteBackup(backup.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Restore Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Restore from Backup</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Upload a backup file to restore data
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        id="backup-upload"
                        onChange={handleBackupUpload}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('backup-upload')?.click()}
                      >
                        Upload Backup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}