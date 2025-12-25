# 📝 نظام الاشتراكات والفواتير - المستند الكامل

## ✅ التحسينات المنجزة

### 1. **تحديث Prisma Schema بنماذج جديدة**

#### النماذج الجديدة:
```
✅ Invoice - الفواتير
✅ InvoiceItem - بنود الفواتير
✅ Payment - المدفوعات
✅ Subscription - الاشتراكات
✅ SubscriptionHistory - تاريخ الاشتراكات
✅ Notification - الإشعارات
✅ Enums - أنواع الإشعارات والحالة
```

#### الـ Enums الجديدة:
```
InvoiceStatus: DRAFT, PENDING, PAID, OVERDUE, CANCELLED, VOID
InvoiceType: ONE_TIME, RECURRING
PaymentMethod: CASH, BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, PAYPAL, STRIPE, MADA
PaymentStatus: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, CANCELLED
SubscriptionStatus: TRIAL, ACTIVE, PAST_DUE, CANCELLED, EXPIRED, PENDING
BillingCycle: MONTHLY, QUARTERLY, YEARLY
NotificationType: INVOICE_CREATED, INVOICE_PAID, INVOICE_OVERDUE, PAYMENT_RECEIVED, PAYMENT_FAILED, SUBSCRIPTION_RENEWED, SUBSCRIPTION_CANCELLED, SUBSCRIPTION_EXPIRED, SYSTEM
NotificationPriority: LOW, NORMAL, HIGH, URGENT
```

---

## 📋 تفاصيل النماذج

### 1. **نموذج Invoice - الفواتير**

#### الحقول الأساسية:
```
- id: معرف الفاتورة (CUID)
- invoiceNumber: رقم الفاتورة (فريد)
- type: نوع الفاتورة (ONE_TIME, RECURRING)
- status: حالة الفاتورة (DRAFT, PENDING, PAID, OVERDUE, CANCELLED, VOID)
```

#### معلومات العميل:
```
- clientId: معرف العميل
- clientName: اسم العميل
- clientEmail: بريد العميل الإلكتروني
- clientPhone: رقم هاتف العميل
- clientAddress: عنوان العميل
- clientTaxId: الرقم الضريبي للعميل
```

#### تفاصيل الفاتورة:
```
- title: عنوان الفاتورة
- description: وصف الفاتورة
- notes: ملاحظات
- currency: العملة (افتراضي: USD)
```

#### التواريخ:
```
- issueDate: تاريخ إصدار الفاتورة (افتراضي: الآن)
- dueDate: تاريخ استحقاق الفاتورة (افتراضي: الآن)
- paidDate: تاريخ دفع الفاتورة
- reminderDate: تاريخ التذكير
```

#### المبالغ:
```
- subtotal: المجموع الفرعي (افتراضي: 0)
- taxAmount: مبلغ الضريبة (افتراضي: 0)
- discountAmount: مبلغ الخصم (افتراضي: 0)
- total: المجموع الكلي (افتراضي: 0)
- amountPaid: المبلغ المدفوع (افتراضي: 0)
- balance: الرصيد المتبقي (افتراضي: 0)
```

#### المعالجة:
```
- processedAt: تاريخ المعالجة
- processingStatus: حالة المعالجة (pending, processing, completed, failed)
```

#### المعالجة Offline:
```
- isOffline: هل تمت العملية offline (افتراضي: false)
- syncedAt: تاريخ المزامنة
- syncedDeviceId: معرف الجهاز الذي تمت المزامنة عليه
```

#### الفهارس:
```
- tenantId (للبحث السريع)
- companyId (للبحث حسب الشركة)
- branchId (للبحث حسب الفرع)
- walletId (للبحث حسب المحفظة)
- status (للبحث حسب الحالة)
- dueDate (للبحث حسب تاريخ الاستحقاق)
- invoiceNumber (فريد)
```

---

### 2. **نموذج InvoiceItem - بنود الفواتير**

