const fs = require('fs');

async function importSampleData() {
  try {
    console.log('Reading sample data...');
    const data = JSON.parse(fs.readFileSync('sample-data.json', 'utf8'));
    
    console.log(`Found ${data.wallets.length} wallets and ${data.transactions.length} transactions`);
    
    // Import wallets
    console.log('Importing wallets...');
    for (let i = 0; i < data.wallets.length; i++) {
      const wallet = data.wallets[i];
      
      // Remove fields that shouldn't be sent in creation
      const { balance, totalDeposits, totalWithdrawals, totalFeesEarned, monthlyTransactions, ...walletData } = wallet;
      
      try {
        const response = await fetch('http://localhost:3000/api/wallets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(walletData)
        });
        
        if (response.ok) {
          const createdWallet = await response.json();
          console.log(`✓ Created wallet ${i + 1}: ${createdWallet.name}`);
          
          // Update wallet ID in transactions
          data.transactions.forEach(transaction => {
            if (transaction.walletId === `wallet_${i + 1}`) {
              transaction.walletId = createdWallet.id;
            }
          });
        } else {
          console.log(`✗ Failed to create wallet ${i + 1}: ${wallet.name}`);
        }
      } catch (error) {
        console.log(`✗ Error creating wallet ${i + 1}: ${error.message}`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Wait a bit before importing transactions
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Import transactions
    console.log('Importing transactions...');
    let successCount = 0;
    for (let i = 0; i < data.transactions.length; i++) {
      const transaction = data.transactions[i];
      
      try {
        const response = await fetch('http://localhost:3000/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          successCount++;
          if (successCount % 50 === 0) {
            console.log(`✓ Imported ${successCount} transactions...`);
          }
        }
      } catch (error) {
        console.log(`✗ Error importing transaction ${i + 1}: ${error.message}`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n✅ Import completed!`);
    console.log(`✓ Successfully imported wallets and ${successCount} transactions`);
    
  } catch (error) {
    console.error('Error importing sample data:', error);
  }
}

// Wait for server to be ready
setTimeout(() => {
  importSampleData();
}, 3000);