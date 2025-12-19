import { db } from './src/lib/db.js';

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
  return date;
}

async function createFullSampleData() {
  try {
    console.log('Creating full sample data (20 wallets, 20 transactions each)...');
    
    // Clear existing data
    await db.transaction.deleteMany({});
    await db.wallet.deleteMany({});
    console.log('Cleared existing data');
    
    const createdWallets = [];
    
    // Create 20 wallets
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
      
      const walletData = {
        name: walletNames[i],
        mobileNumber: generateMobileNumber(),
        logo: generateWalletLogo(),
        feeType,
        feePercentage,
        feePerThousand,
        maxFeeAmount: Math.floor(Math.random() * 50) + 10, // 10-60 EGP max fee
      };
      
      console.log(`Creating wallet ${i + 1}/20: ${walletData.name}`);
      const wallet = await db.wallet.create({
        data: walletData
      });
      
      createdWallets.push(wallet);
      console.log(`Created wallet ${i + 1}/20: ${wallet.name}`);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('All wallets created. Now creating transactions...');
    
    // Create 20 transactions for each wallet
    for (let walletIndex = 0; walletIndex < createdWallets.length; walletIndex++) {
      const wallet = createdWallets[walletIndex];
      
      for (let txIndex = 0; txIndex < 20; txIndex++) {
        const type = Math.random() > 0.4 ? 'deposit' : 'withdrawal'; // 60% deposits, 40% withdrawals
        const amount = generateAmount(50, 5000);
        const description = transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)];
        const date = generateDate(90); // Within last 90 days
        
        const transactionData = {
          walletId: wallet.id,
          type,
          amount,
          description,
          date
        };
        
        await db.transaction.create({
          data: transactionData
        });
      }
      
      console.log(`Created 20 transactions for wallet ${walletIndex + 1}/20: ${wallet.name}`);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Update wallet balances and statistics
    console.log('Updating wallet balances...');
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
    
    console.log('✅ Full sample data creation completed!');
    console.log(`✓ Created ${createdWallets.length} wallets`);
    console.log(`✓ Created ${createdWallets.length * 20} transactions total`);
    console.log('✓ Updated all wallet balances and statistics');
    
  } catch (error) {
    console.error('Error creating full sample data:', error);
  } finally {
    await db.$disconnect();
  }
}

createFullSampleData();