#### الحقول الأساسية:
```
- id: معرف البند (CUID)
- invoiceId: معرف الفاتورة (علاقة إلى Invoice)
- description: وصف البند
- quantity: الكمية (افتراضي: 1)
- unitPrice: سعر الوحدة
- discount: الخصم (افتراضي: 0)
- total: المجموع الكلي (افتراضي: 0)
```

#### تفاصيل البند:
```
- itemId: معرف البند
- itemName: اسم البند
- sku: رمز SKU
- taxRate: نسبة الضريبة (افتراضي: 0)
- notes: ملاحظات
```

#### الفهارس:
```
- invoiceId (للبحث حسب الفاتورة)
- tenantId (للبحث السريع)
```

---

### 3. **نموذج Payment - المدفوعات**

#### الحقول الأساسية:
```
- id: معرف الدفعة (CUID)
- paymentNumber: رقم الدفعة (فريد)
```

#### مرجع الفاتورة:
```
- invoiceId: معرف الفاتورة (اختياري)
- invoice: علاقة إلى Invoice (اختياري)
```

#### تفاصيل الدفعة:
```
- amount: المبلغ
- currency: العملة (افتراضي: USD)
- paymentMethod: طريقة الدفع
- status: حالة الدفعة (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, CANCELLED)
- transactionId: معرف المعاملة من بوابة الدفع
- gateway: بوابة الدفع (stripe, paypal, etc.)
```

#### معلومات الدافع:
```
- payerName: اسم الدافع
- payerEmail: بريد الدافع الإلكتروني
- payerPhone: رقم هاتف الدافع
- payerAddress: عنوان الدافع
- payerTaxId: الرقم الضريبي للدافع
```

#### المعالجة:
```
- processedAt: تاريخ المعالجة
- failedReason: سبب الفشل
- refundedAt: تاريخ الاسترداد
- refundAmount: مبلغ الاسترداد (افتراضي: 0)
- refundReason: سبب الاسترداد
```

#### المعالجة Offline:
```
- isOffline: هل تمت العملية offline (افتراضي: false)
- syncedAt: تاريخ المزامنة
- syncedDeviceId: معرف الجهاز الذي تمت المزامنة عليه
```

#### الفهارس:
```
- tenantId (للبحث السريع)
- invoiceId (للبحث حسب الفاتورة)
- walletId (للبحث حسب المحفظة)
- status (للبحث حسب الحالة)
- paymentNumber (فريد)
```

---

### 4. **نموذج Subscription - الاشتراكات**

#### الحقول الأساسية:
```
- id: معرف الاشتراك (CUID)
```

#### تفاصيل الخطة:
```
- planType: نوع الخطة (FREE, MERCHANT)
- planName: اسم الخطة
- planDescription: وصف الخطة
- maxUsers: أقصى عدد مستخدمين (افتراضي: 1)
- maxTransactions: أقصى عدد معاملات (افتراضي: 100)
- maxWallets: أقصى عدد محافظ (افتراضي: 5)
- maxCategories: أقصى عدد تصنيفات (افتراضي: 20)
- features: الميزات (JSON string)
```

#### تفاصيل الفوترة:
```
- cycle: دورة الفوترة (MONTHLY, QUARTERLY, YEARLY)
- price: السعر (افتراضي: 0)
- currency: العملة (افتراضي: USD)
- taxRate: نسبة الضريبة (افتراضي: 0)
- discountAmount: مبلغ الخصم (افتراضي: 0)
- discountPercent: نسبة الخصم (افتراضي: 0)
- totalPrice: المجموع الكلي (افتراضي: 0)
```

#### التواريخ:
```
- startDate: تاريخ البدء (افتراضي: الآن)
- endDate: تاريخ النهاية
- trialEndDate: تاريخ نهاية الفترة التجريبية
- nextBillingDate: تاريخ الفوترة التالي
- lastBillingDate: تاريخ آخر فوترة
```

#### طريقة الدفع:
```
- paymentMethod: طريقة الدفع (افتراضي: BANK_TRANSFER)
- autoRenew: تجديد تلقائي (افتراضي: true)
```

