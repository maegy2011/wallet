const walletNames = [
  'محفظة فودافون كاش',
  'محفظة أورانج موني',
  'محفظة إيدي',
  'محفظة انستا باي',
  'محفظة فوري',
  'محفظة أمان',
  'محفظة سداد',
  'محفظة ميزة',
  'محفظة الراجحي',
  'محفظة الأهلي',
  'محفظة بنك القاهرة',
  'محفظة بنك الإسكندرية',
  'محفظة البنك التجاري',
  'محفظة بنك مصر',
  'محفظة كريد أغريكول',
  'محفظة كريد ليبرتي',
  'محفظة مال',
  'محفظة حياة',
  'محفظة دفع'
];

const transactionDescriptions = [
  'شراء من السوبر ماركت',
  'دفع فاتورة الكهرباء',
  'شحن رصيد هاتف',
  'شراء من المطعم',
  'دفع فاتورة المياه',
  'شراء ملابس',
  'دفع فاتورة الإنترنت',
  'شراء من الصيدلية',
  'دفع اشتراك نتفليكس',
  'شراء من محطه بنزين',
  'دفع فاتورة موبايل',
  'شراء من الكتاب',
  'دفع اشتراك جيم',
  'شراء من السينما',
  'دفع فاتورة غاز',
  'شراء هدية',
  'دفع مصاريف دراسة',
  'شراء من السوق',
  'دفع فاتورة تلفون أرضي',
  'شراء أجهزة إلكترونية',
  'دفع اشتراك سبوتيفاي',
  'شراء من المول',
  'دفع فاتورة سيارة',
  'شراء من متجر ألعاب',
  'دفع مصاريف سفر',
  'شراء من متجر حيوانات',
  'دفع فاتورة تأمين',
  'شراء من متجر زهور',
  'دفع مصاريف علاج',
  'شراء من متجر أدوات منزلية',
  'دفع فاتورة تعليم',
  'شراء من متجر رياضة',
  'دفع مصاريف حفلات',
  'شراء من متجر كتب',
  'دفع فاتورة نظافة',
  'شراء من متجر إلكترونيات',
  'دفع مصاريف سياحة',
  'شراء من متجر مجوهرات',
  'دفع فاتورة بث',
  'شراء من متجر أدوات مكتبية'
];

const feeTypes = ['percentage', 'perThousand', 'fixed'];

function generateMobileNumber() {
  const prefixes = ['010', '011', '012', '015'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 90000000) + 10000000;
  return prefix + suffix;
}

function generateWalletLogo() {
  const logos = ['🏦', '💳', '💰', '💵', '💴', '💶', '💷', '🪙', '🤑', '💸', '📱', '🏪', '🏛️', '🏧', '💼'];
  return logos[Math.floor(Math.random() * logos.length)];
}

function generateAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

// Generate sample data structure
const sampleData = {
  wallets: [],
  transactions: []
};

// Generate 20 wallets
for (let i = 0; i < 20; i++) {
  const feeType = feeTypes[Math.floor(Math.random() * feeTypes.length)];
  let feePercentage = 0;
  let feePerThousand = 0;
  
  if (feeType === 'percentage') {
    feePercentage = Math.floor(Math.random() * 5) + 1; // 1-5%
  } else if (feeType === 'perThousand') {
    feePerThousand = Math.floor(Math.random() * 10) + 2; // 2-11 EGP per 1000
  } else {
    feePercentage = Math.floor(Math.random() * 20) + 5; // 5-25 EGP fixed
  }
  
  const wallet = {
    name: walletNames[i],
    mobileNumber: generateMobileNumber(),
    logo: generateWalletLogo(),
    feeType,
    feePercentage,
    feePerThousand,
    maxFeeAmount: Math.floor(Math.random() * 50) + 10, // 10-60 EGP max fee
    balance: 5000 + Math.floor(Math.random() * 20000), // Start with 5000-25000 EPG
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalFeesEarned: 0,
    monthlyTransactions: 0,
    monthlyLimit: 200000,
    isArchived: false,
    createdAt: generateDate(365),
    updatedAt: new Date().toISOString()
  };
  
  sampleData.wallets.push(wallet);
}

// Generate 20 transactions for each wallet
for (let i = 0; i < sampleData.wallets.length; i++) {
  const wallet = sampleData.wallets[i];
  
  for (let j = 0; j < 20; j++) {
    const type = Math.random() > 0.4 ? 'deposit' : 'withdrawal'; // 60% deposits, 40% withdrawals
    const amount = generateAmount(50, 5000);
    const description = transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)];
    const date = generateDate(90); // Within last 90 days
    
    // Calculate fee
    let feeAmount = 0;
    if (type === 'withdrawal') {
      switch (wallet.feeType) {
        case 'percentage':
          feeAmount = (amount * wallet.feePercentage) / 100;
          break;
        case 'perThousand':
          feeAmount = Math.ceil(amount / 1000) * wallet.feePerThousand;
          break;
        case 'fixed':
          feeAmount = wallet.feePercentage;
          break;
      }
      feeAmount = Math.min(feeAmount, wallet.maxFeeAmount);
    }
    
    // Update wallet totals
    if (type === 'deposit') {
      wallet.totalDeposits += amount;
      wallet.balance += amount;
    } else {
      wallet.totalWithdrawals += amount;
      wallet.totalFeesEarned += feeAmount;
      wallet.balance -= (amount + feeAmount);
    }
    
    const transaction = {
      walletId: `wallet_${i + 1}`, // Will be replaced with actual ID
      type,
      amount,
      feeAmount,
      description,
      date,
      walletName: wallet.name
    };
    
    sampleData.transactions.push(transaction);
  }
  
  wallet.monthlyTransactions = 20;
}

// Add metadata
sampleData.exportDate = new Date().toISOString();
sampleData.version = '1.0';
sampleData.description = 'بيانات وهمية لتطبيق إدارة المحافظ - 20 محفظة و 400 حركة مالية';

console.log('Generated sample data:');
console.log(`- ${sampleData.wallets.length} wallets`);
console.log(`- ${sampleData.transactions.length} transactions`);
console.log('\nSample wallet:');
console.log(JSON.stringify(sampleData.wallets[0], null, 2));
console.log('\nSample transaction:');
console.log(JSON.stringify(sampleData.transactions[0], null, 2));

// Save to file
const fs = require('fs');
fs.writeFileSync('sample-data.json', JSON.stringify(sampleData, null, 2));
console.log('\n✅ Sample data saved to sample-data.json');
console.log('You can now import this file using the Settings page in the application.');