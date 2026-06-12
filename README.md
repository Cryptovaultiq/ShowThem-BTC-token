# Flash Token System 🚀

A complete blockchain-based flash token system for Ethereum and Bitcoin (Stacks). Flash tokens appear in crypto wallets but cannot be transferred without paying gas fees.

## 🎯 Features

✅ **ERC-20 Compatible** - Tokens appear in MetaMask and Web3 wallets  
✅ **Transfer Blocking** - Automatic rejection of transfers without gas payment  
✅ **Gas Fee System** - Flexible gas fee structure with min/max limits  
✅ **Web3 Integration** - Full wallet connection and balance tracking  
✅ **Bitcoin Support** - Clarity smart contracts on Stacks (Bitcoin Layer 2)  
✅ **Multi-Chain** - Deploy to Ethereum, Sepolia, and other EVM chains  

## 📋 Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Hardhat (for Ethereum development)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Flash\ coin

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment Setup

Create `.env` file:

```bash
# Ethereum Network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Frontend
VITE_FLASH_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

### Deploy Smart Contract (Ethereum)

#### Local Testing
```bash
# Start local Hardhat node
npm run dev:contracts

# In new terminal, deploy to local network
npm run deploy:ethereum
```

#### Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Run Frontend

```bash
# Development mode
npm run dev:frontend

# Build for production
npm run build:frontend
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Wallet                          │
│              (MetaMask / Web3 Wallet)                   │
└──────────────────────────┬──────────────────────────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
        ┌─────────▼──────┐  ┌──────▼─────────┐
        │  Ethereum      │  │  Stacks        │
        │  FlashToken    │  │  FlashToken    │
        │  Contract      │  │  Contract      │
        └─────────┬──────┘  └──────┬─────────┘
                  │                 │
        ┌─────────▼──────────────────▼─────────┐
        │     React Frontend (Web3Modal)       │
        │  - Wallet Connection                 │
        │  - Balance Display                   │
        │  - Transfer Interface                │
        │  - Gas Payment System                │
        └──────────────────────────────────────┘
```

## 🔧 Smart Contracts

### FlashToken (Ethereum - Solidity)

**Location**: `contracts/ethereum/FlashToken.sol`

Key Functions:
- `transfer()` - Blocks transfer unless gas fee is paid
- `payGasFee()` - Allows user to pay gas fee (receive ETH)
- `calculateGasFee()` - Calculates required gas fee based on amount
- `distributeFlashTokens()` - Owner can distribute tokens to addresses

### FlashToken (Stacks - Clarity)

**Location**: `contracts/stacks/FlashToken.clar`

Same functionality as Ethereum contract but written in Clarity language for Bitcoin Layer 2.

## 💻 Frontend Components

### WalletConnect
Connects to MetaMask and manages wallet state

### BalanceCard
Displays:
- Flash token balance
- Gas balance (ETH)
- Fee structure parameters

### GasPaymentCard
- Pay gas fees in ETH
- Track payment history
- Enable transfers

### TokenTransferCard
- Send flash tokens
- Shows transfer attempt results
- Displays gas fee error messages

## 📊 How It Works

### User Flow
1. **Connect Wallet** → MetaMask connection
2. **Receive Tokens** → Contract owner distributes flash tokens
3. **Check Balance** → Tokens appear in wallet
4. **Try to Send** → Transaction blocked with gas fee error
5. **Pay Gas** → Send ETH to contract for gas balance
6. **Transfer Enabled** → Now can send tokens (gas deducted)

### Transfer Mechanism

```javascript
// When user calls transfer()
if (gasBalance[user] == 0) {
  // BLOCKED! Show error requesting gas fee
  revert("FLASH_TOKEN_ERROR: Pay gas fee first");
}

// After gas payment
gasBalance[user] -= requiredFee;
_transfer(from, to, amount);
```

## 🧪 Testing

Run Hardhat tests:

```bash
npm test
```

Tests cover:
- Deployment & initialization
- Minting functionality
- Transfer blocking mechanism
- Gas fee calculations
- Payment processing
- Admin functions

## 🚀 Deployment Guide

### Step 1: Compile Contract
```bash
npm run compile
```

### Step 2: Test Locally
```bash
npm run dev:contracts
# In another terminal
npm run deploy:ethereum
```

### Step 3: Deploy to Testnet
```bash
npm run deploy:sepolia
```

### Step 4: Setup Frontend
1. Copy contract address from deployment
2. Add to `.env` as `VITE_FLASH_TOKEN_ADDRESS`
3. Run `npm run dev:frontend`

### Step 4: Verify Contract (Optional)
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Flash Token" "FLASH" 1000000 100 1000000000000000 1000000000000000000
```

## 📝 Contract Functions

### Public Functions

| Function | Purpose | Parameters |
|----------|---------|-----------|
| `transfer()` | Send tokens | `to` address, `amount` in wei |
| `transferFrom()` | Send from another | `from`, `to`, `amount` |
| `payGasFee()` | Pay gas in ETH | None (sends value) |
| `calculateGasFee()` | Get required fee | `amount` in wei |
| `balanceOf()` | Get token balance | `account` address |
| `gasBalance()` | Get gas balance | `account` address |

### Admin Functions

| Function | Purpose | Owner Only |
|----------|---------|-----------|
| `mint()` | Mint new tokens | ✅ Yes |
| `distributeFlashTokens()` | Distribute to many | ✅ Yes |
| `updateGasFee()` | Change fee params | ✅ Yes |
| `setApprovedSender()` | Whitelist sender | ✅ Yes |
| `withdrawGasFees()` | Collect payments | ✅ Yes |

## ⚙️ Configuration

### Gas Fee Parameters

```solidity
gasFeeBps = 100;        // 1% of transfer amount
minGasFee = 0.001 ETH;  // Minimum fee
maxGasFee = 1 ETH;      // Maximum fee
```

Adjust in deployment script or call `updateGasFee()`.

## 🔐 Security Considerations

✅ Uses OpenZeppelin ERC20 standard library  
✅ Nonreentrant guard for payments  
✅ Owner-controlled minting and parameters  
✅ Clear error messages for blocked transfers  

**Note**: Audit recommended before mainnet deployment.

## 🌐 Network Support

### Ethereum
- ✅ Local (Hardhat)
- ✅ Sepolia Testnet
- ✅ Ethereum Mainnet (after audit)
- ✅ Polygon, Arbitrum, Optimism (compatible)

### Bitcoin
- ✅ Stacks (Bitcoin Layer 2)
- Uses Clarity smart contracts
- Bitcoin-settled transactions

## 📚 File Structure

```
Flash coin/
├── contracts/
│   ├── ethereum/
│   │   └── FlashToken.sol
│   └── stacks/
│       └── FlashToken.clar
├── frontend/
│   ├── src/
│   │   ├── abis/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── scripts/
│   └── deployFlashToken.js
├── test/
│   └── FlashToken.test.js
├── hardhat.config.js
└── package.json
```

## 🐛 Troubleshooting

### "Contract address not configured"
→ Set `VITE_FLASH_TOKEN_ADDRESS` in `.env`

### "MetaMask not found"
→ Install MetaMask extension

### "Insufficient gas balance"
→ Use GasPaymentCard to pay gas fee

### Transfer still blocked after payment
→ Wait for transaction confirmation, refresh page

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/)
- Discord: [Join community](https://discord.gg/)
- Email: support@flashtoken.dev

---

**Built with ❤️ for the crypto community**