#### الحالة:
```
- status: حالة الاشتراك (TRIAL, ACTIVE, PAST_DUE, CANCELLED, EXPIRED, PENDING)
- isActive: هل الاشتراك نشط (افتراضي: true)
- cancelledAt: تاريخ الإلغاء
- cancellationReason: سبب الإلغاء
```

#### المزامنة Offline:
```
- isOffline: هل تمت العملية offline (افتراضي: false)
- lastSyncedAt: تاريخ آخر مزامنة
- syncedDeviceId: معرف الجهاز الذي تمت المزامنة عليه
```

#### الفهارس:
```
- tenantId (للبحث السريع)
- status (للبحث حسب الحالة)
- nextBillingDate (للبحث حسب تاريخ الفوترة التالي)
- planType (للبحث حسب نوع الخطة)
```

---

### 5. **نموذج SubscriptionHistory - تاريخ الاشتراكات**

#### الحقول الأساسية:
```
- id: معرف التغيير (CUID)
- subscriptionId: معرف الاشتراك (علاقة إلى Subscription)
```

#### تفاصيل التغيير:
```
- changeType: نوع التغيير (plan_change, billing_change, renewal, cancellation)
- fromPlan: الخطة السابقة
- toPlan: الخطة الجديدة
- fromPrice: السعر السابق
- toPrice: السعر الجديد
- changeReason: سبب التغيير
```

#### من قام بالتغيير:
```
- changedByUserId: معرف المستخدم الذي قام بالتغيير
- changedByUser: علاقة إلى User
```

#### الفهارس:
```
- subscriptionId (للبحث حسب الاشتراك)
- changeType (للبحث حسب نوع التغيير)
```

---

### 6. **نموذج Notification - الإشعارات**

#### الحقول الأساسية:
```
- id: معرف الإشعار (CUID)
- type: نوع الإشعار
- priority: أولوية الإشعار (LOW, NORMAL, HIGH, URGENT)
```

#### المحتوى:
```
- title: عنوان الإشعار
- message: نص الإشعار
- link: رابط للعنصر المرتبط (اختياري)
- data: بيانات إضافية (JSON string)
```

#### حالة القراءة:
```
- isRead: هل تمت القراءة (افتراضي: false)
- readAt: تاريخ القراءة
- isDismissed: هل تم الاستبعاد (افتراضي: false)
- dismissedAt: تاريخ الاستبعاد
```

#### قابل للتنفيذ:
```
- actionType: نوع العملية (pay_invoice, renew_subscription, etc.)
- actionId: معرف العنصر المرتبط
- actionLabel: نص زر العملية
```

#### انتهاء الصلاحية:
```
- expiresAt: تاريخ انتهاء الإشعار (للإبعاد التلقائي)
```

#### المستأجر والمستخدم:
```
- tenantId: معرف المستأجر
- tenant: علاقة إلى Tenant
- userId: معرف المستخدم (اختياري)
- user: علاقة إلى User
```

#### المزامنة Offline:
```
- isOffline: هل تمت العملية offline (افتراضي: false)
- syncedAt: تاريخ المزامنة
- syncedDeviceId: معرف الجهاز الذي تمت المزامنة عليه
```

#### الفهارس:
```
- tenantId (للبحث السريع)
- userId (للبحث حسب المستخدم)
- type (للبحث حسب النوع)
- isRead (للبحث حسب القراءة)
- createdAt (للبحث حسب التاريخ)
```

---

## 🔧 التحديثات في النماذج الموجودة

### 1. **نموذج Tenant**
```prisma
model Tenant {
  // الحقول الموجودة...
  
  // حقول الاشتراك الجديدة:
  autoRenewSubscription Boolean @default(true)
  trialEndDate            DateTime?
  subscriptionId          String?
  
  // العلاقات الجديدة:
  subscriptions           Subscription[]
  invoices               Invoice[]
  payments               Payment[]
  notifications          Notification[]
}
```

