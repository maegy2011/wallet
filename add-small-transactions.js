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

async function getWalletStats(walletId) {
  try {
    const response = await fetch(`http://localhost:3000/api/wallets/${walletId}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    return null;
  }
}

async function addSmallTransactionsToAllWallets() {
  console.log('Adding small transactions to respect monthly limits...');
  
  // Get all wallet IDs
  const walletsResponse = await fetch('http://localhost:3000/api/wallets');
  const wallets = await walletsResponse.json();
  
  console.log(`Found ${wallets.length} wallets`);
  
  let totalTransactionsAdded = 0;
  
  for (let walletIndex = 0; walletIndex < wallets.length; walletIndex++) {
    const wallet = wallets[walletIndex];
    console.log(`\n📱 Processing wallet ${walletIndex + 1}/${wallets.length}: ${wallet.name}`);
    
    // Get current wallet stats to check monthly limit
    const walletStats = await getWalletStats(wallet.id);
    
    if (!walletStats) {
      console.log(`  ⚠️  Could not get wallet stats, skipping...`);
      continue;
    }
    
    // Calculate current monthly usage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const transactionsResponse = await fetch('http://localhost:3000/api/transactions');
    const allTransactions = await transactionsResponse.json();
    
    const walletTransactions = allTransactions.filter(t => t.walletId === wallet.id);
    const monthlyTransactions = walletTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const currentMonthlyTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    let remainingLimit = 200000 - currentMonthlyTotal;
    
    console.log(`  Current monthly total: ${currentMonthlyTotal} EGP`);
    console.log(`  Remaining limit: ${remainingLimit} EGP`);
    
    if (remainingLimit <= 0) {
      console.log(`  ⚠️  Monthly limit reached, skipping this wallet`);
      continue;
    }
    
    // Add small transactions that respect the limit
    let transactionsAdded = 0;
    const maxTransactionAmount = Math.min(1000, Math.floor(remainingLimit / 20)); // Small amounts
    
    for (let i = 0; i < 20; i++) {
      // Check if we can add more
      if (remainingLimit <= 0) {
        console.log(`  ⚠️  Limit reached after ${i} transactions`);
        break;
      }
      
      const type = Math.random() > 0.3 ? 'deposit' : 'withdrawal'; // 70% deposits, 30% withdrawals
      const amount = generateAmount(50, Math.min(maxTransactionAmount, remainingLimit));
      const description = transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)];
      const date = generateDateInDecember();
      
      const transaction = {
        walletId: wallet.id,
        type,
        amount,
        description,
        date
      };
      
      console.log(`  Adding transaction ${i + 1}/20: ${type} - ${amount} EGP`);
      
      const result = await addTransaction(transaction);
      if (result) {
        totalTransactionsAdded++;
        transactionsAdded++;
        
        // Update remaining limit
      remainingLimit -= amount;
      } else {
        console.log(`  ✗ Failed to add transaction`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`  ✓ Added ${transactionsAdded} transactions to ${wallet.name}`);
  }
  
  console.log(`\n🎉 All transactions added!`);
  console.log(`📊 Total transactions added: ${totalTransactionsAdded}`);
  
  // Final summary
  console.log('\n📊 Final Summary:');
  for (const wallet of wallets) {
    const updatedStats = await getWalletStats(wallet.id);
    if (updatedStats) {
      console.log(`\n📱 ${wallet.name}:`);
      console.log(`  Balance: ${updatedStats.balance} EGP`);
      console.log(`  Total Deposits: ${updatedStats.totalDeposits} EGP`);
      console.log(`  Total Withdrawals: ${updatedStats.totalWithdrawals} EGP`);
      console.log(`  Fees Earned: ${updatedStats.totalFeesEarned} EGP`);
      console.log(`  Monthly Transactions: ${updatedStats.monthlyTransactions}`);
    }
  }
}

addSmallTransactionsToAllWallets();