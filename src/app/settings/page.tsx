'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Download, Upload, Trash2, Settings, Database, Archive, RefreshCw, Loader2, Smartphone, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Wallet {
  id: string
  uuid: string
  name: string
  mobileNumber: string
  logo?: string
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  monthlyTransactions: number
  feeType: string
  feePercentage: number
  feePerThousand: number
  maxFeeAmount: number
  totalFeesEarned: number
  isArchived: boolean
  archivedAt?: string
  createdAt: string
}

interface Transaction {
  id: string
  walletId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  feeAmount: number
  description: string
  date: string
  walletName: string
}

export default function SettingsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState('')
  const [isClearingData, setIsClearingData] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  
  const router = useRouter()

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [walletsResponse, transactionsResponse] = await Promise.all([
          fetch('/api/wallets'),
          fetch('/api/transactions')
        ])
        
        if (walletsResponse.ok && transactionsResponse.ok) {
          const [walletsData, transactionsData] = await Promise.all([
            walletsResponse.json(),
            transactionsResponse.json()
          ])
          setWallets(walletsData)
          setTransactions(transactionsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Clear alert message after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  // Filter archived wallets
  const archivedWallets = wallets.filter(w => w.isArchived)

  // Handle restore wallet
  const handleRestoreWallet = async (wallet: Wallet) => {
    try {
      const response = await fetch(`/api/wallets/${wallet.id}/restore`, {
        method: 'PUT'
      })

      if (response.ok) {
        setWallets(wallets.map(w => w.id === wallet.id ? { ...w, isArchived: false, archivedAt: null } : w))
        setAlertMessage('تم استعادة المحفظة بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء استعادة المحفظة')
    }
  }

  // Handle delete archived wallet permanently
  const handleDeleteWallet = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallets/${walletId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWallets(wallets.filter(w => w.id !== walletId))
        setAlertMessage('تم حذف المحفظة نهائياً')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء حذف المحفظة')
    }
  }

  // Handle clear all data
  const handleClearAllData = async () => {
    setIsClearingData(true)
    try {
      const response = await fetch('/api/settings/clear-data', {
        method: 'DELETE'
      })

      if (response.ok) {
        setWallets([])
        setTransactions([])
        setAlertMessage('تم حذف جميع البيانات بنجاح')
      }
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء حذف البيانات')
    } finally {
      setIsClearingData(false)
    }
  }

  // Handle export data
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        wallets,
        transactions,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wallets-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setAlertMessage('تم تصدير البيانات بنجاح')
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء تصدير البيانات')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import data
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      // Validate import data structure
      if (!importData.wallets || !importData.transactions) {
        throw new Error('ملف غير صالح')
      }

      // Clear existing data first
      await fetch('/api/settings/clear-data', {
        method: 'DELETE'
      })

      // Import wallets
      const walletIdMap = new Map()
      for (const wallet of importData.wallets) {
        const response = await fetch('/api/wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: wallet.name,
            mobileNumber: wallet.mobileNumber,
            logo: wallet.logo,
            feeType: wallet.feeType,
            feePercentage: wallet.feePercentage,
            feePerThousand: wallet.feePerThousand,
            maxFeeAmount: wallet.maxFeeAmount
          })
        })
        
        if (response.ok) {
          const newWallet = await response.json()
          walletIdMap.set(wallet.id, newWallet.id)
        }
      }

      // Import transactions with updated wallet IDs
      for (const transaction of importData.transactions) {
        const newWalletId = walletIdMap.get(transaction.walletId)
        if (newWalletId) {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletId: newWalletId,
              type: transaction.type,
              amount: transaction.amount,
              description: transaction.description,
              date: transaction.date // Keep original date
            })
          })
        }
      }

      // Reload data
      const [walletsResponse, transactionsResponse] = await Promise.all([
        fetch('/api/wallets'),
        fetch('/api/transactions')
      ])
      
      if (walletsResponse.ok && transactionsResponse.ok) {
        const [walletsData, transactionsData] = await Promise.all([
          walletsResponse.json(),
          transactionsResponse.json()
        ])
        setWallets(walletsData)
        setTransactions(transactionsData)
      }

      setAlertMessage('تم استيراد جميع البيانات بنجاح')
    } catch (error) {
      setAlertMessage('حدث خطأ أثناء استيراد البيانات')
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة للرئيسية</span>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">الإعدادات</h1>
            <p className="text-muted-foreground mt-1">إدارة إعدادات التطبيق والبيانات</p>
          </div>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <Alert className="mb-6">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="archived" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="archived">المحافظ المؤرشفة</TabsTrigger>
            <TabsTrigger value="data">إدارة البيانات</TabsTrigger>
            <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          </TabsList>

          {/* Archived Wallets Tab */}
          <TabsContent value="archived">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  المحافظ المؤرشفة
                </CardTitle>
                <CardDescription>
                  المحافظ التي تم أرشفتها ويمكن استعادتها أو حذفها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {archivedWallets.length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">لا توجد محافظ مؤرشفة</p>
                    <p className="text-muted-foreground">المحافظ التي تقوم بأرشفتها ستظهر هنا</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {archivedWallets.map((wallet) => (
                        <div key={wallet.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{wallet.logo || '🏦'}</div>
                              <div>
                                <h3 className="font-semibold">{wallet.name}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Smartphone className="h-3 w-3" />
                                  {wallet.mobileNumber}
                                </p>
                                {wallet.archivedAt && (
                                  <p className="text-xs text-muted-foreground">
                                    تمت الأرشفة: {new Date(wallet.archivedAt).toLocaleDateString('ar-EG')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreWallet(wallet)}
                              >
                                <RefreshCw className="h-3 w-3 ml-1" />
                                استعادة
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف محفظة "{wallet.name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteWallet(wallet.id)}>
                                      حذف نهائياً
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    إدارة البيانات
                  </CardTitle>
                  <CardDescription>
                    إدارة بيانات التطبيق وقاعدة البيانات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">إجمالي المحافظ</h3>
                      <p className="text-2xl font-bold">{wallets.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {wallets.filter(w => !w.isArchived).length} نشط، {wallets.filter(w => w.isArchived).length} مؤرشف
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">إجمالي المعاملات</h3>
                      <p className="text-2xl font-bold">{transactions.length}</p>
                      <p className="text-sm text-muted-foreground">
                        {transactions.filter(t => t.type === 'deposit').length} إيداع، {transactions.filter(t => t.type === 'withdrawal').length} سحب
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-4 text-red-600">إجراءات خطيرة</h3>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف جميع البيانات
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تحذير: حذف جميع البيانات</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء سيحذف جميع المحافظ والمعاملات نهائياً ولا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearAllData} disabled={isClearingData}>
                            {isClearingData ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                            حذف جميع البيانات
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    النسخ الاحتياطي والاستعادة
                  </CardTitle>
                  <CardDescription>
                    تصدير واستيراد بيانات التطبيق
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-4">تصدير البيانات</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      قم بتصدير جميع بياناتك (المحافظ والمعاملات) في ملف واحد للنسخ الاحتياطي
                    </p>
                    <Button onClick={handleExportData} disabled={isExporting} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 ml-2" />
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                      تصدير البيانات
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-4">استيراد البيانات</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      استيراد جميع البيانات من ملف نسخ احتياطي سابق (سيتم حذف البيانات الحالية)
                    </p>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        disabled={isImporting}
                      />
                      {isImporting && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جاري الاستيراد...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}