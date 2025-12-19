// Add tiny transactions to existing wallets without triggering limits
const walletIds = [
  "cmjc5zp2v00jtjqgjjp3d6yfb", // محفظة فودافون كاش
  "cmjc6m5w200jxjqgjujx0xuj", // محفظة أورانج موني
  "cmjc6m5wq00jzjqgjvr62k0sh", // محفظة إيدي
  "cmjc6m5wr00k1jqgjsvsgv7xw", // محفظة انستا باي
  "cmjc6m5ws00k3jqgjz0b7p915"  // محفظة فوري
];

const baseUrl = "http://localhost:3000/api/transactions";

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

async function addTinyTransactions() {
  console.log('Adding tiny transactions to each wallet...');
  
  for (let i = 0; i < walletIds.length; i++) {
    const walletId = walletIds[i];
    const walletNames = ['محفظة فودافون كاش', 'محفظة أورانج موني', 'محفظة إيدي', 'محفظة انستا باي', 'محفظة فوري'];
    const walletName = walletNames[i];
    
    console.log(`Adding transactions to ${walletName}...`);
    
    // Add 5 tiny transactions to each wallet
    for (let j = 0; j < 5; j++) {
      const transaction = {
        walletId,
        type: 'deposit',
        amount: 10, // Very small amount
        description: `إيداع صغير ${j + 1}`,
        date: new Date().toISOString()
      };
      
      console.log(`  Adding transaction ${j + 1}/5: 10 EGP`);
      
      const result = await addTransaction(transaction);
      if (result) {
        console.log(`    ✓ Success: ${result.id}`);
      } else {
        console.log(`    ✗ Failed`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log('\n🎉 Tiny transactions added to all wallets!');
}

addTinyTransactions();