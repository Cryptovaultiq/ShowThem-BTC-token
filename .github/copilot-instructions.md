# GitHub Copilot Instructions - Flash Token System

## Project Overview

**Flash Token System** - A blockchain-based token system where tokens appear in crypto wallets but cannot be transferred without paying gas fees.

### Architecture
- **Smart Contracts**: Ethereum (Solidity) + Bitcoin/Stacks (Clarity)
- **Frontend**: React with Web3 integration (ethers.js)
- **State Management**: Zustand
- **Build Tools**: Hardhat, Vite

### Key Files

#### Smart Contracts
- `contracts/ethereum/FlashToken.sol` - Main ERC-20 token with transfer blocking
- `contracts/stacks/FlashToken.clar` - Clarity version for Bitcoin
- `test/FlashToken.test.js` - Comprehensive test suite

#### Frontend
- `frontend/src/App.jsx` - Main application
- `frontend/src/components/` - UI components
- `frontend/src/stores/` - Zustand state management
- `frontend/src/utils/web3.js` - Web3 utilities

#### Configuration
- `hardhat.config.js` - Hardhat configuration
- `.env.example` - Environment variables template

### Current Status

✅ Phase 1: Smart Contract Complete
- ERC-20 compliant token
- Transfer blocking mechanism
- Gas fee system
- Admin controls

✅ Phase 2: Frontend Complete
- Wallet connection
- Balance display
- Gas payment interface
- Transfer attempt handling

✅ Phase 3: Testing Complete
- 20+ test cases
- Full coverage of core functions

## Common Tasks

### Adding New Features

1. **Smart Contract Changes**
   - Edit `contracts/ethereum/FlashToken.sol`
   - Update `test/FlashToken.test.js`
   - Run: `npm test`
   - Run: `npm run compile`

2. **Frontend Component**
   - Create in `frontend/src/components/`
   - Import in `frontend/src/App.jsx`
   - Update state in `frontend/src/stores/`

3. **Deployment**
   - Update `scripts/deployFlashToken.js` if needed
   - Run: `npm run deploy:ethereum` (local)
   - Run: `npm run deploy:sepolia` (testnet)

### Debugging

**Contract Issues**
```bash
npm test  # Run test suite
npm run compile  # Check for compile errors
```

**Frontend Issues**
```bash
npm run dev:frontend  # Start dev server with HMR
# Check browser console for errors
```

**Contract Address Not Found**
- Ensure `VITE_FLASH_TOKEN_ADDRESS` is set in `frontend/.env`
- Should match deployed contract address

### Code Style

- **Solidity**: OpenZeppelin conventions
- **JavaScript**: ESM modules
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes

### Performance Notes

- Frontend uses Zustand for minimal re-renders
- Contract optimized with 200 optimizer runs
- Lazy load contract data on wallet connection

## Environment Variables

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
VITE_FLASH_TOKEN_ADDRESS=0x...
```

## Key Concepts

### Flash Token Mechanism
1. User receives tokens (balance shows in wallet)
2. Attempts transfer → Error: "Cannot transfer without gas fee"
3. Pays gas fee in ETH → Gas balance updates
4. Can now transfer tokens (gas fee deducted)

### Contract State
- `balances[address]` - Flash token amounts
- `gasBalance[address]` - ETH paid for gas
- `gasFeeBps` - Gas fee percentage
- `approvedSenders[address]` - Addresses that bypass gas fee

### Frontend State (Zustand)
- `useWeb3Store` - Wallet connection state
- `useFlashTokenStore` - Token balance and gas data
- `useTransactionStore` - Transaction history

## Testing Workflow

```bash
# 1. Start local network
npm run dev:contracts

# 2. In new terminal, deploy
npm run deploy:ethereum

# 3. Note contract address
# 4. Update VITE_FLASH_TOKEN_ADDRESS in frontend/.env
# 5. Start frontend
npm run dev:frontend

# 6. Test in browser via UI
```

## Deployment Workflow

```bash
# 1. Compile
npm run compile

# 2. Test
npm test

# 3. Deploy to Sepolia
npm run deploy:sepolia

# 4. Update frontend
# Edit frontend/.env with new address

# 5. Run frontend
npm run dev:frontend
```

## File Locations

| Component | Location |
|-----------|----------|
| Ethereum Contract | `contracts/ethereum/FlashToken.sol` |
| Stacks Contract | `contracts/stacks/FlashToken.clar` |
| Tests | `test/FlashToken.test.js` |
| Deployment Script | `scripts/deployFlashToken.js` |
| React App | `frontend/src/App.jsx` |
| Web3 Hooks | `frontend/src/hooks/useWeb3.js` |
| State Stores | `frontend/src/stores/web3Store.js` |
| Contract ABI | `frontend/src/abis/index.js` |

## Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: description"

# Test before push
npm test
npm run compile

# Push
git push origin feature/new-feature
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No provider found" | Check MetaMask is installed |
| "Contract code not at address" | Verify contract address in .env |
| "Transfer still blocked" | Check gas balance, refresh page |
| "Connection failed" | Check network in MetaMask |

## Next Steps

1. **Security Audit** - Before mainnet deployment
2. **Stacks Integration** - Complete Bitcoin support
3. **Advanced Features**:
   - Multi-sig approval for gas fee updates
   - Dynamic fee adjustment based on gas prices
   - Batch token distribution
4. **Frontend Enhancements**:
   - Transaction history
   - Gas fee estimation UI
   - Real-time price feeds

## Resources

- Hardhat Docs: https://hardhat.org/
- ethers.js: https://docs.ethers.org/
- Solidity: https://docs.soliditylang.org/
- Clarity: https://docs.stacks.co/
- Tailwind CSS: https://tailwindcss.com/

---

**Last Updated**: 2024
**Version**: 1.0.0
