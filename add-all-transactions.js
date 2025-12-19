const baseUrl = "http://localhost:3000/api/transactions";

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

// Wallet IDs from the system
const walletIds = [
  "cmjc5zp2v00jtjqgjjp3d6yfb", // محفظة فودافون كاش
  "cmjc6m5w200jxjqgjujx0xuj", // محفظة أورانج موني
  "cmjc6m5wq00jzjqgjvr62k0sh", // محفظة إيدي
  "cmjc6m5wr00k1jqgjsvsgv7xw", // محفظة انستا باي
  "cmjc6m5ws00k3jqgjz0b7p915"  // محفظة فوري
];

function generateAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDateInDecember() {
  const currentYear = new Date().getFullYear();
  const december = new Date(currentYear, 11, 1); // December is month 11 (0-indexed)
  const randomDay = Math.floor(Math.random() * 31) + 1; // 1-31 days
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);
  const randomSecond = Math.floor(Math.random() * 60);
  
  december.setDate(randomDay);
  december.setHours(randomHour, randomMinute, randomSecond);
  
  return december.toISOString();
}

async function addTransaction(transaction) {
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to add transaction:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
}

async function addTransactionsToAllWallets() {
  console.log('Adding 20 transactions to each wallet...');
  
  let totalTransactionsAdded = 0;
  
  for (let walletIndex = 0; walletIndex < walletIds.length; walletIndex++) {
    const walletId = walletIds[walletIndex];
    console.log(`\n📱 Processing wallet ${walletIndex + 1}/${walletIds.length}`);
    
    for (let i = 0; i < 20; i++) {
      const type = Math.random() > 0.4 ? 'deposit' : 'withdrawal'; // 60% deposits, 40% withdrawals
      const amount = generateAmount(100, 3000);
      const description = transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)];
      const date = generateDateInDecember();
      
      const transaction = {
        walletId,
        type,
        amount,
        description,
        date
      };
      
      console.log(`  Adding transaction ${i + 1}/20: ${type} - ${amount} EGP`);
      
      const result = await addTransaction(transaction);
      if (result) {
        totalTransactionsAdded++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✓ Completed wallet ${walletIndex + 1}`);
  }
  
  console.log(`\n🎉 All transactions added!`);
  console.log(`📊 Total transactions added: ${totalTransactionsAdded}`);
}

addTransactionsToAllWallets();