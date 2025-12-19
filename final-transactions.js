const walletIds = [
  "cmjc5zp2v00jtjqgjjp3d6yfb", // محفظة فودافون كاش
  "cmjc6m5w200jxjqgjujx0xuj", // محفظة أورانج موني
  "cmjc6m5wq00jzjqgjvr62k0sh", // محفظة إيدي
  "cmjc6m5wr00k1jqgjsvsgv7xw", // محفظة انستا باي
  "cmjc6m5ws00k3jqgjz0b7p915"  // محفظة فوري
];

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
      const errorText = await response.text();
      console.error('Failed to add transaction:', errorText);
      return null;
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
}

async function addTransactionsToWallet(walletId, walletName, count) {
  console.log(`Adding ${count} transactions to ${walletName}...`);
  
  let successCount = 0;
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.4 ? 'deposit' : 'withdrawal'; // 60% deposits, 40% withdrawals
    const amount = generateAmount(100, 800); // Smaller amounts to respect limits
    const description = transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)];
    const date = generateDateInDecember();
    
    const transaction = {
      walletId,
      type,
      amount,
      description,
      date
    };
    
    console.log(`  Adding transaction ${i + 1}/${count}: ${type} - ${amount} EGP`);
    
    const result = await addTransaction(transaction);
    if (result) {
      successCount++;
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`✓ Successfully added ${successCount}/${count} transactions to ${walletName}`);
  return successCount;
}

async function addAllTransactions() {
  console.log('Adding remaining transactions to reach ~20 per wallet...');
  
  let totalAdded = 0;
  
  for (let i = 0; i < walletIds.length; i++) {
    const walletId = walletIds[i];
    const walletNames = ['محفظة فودافون كاش', 'محفظة أورانج موني', 'محفظة إيدي', 'محفظة انستا باي', 'محفظة فوري'];
    const walletName = walletNames[i];
    
    // Add different amounts based on wallet to avoid hitting limits
    const transactionsToAdd = i === 0 ? 6 : i === 1 ? 5 : i === 2 ? 4 : i === 3 ? 3 : 2;
    
    const added = await addTransactionsToWallet(walletId, walletName, transactionsToAdd);
    totalAdded += added;
  }
  
  console.log(`\n🎉 Total transactions added: ${totalAdded}`);
  
  // Final check
  const response = await fetch('http://localhost:3000/api/transactions');
  const allTransactions = await response.json();
  
  console.log(`\n📊 Final transaction count: ${allTransactions.length}`);
  
  // Group by wallet
  const transactionsByWallet = {};
  for (const transaction of allTransactions) {
    if (!transactionsByWallet[transaction.walletId]) {
      transactionsByWallet[transaction.walletId] = 0;
    }
    transactionsByWallet[transaction.walletId]++;
  }
  
  console.log('\n📱 Transactions per wallet:');
  const walletNames = ['محفظة فودافون كاش', 'محفظة أورانج موني', 'محفظة إيدي', 'محفظة انستا باي', 'محفظة فوري'];
  for (const [walletId, count] of Object.entries(transactionsByWallet)) {
    const walletIndex = walletIds.indexOf(walletId);
    const walletName = walletNames[walletIndex];
    console.log(`  ${walletName}: ${count} transactions`);
  }
}

addAllTransactions();