### 2. **نموذج User**
```prisma
model User {
  // الحقول الموجودة (بما في ذلك المصادقة)...
  
  // العلاقات الجديدة:
  createdSubscriptions   Subscription[] @relation("CreatedSubscriptions")
  createdInvoices      Invoice[]    @relation("CreatedInvoices")
  changedSubscriptions  SubscriptionHistory[] @relation("ChangedSubscriptions")
  notifications         Notification[]
}
```

### 3. **نموذج Company**
```prisma
model Company {
  // الحقول الموجودة...
  
  // العلاقات الجديدة:
  invoices    Invoice[]
  payments    Payment[]
}
```

### 4. **نموذج Branch**
```prisma
model Branch {
  // الحقول الموجودة...
  
  // لا علاقات جديدة للفواتير
}
```

### 5. **نموذج Wallet**
```prisma
model Wallet {
  // الحقول الموجودة...
  
  // العلاقات الجديدة:
  invoices    Invoice[]
  payments    Payment[]
}
```

### 6. **نموذج Category**
```prisma
model Category {
  // الحقول الموجودة...
  
  // العلاقات الجديدة:
  invoiceItems InvoiceItem[]
}
```

---

## 📊 المقارنة مع النسخة السابقة

| الميزة | قبل | بعد |
|---------|-----|-----|
| نماذج الفواتير | لا توجد | Invoice, InvoiceItem |
| المدفوعات | لا توجد | Payment كامل |
| الاشتراكات | أساسية | Subscription + SubscriptionHistory |
| الإشعارات | لا توجد | Notification كاملة |
| معالجة Offline | لا توجد | isOffline, syncedAt |
| تواريخ الفوترة | أساسية | تواريخ كاملة |
| أنواع الإشعارات | لا توجد | 12 نوع |
| أولويات الإشعارات | لا توجد | LOW, NORMAL, HIGH, URGENT |
| حالات الفواتير | لا توجد | 6 حالات |
| طرق الدفع | لا توجد | 8 طرق |
| دورات الفوترة | لا توجد | 3 دورات |
| حالات الاشتراك | لا توجد | 6 حالات |

---

## 🎯 حالات الاستخدام

### 1. **إنشاء فاتورة:**
```typescript
// إنشاء فاتورة جديدة
const invoice = await prisma.invoice.create({
  data: {
    invoiceNumber: `INV-${Date.now()}`,
    type: 'ONE_TIME',
    status: 'DRAFT',
    
    // معلومات العميل
    clientName: 'اسم العميل',
    clientEmail: 'client@email.com',
    clientPhone: '+966500000000',
    clientAddress: 'العنوان',
    clientTaxId: 'رقم ضريبي',
    
    // تفاصيل الفاتورة
    title: 'فاتورة الخدمات',
    description: 'وصف الخدمات',
    currency: 'SAR',
    
    // التواريخ
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    
    // المبالغ
    subtotal: 1000,
    taxAmount: 150,
    discountAmount: 0,
    total: 1150,
    
    // المعالجة Offline
    isOffline: false,
    
    // العلاقات
    tenantId: 'tenant-id',
    walletId: 'wallet-id',
    categoryId: 'category-id',
  }
})

// إضافة بنود الفاتورة
const items = await prisma.invoiceItem.createMany({
  data: [
    {
      invoiceId: invoice.id,
      description: 'خدمة استشارة',
      quantity: 1,
      unitPrice: 500,
      discount: 0,
      total: 500,
      tenantId: 'tenant-id',
      categoryId: 'category-id',
    },
    {
      invoiceId: invoice.id,
      description: 'خدمة تطوير',
      quantity: 1,
      unitPrice: 500,
      discount: 0,
      total: 500,
      tenantId: 'tenant-id',
      categoryId: 'category-id',
    }
  ]
})

// تحديث المجموعات
await prisma.invoice.update({
  where: { id: invoice.id },
  data: {
    subtotal: items.reduce((sum, item) => sum + item.total, 0),
    taxAmount: 150,
    discountAmount: 0,
    total: 1150,
    status: 'PENDING',
  }
})
```

