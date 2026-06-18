# Manual Token Import Guide

## For MetaMask or Other EVM Wallets

Since Etherscan verification can take time, you can manually add both tokens to your wallet.

---

## **Token 1: Fake Bitcoin (BTC)**

### Contract Details
- **Network:** Ethereum Mainnet
- **Address:** `0x4B09e895699593c5e427CF8eA7Be550273989aa4`
- **Symbol:** BTC
- **Decimals:** 8
- **Supply:** 2.1 BTC

### How to Add to MetaMask:

1. Open MetaMask
2. Click **"Import tokens"** (bottom of assets list)
3. Enter the contract address: `0x4B09e895699593c5e427CF8eA7Be550273989aa4`
4. It should auto-populate:
   - **Token Symbol:** BTC
   - **Decimals:** 8
5. Click **"Add Custom Token"** → **"Import"**

✅ Your BTC balance will now display in MetaMask

---

## **Token 2: Solana Token (SOL)**

### Contract Details
- **Network:** Ethereum Mainnet
- **Address:** `0xB330Ccc03a0C9076A3558810A3Dd779c1528a0A0`
- **Symbol:** SOL
- **Decimals:** 8
- **Supply:** 120 SOL

### How to Add to MetaMask:

1. Open MetaMask
2. Click **"Import tokens"**
3. Enter the contract address: `0xB330Ccc03a0C9076A3558810A3Dd779c1528a0A0`
4. It should auto-populate:
   - **Token Symbol:** SOL
   - **Decimals:** 8
5. Click **"Add Custom Token"** → **"Import"**

✅ Your SOL balance will now display in MetaMask

---

## If Auto-Population Doesn't Work

If the fields don't auto-populate, **manually enter:**

### For BTC Token:
- **Token Symbol:** `BTC`
- **Decimals:** `8`

### For SOL Token:
- **Token Symbol:** `SOL`
- **Decimals:** `8`

---

## About Etherscan Verification

**What you've already done (2-5 hours ago):**
✅ Submitted source code to Etherscan for verification

**Status:**
- Etherscan is processing verification
- Should be complete within 24 hours (usually faster)
- Once verified, wallets can auto-fetch token info without manual entry

**Once verified on Etherscan:**
- ✅ Wallets will recognize the tokens automatically
- ✅ Token logo and metadata will display
- ✅ Import will work with just the contract address (no manual decimals needed)
- ✅ "Failed to retrieve token information" error will disappear

---

## Troubleshooting

**Q: Why does it say "Failed to retrieve token information"?**
A: Because Etherscan hasn't indexed the contract metadata yet. Use manual import in the meantime.

**Q: Will my tokens be safe after manual import?**
A: Yes! The tokens are on the blockchain. Manual import just adds visibility to your wallet UI.

**Q: Do I need to import again after Etherscan verifies?**
A: No, but you can remove and re-add them to get the verified metadata (including logo, if available).

---

## Contract Information

### Fake Bitcoin (BTC)
- **Type:** ERC-20 Token with Gas Fee Mechanism
- **Initial Supply:** 2.1 BTC
- **Gas Fee:** 2.1 ETH required to transfer
- **Status:** ✅ Deployed and Live on Mainnet

### Solana Token (SOL)
- **Type:** ERC-20 Token with Gas Fee Mechanism
- **Initial Supply:** 120 SOL
- **Gas Fee:** 0.1 ETH required to transfer
- **Status:** ✅ Deployed and Live on Mainnet

---

**Both contracts are 100% live and functional!** 🚀
The only thing pending is Etherscan source code verification (visual/transparency only).
