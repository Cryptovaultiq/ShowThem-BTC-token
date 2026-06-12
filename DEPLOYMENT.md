# Flash Token System - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. Node.js 16+ installed
2. Private key with testnet ETH for gas fees
3. Infura account (or other RPC provider)
4. Etherscan API key (optional, for verification)

## Environment Setup

### 1. Create `.env` file

```bash
# Copy example
cp .env.example .env

# Edit .env with your values
nano .env
```

### 2. Configure Environment Variables

```env
# Sepolia Testnet RPC (get from Infura)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Your wallet private key (keep secret!)
PRIVATE_KEY=0x1234567890abcdef...

# Optional: Etherscan for verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Gas reporting
REPORT_GAS=true
```

## Deployment Steps

### Step 1: Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### Step 2: Compile Contract

```bash
npm run compile
```

Output should show:
```
Compilation successful
Successfully compiled 1 Solidity file
```

### Step 3: Test Contract (Optional)

```bash
npm test
```

Should see all tests passing.

### Step 4: Deploy to Local Network (Recommended First)

```bash
# Terminal 1: Start Hardhat node
npm run dev:contracts
# Output: Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

# Terminal 2: Deploy
npm run deploy:ethereum
```

**Expected Output:**
```
Deploying FlashToken to Ethereum...
Deploying from account: 0x...

✅ FlashToken deployed to: 0x5FbDB2315678afccb333f8a9c6dd9e5...

📊 Token Details:
  Name: Flash Token
  Symbol: FLASH
  Initial Supply: 1000000
  Gas Fee: 100 BPS
  Min Gas Fee: 0.001 ETH
  Max Gas Fee: 1 ETH

💾 Deployment info saved to: ./deployments/localhost.json
```

### Step 5: Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

This will:
1. Compile the contract
2. Deploy to Sepolia network
3. Save deployment info to `deployments/sepolia.json`
4. Display contract address

**Note**: First deployment takes longer for block confirmation.

### Step 6: Verify Contract on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "Flash Token" "FLASH" 1000000 100 1000000000000000 1000000000000000000
```

Replace `DEPLOYED_ADDRESS` with actual contract address.

## Frontend Setup

### Step 1: Configure Frontend

Edit `frontend/.env`:

```env
VITE_FLASH_TOKEN_ADDRESS=0x5FbDB2315678afccb333f8a9c6dd9e5...
```

Replace with your deployed contract address.

### Step 2: Start Frontend

```bash
npm run dev:frontend
```

Opens at `http://localhost:3000`

## Testing Deployment

### 1. Connect MetaMask

- Open frontend in browser
- Click "Connect Wallet"
- Approve connection in MetaMask
- Ensure on correct network (Sepolia or Localhost)

### 2. Check Balance

- Click on wallet address to verify connection
- Balance should show in BalanceCard

### 3. Try Transfer Without Gas

1. Enter recipient address
2. Enter amount (e.g., 10)
3. Click "Send Tokens"
4. Should see error: "Cannot transfer flash tokens without paying gas fee"

### 4. Pay Gas Fee

1. In GasPaymentCard, enter amount (e.g., 0.01 ETH)
2. Click "Pay Gas Fee"
3. Approve transaction in MetaMask
4. Wait for confirmation
5. Gas balance should update

### 5. Try Transfer With Gas

1. Enter same recipient and amount
2. Click "Send Tokens"
3. Should succeed (gas fee deducted)
4. Balance should decrease

## Network-Specific Configuration

### Localhost (Hardhat)

```bash
# Already configured in hardhat.config.js
# Just run:
npm run dev:contracts
npm run deploy:ethereum
```

No additional setup needed.

### Sepolia Testnet

1. Get Sepolia ETH: https://www.sepolia.io/
2. Ensure `SEPOLIA_RPC_URL` in `.env`
3. Run: `npm run deploy:sepolia`

### Polygon

```javascript
// In hardhat.config.js, add:
polygon: {
  url: process.env.POLYGON_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
}
```

Then deploy:
```bash
npx hardhat run scripts/deployFlashToken.js --network polygon
```

## Troubleshooting

### "No contract code at address"
- Contract not deployed yet
- Check wrong network in MetaMask
- Re-deploy if needed

### "Invalid private key"
- Private key format wrong
- Should start with 0x
- Should be 64 hex characters

### "Gas estimation failed"
- Contract address incorrect
- Wrong network selected
- Insufficient ETH balance

### "Execution reverted"
- Not connected to correct network
- Contract not initialized
- Gas limit too low

### MetaMask not showing tokens

**Automatic Import:**
- Most networks show token automatically after first interaction

**Manual Import:**
1. Click "Import tokens" in MetaMask
2. Paste contract address
3. Should auto-fill name and symbol
4. Click "Import"

## Advanced Configuration

### Custom Gas Fee Structure

In deployment script:

```javascript
const flashToken = await FlashToken.deploy(
  "Flash Token",
  "FLASH",
  1000000,
  200,  // 2% gas fee instead of 1%
  ethers.parseEther("0.002"),  // Min 0.002 ETH
  ethers.parseEther("2")       // Max 2 ETH
);
```

### Distributing Tokens

```javascript
// After deployment
const recipients = ["0x...", "0x..."];
const amounts = [100, 200];
await flashToken.distributeFlashTokens(recipients, amounts);
```

### Updating Parameters

```javascript
// Change gas fee to 0.5%
await flashToken.updateGasFee(50, ethers.parseEther("0.001"), ethers.parseEther("1"));
```

## Production Deployment Checklist

- [ ] Contract audited by third-party
- [ ] Private key stored securely (use hardware wallet)
- [ ] All tests passing
- [ ] Frontend environment variables set
- [ ] Contract verified on block explorer
- [ ] Gas limits optimized
- [ ] Error messages user-friendly
- [ ] Documentation complete
- [ ] Monitoring/alerting in place

## Support

For issues:
1. Check Etherscan for transaction details
2. Review error message in console
3. Verify contract address and network
4. Re-run deployment if needed