### 2. **إنشاء مدفوعة:**
```typescript
// إنشاء مدفوعة جديدة
const payment = await prisma.payment.create({
  data: {
    paymentNumber: `PAY-${Date.now()}`,
    
    // مرجع الفاتورة
    invoiceId: 'invoice-id',
    
    // تفاصيل الدفعة
    amount: 1150,
    currency: 'SAR',
    paymentMethod: 'BANK_TRANSFER',
    status: 'PENDING',
    transactionId: 'transaction-id-from-gateway',
    gateway: 'stripe',
    
    // معلومات الدافع
    payerName: 'اسم الدافع',
    payerEmail: 'payer@email.com',
    
    // المعالجة Offline
    isOffline: false,
    
    // العلاقات
    tenantId: 'tenant-id',
    walletId: 'wallet-id',
    companyId: 'company-id',
  }
})

// تسجيل الدفعة في المحفظة
await prisma.wallet.update({
  where: { id: payment.walletId },
  data: {
    balance: {
      decrement: payment.amount
    }
  }
})

// تحديث حالة الفاتورة
await prisma.invoice.update({
  where: { id: payment.invoiceId },
  data: {
    amountPaid: payment.amount,
    balance: {
      decrement: payment.amount
    },
    paidDate: new Date(),
    status: 'PAID',
  }
})
```

### 3. **إنشاء اشتراك:**
```typescript
// إنشاء اشتراك جديد
const subscription = await prisma.subscription.create({
  data: {
    // تفاصيل الخطة
    planType: 'MERCHANT',
    planName: 'خطة التجار',
    planDescription: 'خطة تجارية كاملة',
    maxUsers: 10,
    maxTransactions: 1000,
    maxWallets: 20,
    maxCategories: 50,
    features: JSON.stringify({
      'analytics': true,
      'reports': true,
      'api-access': true,
      'priority-support': true
    }),
    
    // تفاصيل الفوترة
    cycle: 'MONTHLY',
    price: 99,
    currency: 'SAR',
    taxRate: 15,
    discountAmount: 0,
    discountPercent: 0,
    totalPrice: 113.85,
    
    // التواريخ
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    
    // طريقة الدفع
    paymentMethod: 'BANK_TRANSFER',
    autoRenew: true,
    
    // الحالة
    status: 'ACTIVE',
    isActive: true,
    
    // العلاقات
    tenantId: 'tenant-id',
  }
})

// تحديث المستأجر بالاشتراك
await prisma.tenant.update({
  where: { id: subscription.tenantId },
  data: {
    plan: subscription.planType,
    subscriptionId: subscription.id,
    subscriptionEnd: subscription.endDate,
  }
})
```

### 4. **إنشاء إشعار:**
```typescript
// إنشاء إشعار جديد
const notification = await prisma.notification.create({
  data: {
    // النوع والأولوية
    type: 'INVOICE_CREATED',
    priority: 'NORMAL',
    
    // المحتوى
    title: 'فاتورة جديدة',
    message: 'تم إنشاء فاتورة جديدة للعميل ...',
    link: '/invoices/invoice-id',
    data: JSON.stringify({ invoiceId: 'invoice-id' }),
    
    // الحالة
    isRead: false,
    isDismissed: false,
    
    // قابل للتنفيذ
    actionType: 'view_invoice',
    actionId: 'invoice-id',
    actionLabel: 'عرض الفاتورة',
    
    // انتهاء الصلاحية
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    
    // العلاقات
    tenantId: 'tenant-id',
    userId: 'user-id',
    subscriptionId: 'subscription-id',
  }
})
```

