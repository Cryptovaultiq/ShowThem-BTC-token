# Fake Token System v2.0

🎯 **Send fake BTC and ETH tokens that appear in crypto wallets but cannot be transferred without paying gas fees first.**

## Features

✅ **2 Fake Tokens**
- FakeBTC (8 decimals) - Bitcoin clone
- FakeETH (18 decimals) - Ethereum clone

✅ **Token Switching**
- Settings panel to switch between BTC and ETH
- Real-time price feeds (CoinGecko - free API)
- USD conversion display

✅ **Controllable Transfers**
- Send any amount to any address
- Quick amount buttons (10, 50, 100, 500)
- Real-time gas fee calculation

✅ **Gas Fee System**
- 1% fee on transfers (configurable)
- Min/Max fee bounds
- ETH payment to unlock transfers

✅ **Multi-Wallet Support**
- MetaMask (primary)
- WalletConnect compatible
- TrustWallet, SafePAL, Coinbase compatible

## Project Structure

```
c:\Users\holly\Flash coin\
├── contracts/
│   ├── ethereum/
│   │   ├── FakeBTC.sol (400+ lines)
│   │   └── FakeETH.sol (400+ lines)
│   └── stacks/
│       └── FlashToken.clar
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   ├── BalanceCard.jsx
│   │   │   ├── GasPaymentCard.jsx
│   │   │   └── TokenTransferCard.jsx
│   │   ├── stores/
│   │   │   └── index.js (Zustand stores)
│   │   ├── utils/
│   │   │   ├── web3.js
│   │   │   └── coingecko.js (CoinGecko API)
│   │   ├── abis/
│   │   │   └── index.js
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── scripts/
│   └── deployFakeTokens.js
├── test/
│   └── FakeBTC.test.js
├── hardhat.config.js
└── package.json
```

## Quick Start

### 1. Install Dependencies

```bash
cd "c:\Users\holly\Flash coin"
npm install --legacy-peer-deps

# Frontend dependencies
cd frontend
npm install --legacy-peer-deps
cd ..
```

### 2. Compile Smart Contracts

```bash
npm run compile
```

Expected output: ✅ Successfully compiled 2 Solidity files

### 3. Deploy to Sepolia Testnet

**Option A: Local Testing**
```bash
# Terminal 1: Start local Hardhat network
npm run dev:contracts

# Terminal 2: Deploy to local network
npm run deploy:ethereum
```

**Option B: Sepolia Testnet (Recommended)**
```bash
# Create .env in root directory with:
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Deploy
npm run deploy:sepolia
```

### 4. Configure Frontend

1. Copy deployment addresses from deployment output
2. Create `frontend/.env`:
```
VITE_FAKE_BTC_ADDRESS=0x...
VITE_FAKE_ETH_ADDRESS=0x...
```

### 5. Start Frontend

```bash
npm run dev:frontend
```

Opens at `http://localhost:3000` 🚀

## How It Works

### User Flow:

```
1. Connect MetaMask Wallet
        ↓
2. Select Token (BTC or ETH) in Settings
        ↓
3. View Balance (e.g., 1000 BTC, $45,000 USD)
        ↓
4. Try to Send BTC
        ↓
5. ❌ BLOCKED: "Cannot transfer without paying gas fee"
        ↓
6. Pay 0.01 ETH Gas Fee
        ↓
7. ✅ Now Can Send BTC!
        ↓
8. Transfer Succeeds, Gas Fee Deducted
```

### Smart Contract Logic:

```solidity
function transfer(address to, uint256 amount) public override returns (bool) {
    // CHECK: User has paid gas fee
    require(
        gasBalance[msg.sender] > 0 || approvedSenders[msg.sender],
        "Cannot transfer without paying gas fee"
    );

    // DEDUCT: Gas fee from balance
    uint256 gasFee = calculateGasFee(amount);
    gasBalance[msg.sender] -= gasFee;

    // TRANSFER: Token to recipient
    return super.transfer(to, amount);
}
```

## API Integration

### CoinGecko Prices (Free - No API Key Needed)

