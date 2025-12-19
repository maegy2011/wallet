import { db } from './src/lib/db.js';

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
  
  return december;
}

function calculateFee(wallet, amount) {
  let feeAmount = 0;
  
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
  
  const maxFeeAmount = wallet.maxFeeAmount || 0;
  return maxFeeAmount > 0 ? Math.min(feeAmount, maxFeeAmount) : feeAmount;
}

async function addTransactionsToWallets() {
  try {
    console.log('Starting to add 20 transactions for each wallet in December 2025...');
    
    // Get all existing wallets
    const wallets = await db.wallet.findMany({
      where: { isArchived: false }
    });
    
    console.log(`Found ${wallets.length} active wallets`);
    
    // Get current monthly stats for each wallet
    const walletStats = {};
    for (const wallet of wallets) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const existingTransactions = await db.transaction.findMany({
        where: {
          walletId: wallet.id,
          date: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      });
      
      const monthlyTotal = existingTransactions.reduce((sum, t) => {
        return sum + t.amount;
      }, 0);
      
      walletStats[wallet.id] = {
        currentMonthlyTotal: monthlyTotal,
        remainingLimit: 200000 - monthlyTotal
      };
    }
    
    console.log('Current wallet stats:', walletStats);
    
    // Add 20 transactions for each wallet
    let totalTransactionsAdded = 0;
    for (const wallet of wallets) {
      console.log(`Adding transactions to wallet: ${wallet.name}`);
      
      const stats = walletStats[wallet.id];
      let transactionsAdded = 0;
      
      for (let i = 0; i < 20; i++) {
        // Check if we can add more transactions
        if (stats.remainingLimit <= 0) {
          console.log(`  ⚠️  Monthly limit reached for ${wallet.name}. Skipping remaining transactions.`);
          break;
        }
        
        const type = Math.random() > 0.4 ? 'deposit' : 'withdrawal'; // 60% deposits, 40% withdrawals
        const maxAmount = Math.min(5000, stats.remainingLimit);
        const amount = generateAmount(100, maxAmount);
        const description = transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)];
        const date = generateDateInDecember();
        
        // Calculate fee
        const feeAmount = calculateFee(wallet, amount);
        
        try {
          await db.transaction.create({
            data: {
              walletId: wallet.id,
              type,
              amount,
              feeAmount,
              description,
              date
            }
          });
          
          // Update stats
          if (type === 'deposit') {
            stats.currentMonthlyTotal += amount;
          } else {
            stats.currentMonthlyTotal += amount;
          }
          stats.remainingLimit = 200000 - stats.currentMonthlyTotal;
          
          transactionsAdded++;
          totalTransactionsAdded++;
          
          console.log(`  ✓ Transaction ${i + 1}/20: ${type} - ${amount} EGP (Fee: ${feeAmount} EGP)`);
          
        } catch (error) {
          console.error(`  ✗ Failed to create transaction ${i + 1}:`, error.message);
        }
      }
      
      console.log(`  ✓ Added ${transactionsAdded} transactions to ${wallet.name}`);
    }
    
    // Update wallet balances and statistics
    console.log('Updating wallet balances...');
    for (const wallet of wallets) {
      const allTransactions = await db.transaction.findMany({
        where: { walletId: wallet.id }
      });
      
      const balance = allTransactions.reduce((sum, t) => {
        return t.type === 'deposit' ? sum + t.amount : sum - t.amount - t.feeAmount;
      }, 0);
      
      const totalDeposits = allTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = allTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalFeesEarned = allTransactions
        .reduce((sum, t) => sum + t.feeAmount, 0);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });
      
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance,
          totalDeposits,
          totalWithdrawals,
          totalFeesEarned,
          monthlyTransactions: monthlyTransactions.length
        }
      });
      
      console.log(`  ✓ Updated balance for ${wallet.name}: ${balance} EGP`);
    }
    
    console.log('✅ Transaction addition completed!');
    console.log(`✓ Total transactions added: ${totalTransactionsAdded}`);
    console.log(`✓ All wallet balances updated`);
    
    // Final summary
    const finalWallets = await db.wallet.findMany({
      where: { isArchived: false }
    });
    
    const finalTransactions = await db.transaction.findMany();
    
    console.log('\n📊 Final Summary:');
    console.log(`✓ ${finalWallets.length} wallets`);
    console.log(`✓ ${finalTransactions.length} total transactions`);
    
    for (const wallet of finalWallets) {
      const walletTransactions = finalTransactions.filter(t => t.walletId === wallet.id);
      const decemberTransactions = walletTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === 11 && transactionDate.getFullYear() === 2025;
      });
      
      console.log(`\n📱 ${wallet.name}:`);
      console.log(`  Balance: ${wallet.balance} EGP`);
      console.log(`  Total Deposits: ${wallet.totalDeposits} EGP`);
      console.log(`  Total Withdrawals: ${wallet.totalWithdrawals} EGP`);
      console.log(`  Fees Earned: ${wallet.totalFeesEarned} EGP`);
      console.log(`  December Transactions: ${decemberTransactions.length}`);
      console.log(`  Fee Type: ${wallet.feeType}`);
      console.log(`  Fee Rate: ${wallet.feeType === 'percentage' ? wallet.feePercentage + '%' : 
                      wallet.feeType === 'perThousand' ? wallet.feePerThousand + ' EGP/1000' : 
                      wallet.feePercentage + ' EGP fixed'}`);
    }
    
  } catch (error) {
    console.error('Error adding transactions:', error);
  } finally {
    await db.$disconnect();
  }
}

// Execute the function
addTransactionsToWallets();