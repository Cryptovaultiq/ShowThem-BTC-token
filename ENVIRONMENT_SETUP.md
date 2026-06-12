# Flash Token System - Environment Setup Guide

## Before You Start

Make sure you have:
- ✅ Node.js 16+ installed
- ✅ npm or yarn
- ✅ MetaMask browser extension
- ✅ Git (optional, for version control)

## Installation Status

**Current: npm install running in background**

The initial dependency installation can take 3-5 minutes. You'll see:
```
✓ 200+ packages installed
✓ node_modules created
✓ Ready to compile
```

## Step 1: Wait for npm install

Check progress:
```bash
# In terminal, you should see npm working
# Look for "packages audited" message
```

Once complete, you'll see:
```
added 200+ packages, and audited 300+ packages
```

## Step 2: Create Environment Files

### Root .env

```bash
# In c:\Users\holly\Flash coin\.env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x1234567890abcdef...
REPORT_GAS=true
```

**Getting these values:**
- **Infura Key**: https://infura.io/ (sign up, create app, copy key)
- **Private Key**: Export from MetaMask (Settings → Account Details)
  - ⚠️ KEEP SECRET! Don't push to GitHub

### Frontend .env

```bash
# In c:\Users\holly\Flash coin\frontend\.env
VITE_FLASH_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

After deployment, replace with actual contract address.

## Step 3: Compile Smart Contract

Once npm install completes:

```bash
npm run compile
```

Expected output:
```
Compiled successfully
Successfully compiled 1 Solidity file
```

## Step 4: Start Local Development

### Terminal 1: Start Blockchain
```bash
npm run dev:contracts
```

Should show:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

**Keep this running!**

### Terminal 2: Deploy Contract
```bash
npm run deploy:ethereum
```

Copy the deployed address (starts with 0x...)

### Terminal 3: Start Frontend
First, update `frontend/.env` with the address from Terminal 2.

Then:
```bash
npm run dev:frontend
```

Opens at `http://localhost:3000`

## MetaMask Setup

### Add Hardhat Network

1. Open MetaMask
2. Click Network dropdown (top-right)
3. Click "Add Network"
4. Fill in:
   - **Network name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency**: ETH

5. Click "Save"

### Import Flash Token

1. From contract deployment, copy the address
2. In MetaMask, click "Import tokens"
3. Paste address
4. Symbol: FLASH
5. Decimals: 18
6. Click "Import"

## Testing the Setup

### 1. Check Network Connection
```bash
# In browser console:
# Open DevTools (F12)
# Go to Console tab
# Paste:
await window.ethereum.request({ method: 'eth_chainId' })
# Should return: 0x539 (1337 in decimal)
```

### 2. Check Contract

```bash
# In console:
await window.ethereum.request({
  method: 'eth_call',
  params: [{
    to: '0x[YOUR_CONTRACT_ADDRESS]',
    data: '0x18160ddd'  // totalSupply()
  }, 'latest']
})
```

## Troubleshooting

### npm install stuck

**Problem**: Installation seems frozen

**Solution**:
```bash
# Press Ctrl+C to cancel
# Then try:
npm install --legacy-peer-deps
```

### Compilation fails

**Problem**: `npm run compile` shows errors

**Solution**:
```bash
# Clear cache
rm -r artifacts cache
# Try again
npm run compile
```

### Frontend shows "Connect Wallet"

**Problem**: Page stuck on connect screen

**Solution**:
1. Install MetaMask if not installed
2. Check Hardhat network added to MetaMask
3. Refresh browser (F5)
4. Check contract address in `.env`

### "Contract code not found"

**Problem**: Contract address invalid

**Solution**:
1. Check address in `frontend/.env`
2. Make sure deployment completed in Terminal 2
3. Ensure contract was deployed to correct network

## Port Configuration

Default ports used:
- **Hardhat Node**: http://127.0.0.1:8545
- **Frontend Dev**: http://localhost:3000
- **MetaMask RPC**: http://127.0.0.1:8545

If ports conflict, you can change them:

```bash
# In vite.config.js:
server: {
  port: 3001,  // Change to different port
}
```

```bash
# In hardhat.config.js:
networks: {
  hardhat: {
    chainId: 1337,
  }
}
```

## Environment Variables Reference

### .env (Root)

| Variable | Purpose | Example |
|----------|---------|---------|
| SEPOLIA_RPC_URL | Sepolia testnet RPC | https://sepolia.infura.io/v3/YOUR_KEY |
| PRIVATE_KEY | Deployment account | 0x1234567890... |
| REPORT_GAS | Show gas usage | true |
| ETHERSCAN_API_KEY | Block explorer API | ABCD1234... |

### frontend/.env

| Variable | Purpose | Example |
|----------|---------|---------|
| VITE_FLASH_TOKEN_ADDRESS | Deployed contract | 0x5FbDB231... |

## Deployment to Testnet

### Get Sepolia ETH

Visit testnet faucet:
- https://www.sepolia.io/
- Or search "Sepolia faucet"

### Deploy

```bash
# Set SEPOLIA_RPC_URL first in .env
npm run deploy:sepolia
```

### Verify Contract

```bash
npx hardhat verify --network sepolia 0x[ADDRESS] "Flash Token" "FLASH" 1000000 100 1000000000000000 1000000000000000000
```

## Network Switching

### In MetaMask

1. Click network dropdown
2. Select "Hardhat Local" for local testing
3. Select "Sepolia" for testnet
4. Switch networks automatically in dApp

## Security Checklist

Before deploying to mainnet:

- [ ] Never commit `.env` to git
- [ ] Use `.env.local` for sensitive keys
- [ ] Private key is secure
- [ ] Contract audited
- [ ] Tests passing
- [ ] Frontend validates inputs
- [ ] Error handling complete

## Next Steps

1. ✅ Installation complete
2. ✅ Environment setup done
3. ▶️ Run `npm run dev:contracts`
4. ▶️ Run `npm run deploy:ethereum`
5. ▶️ Run `npm run dev:frontend`
6. ▶️ Test in browser

## Support

If you get stuck:

1. Check console errors (F12 → Console)
2. Check terminal output
3. Verify `.env` files exist
4. Try restarting services
5. Check QUICKSTART.md for step-by-step guide

---

**Ready to launch your Flash Token System!** 🚀
