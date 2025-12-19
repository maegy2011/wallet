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

async function createWallet(walletData) {
  try {
    const response = await fetch('http://localhost:3000/api/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walletData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error creating wallet:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating wallet:', error);
    return null;
  }
}

async function createTransaction(transactionData) {
  try {
    const response = await fetch('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error creating transaction:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

async function clearAllData() {
  try {
    const response = await fetch('http://localhost:3000/api/settings/clear-data', {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      console.error('Error clearing data:', await response.text());
      return false;
    }
    
    console.log('Cleared existing data');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

async function generateSampleData() {
  try {
    console.log('Starting to generate sample data...');
    
    // Clear existing data first
    await clearAllData();
    
    const createdWallets = [];
    
    // Generate and insert 20 wallets
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
      
      console.log(`Creating wallet ${i + 1}: ${walletData.name}`);
      const wallet = await createWallet(walletData);
      
      if (wallet) {
        createdWallets.push(wallet);
        console.log(`✓ Created wallet: ${wallet.name}`);
      } else {
        console.log(`✗ Failed to create wallet: ${walletData.name}`);
      }
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\nCreated ${createdWallets.length} wallets successfully`);
    
    // Generate and insert 20 transactions for each wallet
    let transactionCount = 0;
    for (let i = 0; i < createdWallets.length; i++) {
      const wallet = createdWallets[i];
      
      for (let j = 0; j < 20; j++) {
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
        
        const transaction = await createTransaction(transactionData);
        
        if (transaction) {
          transactionCount++;
        }
        
        // Add a small delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log(`✓ Created transactions for wallet: ${wallet.name}`);
    }
    
    console.log(`\n✅ Successfully created ${createdWallets.length} wallets and ${transactionCount} transactions`);
    console.log('Sample data generation completed!');
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
}

// Wait a bit for the server to be ready, then run the generation
setTimeout(() => {
  generateSampleData();
}, 2000);