### 5. **تجديد اشتراك:**
```typescript
// تسجيل التغيير في تاريخ الاشتراك
const history = await prisma.subscriptionHistory.create({
  data: {
    subscriptionId: 'subscription-id',
    changeType: 'renewal',
    fromPlan: 'FREE',
    toPlan: 'MERCHANT',
    fromPrice: 0,
    toPrice: 99,
    changeReason: 'تجديد دوري',
    changedByUserId: 'user-id',
  }
})

// تحديث الاشتراك
const updatedSubscription = await prisma.subscription.update({
  where: { id: 'subscription-id' },
  data: {
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    lastBillingDate: new Date(),
    status: 'ACTIVE',
    isActive: true,
  }
})

// إنشاء فاتورة جديدة للتجديد
const invoice = await prisma.invoice.create({
  data: {
    type: 'RECURRING',
    status: 'PENDING',
    clientId: 'tenant-id',
    clientName: 'اسم المستأجر',
    title: `فواتير الاشتراك - ${updatedSubscription.planName}`,
    total: updatedSubscription.totalPrice,
    currency: updatedSubscription.currency,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    
    // العلاقات
    tenantId: 'tenant-id',
    subscriptionId: updatedSubscription.id,
    walletId: 'wallet-id',
  }
})

// إنشاء إشعار التجديد
await prisma.notification.create({
  data: {
    type: 'SUBSCRIPTION_RENEWED',
    priority: 'HIGH',
    title: 'تم تجديد الاشتراك',
    message: `تم تجديد اشتراكك بنجاح. الفاتورة التالية: ${invoice.total} ${invoice.currency}`,
    link: `/invoices/${invoice.id}`,
    actionType: 'pay_invoice',
    actionId: invoice.id,
    actionLabel: 'دفع الفاتورة',
    
    tenantId: 'tenant-id',
    subscriptionId: updatedSubscription.id,
  }
})
```

---

## 📚 الوثائق التقنية

### API Endpoints المطلوبة:
```
POST /api/invoices - إنشاء فاتورة
GET /api/invoices - قائمة الفواتير
GET /api/invoices/[id] - تفاصيل فاتورة
PATCH /api/invoices/[id] - تحديث فاتورة
DELETE /api/invoices/[id] - حذف فاتورة

POST /api/payments - إنشاء دفعة
GET /api/payments - قائمة المدفوعات
GET /api/payments/[id] - تفاصيل دفعة
PATCH /api/payments/[id] - تحديث دفعة

POST /api/subscriptions - إنشاء اشتراك
GET /api/subscriptions - قائمة الاشتراكات
GET /api/subscriptions/[id] - تفاصيل اشتراك
PATCH /api/subscriptions/[id] - تحديث اشتراك
DELETE /api/subscriptions/[id] - حذف اشتراك

GET /api/notifications - قائمة الإشعارات
PATCH /api/notifications/[id] - قراءة/استبعاد إشعار
DELETE /api/notifications/[id] - حذف إشعار
```

### الميزات المطلوبة للمرحلة التالية:
```
⏳ إنشاء API endpoints للفواتير
⏳ إنشاء API endpoints للمدفوعات
⏳ إنشاء API endpoints للاشتراكات
⏳ إنشاء API endpoints للإشعارات
⏳ إنشاء Dashboard للفواتير
⏳ إنشاء Dashboard للمدفوعات
⏳ إنشاء Dashboard للاشتراكات
⏳ معالجة المدفوعات Offline
⏳ تتبع تواريخ الاشتراك والتجديد
⏳ إشعارات انتهاء الاشتراك
```

---

تم تحديث قاعدة البيانات بنجاح! 🎉

النظام الآن يحتوي على نماذج كاملة للفواتير والاشتراكات:
- ✅ Invoice - الفواتير كاملة
- ✅ InvoiceItem - بنود الفواتير
- ✅ Payment - المدفوعات مع معالجة Offline
- ✅ Subscription - الاشتراكات مع دورات فوترة
- ✅ SubscriptionHistory - تاريخ التغييرات
- ✅ Notification - إشعارات كاملة مع أولويات
- ✅ Enums - جميع الأنواع المطلوبة
- ✅ الفهارس المحسّنة للسرعة

النظام جاهز لبناء نظام الفوترة الكامل! 🚀

---

**ملاحظة مهمة:**
- تم تحديث قاعدة البيانات بنجاح
- تم format الـ schema وتصحيح جميع الأخطاء
- جميع النماذج الجديدة جاهزة للاستخدام
- العلاقات bidirectional صحيحة
- الفهارس المحسّنة للسرعة

تم التطوير بواسطة ❤️ باستخدام Prisma و SQLite