```javascript
import { fetchCryptoPrices, convertToUSD } from './utils/coingecko';

// Fetch real-time prices
const prices = await fetchCryptoPrices('bitcoin,ethereum', 'usd');
// Returns: { BTC: 45000, ETH: 2500 }

// Convert to USD
const usdValue = convertToUSD(1.5, 'BTC', prices);
// Returns: "$67500.00"
```

Prices update every 30 seconds automatically.

## Testnet Setup

### Sepolia Faucets (Get Free ETH):
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/
- Alchemy Faucet (0.5 ETH daily)

### Network Configuration:
```
Network: Sepolia
Chain ID: 11155111
RPC: https://sepolia.infura.io/v3/YOUR_KEY
Block Explorer: https://sepolia.etherscan.io/
```

## Testing

### Run Test Suite:
```bash
npm test
```

Tests include:
- ✅ Deployment verification
- ✅ Minting functionality
- ✅ Transfer blocking
- ✅ Gas fee calculations
- ✅ Gas fee payments
- ✅ Approved senders
- ✅ Admin functions

### Manual Testing Flow:

1. **Get Free Testnet ETH** (from Sepolia faucet)
2. **Deploy contracts** (`npm run deploy:sepolia`)
3. **Start frontend** (`npm run dev:frontend`)
4. **Connect MetaMask** to Sepolia
5. **Select BTC in Settings**
6. **View 1M BTC balance** (initial mint)
7. **Try to send** → See error
8. **Pay gas fee** (0.01 ETH)
9. **Send token** → Success! ✅

## Deployment Costs

| Item | Cost | Notes |
|------|------|-------|
| FakeBTC Deploy | $30-150 | Depends on gas price |
| FakeETH Deploy | $30-150 | Same deployment cost |
| **Total** | **$60-300** | One-time cost |

Gas varies with network congestion (25-100 gwei typical).

## Configuration

### Token Parameters (Configurable):

```javascript
gasFeeBps = 100;    // 1% gas fee
minGasFee = 0.001;  // 0.001 ETH minimum
maxGasFee = 1;      // 1 ETH maximum
```

Change via `updateGasFee()` function (owner only).

### Frontend Settings:

```javascript
// Auto-refresh balances
autoRefresh: true
refreshInterval: 5000  // 5 seconds

// Show real-time prices
showPrices: true
```

## Environment Variables

### Root (Hardhat):
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...
PRIVATE_KEY=0x...
```

### Frontend:
```env
VITE_FAKE_BTC_ADDRESS=0x...
VITE_FAKE_ETH_ADDRESS=0x...
VITE_ENV=development
```

## Common Issues

### Issue: "Contract not found"
**Solution**: Verify contract address in `.env` matches deployment output

### Issue: "Insufficient gas balance"
**Solution**: Pay gas fee first (Pay Gas Fee button)

### Issue: "Connection failed"
**Solution**: 
- Check MetaMask is installed
- Verify network is Sepolia in MetaMask
- Check browser console for errors

### Issue: Prices not updating
**Solution**: CoinGecko API might be rate-limited. Prices auto-refresh every 30 seconds.

## Next Steps

1. ✅ Deploy to Sepolia testnet
2. ✅ Test with MetaMask
3. ✅ Get user feedback
4. ⏳ Add more wallet support (WalletConnect)
5. ⏳ Deploy to Ethereum mainnet
6. ⏳ Security audit before mainnet
7. ⏳ Custom token logos in wallets

## Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `FakeBTC.sol` | BTC token contract | 250+ |
| `FakeETH.sol` | ETH token contract | 250+ |
| `App.jsx` | Main React app | 150+ |
| `TokenTransferCard.jsx` | Transfer UI | 200+ |
| `GasPaymentCard.jsx` | Gas payment UI | 180+ |
| `SettingsPanel.jsx` | Token switcher | 150+ |
| `coingecko.js` | Price API | 100+ |
| `index.js` (stores) | Zustand stores | 150+ |

## Support

For issues or questions:
1. Check browser console for errors
2. Verify contract addresses
3. Test with small amounts first
4. Check Sepolia Etherscan for transaction details

## License

MIT License - Use freely for testing and development

---

**Status**: ✅ Production Ready (Testnet)  
**Version**: 2.0.0  
**Last Updated**: June 4, 2026
