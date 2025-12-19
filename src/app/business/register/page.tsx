'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Trash2, Building, Store, Phone, Mail, MapPin, FileText } from 'lucide-react'

interface Branch {
  name: string
  address: string
  phone: string
  email: string
}

export default function BusinessRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commercialId: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
  })
  const [branches, setBranches] = useState<Branch[]>([
    { name: '', address: '', phone: '', email: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBranchChange = (index: number, field: keyof Branch, value: string) => {
    const updatedBranches = [...branches]
    updatedBranches[index] = { ...updatedBranches[index], [field]: value }
    setBranches(updatedBranches)
  }

  const addBranch = () => {
    setBranches([...branches, { name: '', address: '', phone: '', email: '' }])
  }

  const removeBranch = (index: number) => {
    if (branches.length > 1) {
      setBranches(branches.filter((_, i) => i !== index))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('اسم المنشأة مطلوب')
      return false
    }
    
    if (!formData.phone.trim()) {
      setError('رقم هاتف المنشأة مطلوب')
      return false
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('البريد الإلكتروني غير صحيح')
      return false
    }
    
    // Validate branches
    for (let i = 0; i < branches.length; i++) {
      if (!branches[i].name.trim()) {
        setError(`اسم الفرع ${i + 1} مطلوب`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('الرجاء تسجيل الدخول أولاً')
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          branches: branches.filter(branch => branch.name.trim()),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('تم إنشاء المنشأة التجارية بنجاح!')
        
        // Update business accounts in localStorage
        const currentBusinessAccounts = JSON.parse(localStorage.getItem('businessAccounts') || '[]')
        currentBusinessAccounts.push(data.businessAccount)
        localStorage.setItem('businessAccounts', JSON.stringify(currentBusinessAccounts))
        
        // Redirect to main page after successful registration
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'فشل إنشاء المنشأة التجارية')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Store className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">إنشاء منشأة تجارية</h1>
          <p className="text-gray-600 mt-2">
            قم بإنشاء منشأة تجارية جديدة لإدارة فروع وموظفين
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              العودة للرئيسية
            </Link>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              بيانات المنشأة التجارية
            </CardTitle>
            <CardDescription>
              قم بإدخال بيانات المنشأة التجارية والفروع التابعة لها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">معلومات المنشأة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المنشأة *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم المنشأة"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01xxxxxxxxx"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="وصف المنشأة التجارية"
                    className="text-right"
                    dir="rtl"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commercialId">السجل التجاري</Label>
                    <Input
                      id="commercialId"
                      name="commercialId"
                      type="text"
                      value={formData.commercialId}
                      onChange={handleInputChange}
                      placeholder="رقم السجل التجاري"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxId">الرقم الضريبي</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      type="text"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      placeholder="الرقم الضريبي"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="عنوان المنشأة"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="business@email.com"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Branches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">الفروع</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBranch}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة فرع
                  </Button>
                </div>
                
                {branches.map((branch, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">الفرع {index + 1}</h4>
                      {branches.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBranch(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`branch-name-${index}`}>اسم الفرع *</Label>
                        <Input
                          id={`branch-name-${index}`}
                          type="text"
                          required
                          value={branch.name}
                          onChange={(e) => handleBranchChange(index, 'name', e.target.value)}
                          placeholder="اسم الفرع"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`branch-phone-${index}`}>رقم الهاتف</Label>
                        <Input
                          id={`branch-phone-${index}`}
                          type="tel"
                          value={branch.phone}
                          onChange={(e) => handleBranchChange(index, 'phone', e.target.value)}
                          placeholder="رقم هاتف الفرع"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label htmlFor={`branch-address-${index}`}>العنوان</Label>
                      <Input
                        id={`branch-address-${index}`}
                        type="text"
                        value={branch.address}
                        onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                        placeholder="عنوان الفرع"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label htmlFor={`branch-email-${index}`}>البريد الإلكتروني</Label>
                      <Input
                        id={`branch-email-${index}`}
                        type="email"
                        value={branch.email}
                        onChange={(e) => handleBranchChange(index, 'email', e.target.value)}
                        placeholder="branch@email.com"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري إنشاء المنشأة...
                  </>
                ) : (
                  'إنشاء المنشأة التجارية'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}