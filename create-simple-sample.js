import { db } from './src/lib/db.js';

const wallets = [
  {
    name: 'محفظة فودافون كاش',
    mobileNumber: '01128212903',
    logo: '🤑',
    feeType: 'perThousand',
    feePercentage: 0,
    feePerThousand: 10,
    maxFeeAmount: 56
  },
  {
    name: 'محفظة أورانج موني',
    mobileNumber: '01162567255',
    logo: '💸',
    feeType: 'percentage',
    feePercentage: 3,
    feePerThousand: 0,
    maxFeeAmount: 41
  },
  {
    name: 'محفظة إيدي',
    mobileNumber: '01120579519',
    logo: '🏪',
    feeType: 'percentage',
    feePercentage: 5,
    feePerThousand: 0,
    maxFeeAmount: 29
  },
  {
    name: 'محفظة انستا باي',
    mobileNumber: '01012345678',
    logo: '💳',
    feeType: 'fixed',
    feePercentage: 15,
    feePerThousand: 0,
    maxFeeAmount: 30
  },
  {
    name: 'محفظة فوري',
    mobileNumber: '01298765432',
    logo: '💰',
    feeType: 'percentage',
    feePercentage: 2,
    feePerThousand: 0,
    maxFeeAmount: 25
  }
];

const transactions = [
  {
    walletId: null, // Will be set after wallet creation
    type: 'deposit',
    amount: 5000,
    description: 'تحويل راتب'
  },
  {
    walletId: null, // Will be set after wallet creation
    type: 'withdrawal',
    amount: 1200,
    description: 'شراء من السوبر ماركت'
  },
  {
    walletId: null, // Will be set after wallet creation
    type: 'deposit',
    amount: 3000,
    description: 'استرداد أموال'
  },
  {
    walletId: null, // Will be set after wallet creation
    type: 'withdrawal',
    amount: 800,
    description: 'دفع فاتورة الكهرباء'
  },
  {
    walletId: null, // Will be set after wallet creation
    type: 'deposit',
    amount: 2000,
    description: 'هدايا عيد ميلاد'
  }
];

async function createSampleData() {
  try {
    console.log('Creating sample wallets...');
    
    // Clear existing data
    await db.transaction.deleteMany({});
    await db.wallet.deleteMany({});
    console.log('Cleared existing data');
    
    const createdWallets = [];
    
    // Create wallets
    for (let i = 0; i < wallets.length; i++) {
      const wallet = await db.wallet.create({
        data: wallets[i]
      });
      createdWallets.push(wallet);
      console.log(`Created wallet: ${wallet.name}`);
    }
    
    // Create transactions for each wallet
    for (let walletIndex = 0; walletIndex < createdWallets.length; walletIndex++) {
      const wallet = createdWallets[walletIndex];
      
      for (let txIndex = 0; txIndex < 20; txIndex++) {
        const transactionData = {
          walletId: wallet.id,
          type: txIndex % 3 === 0 ? 'deposit' : 'withdrawal',
          amount: Math.floor(Math.random() * 3000) + 500,
          description: `حركة مالية ${txIndex + 1} للمحفظة ${wallet.name}`,
          date: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
        };
        
        await db.transaction.create({
          data: transactionData
        });
      }
      
      console.log(`Created 20 transactions for wallet: ${wallet.name}`);
    }
    
    // Update wallet balances
    for (const wallet of createdWallets) {
      const walletTransactions = await db.transaction.findMany({
        where: { walletId: wallet.id }
      });
      
      const balance = walletTransactions.reduce((sum, t) => {
        return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
      }, 0);
      
      const totalDeposits = walletTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = walletTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance,
          totalDeposits,
          totalWithdrawals,
          monthlyTransactions: walletTransactions.length
        }
      });
    }
    
    console.log('✅ Sample data creation completed!');
    console.log(`Created ${createdWallets.length} wallets with 20 transactions each`);
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await db.$disconnect();
  }
}

createSampleData();