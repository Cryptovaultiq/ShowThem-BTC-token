/**
 * WalletConnect Configuration
 * 
 * To get a Project ID:
 * 1. Go to https://cloud.walletconnect.com
 * 2. Sign up or login
 * 3. Create a new project
 * 4. Copy your Project ID
 * 5. Add to frontend/.env as VITE_WALLETCONNECT_PROJECT_ID
 */

export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "12345678901234567890123456789012";

/**
 * WalletConnect v2 Configuration
 * EthereumProvider automatically converts chains array to proper namespaces
 * Supports all major wallets: MetaMask, SafePal, Trust Wallet, Coinbase, OKX, Phantom, etc.
 */
export const walletConnectConfig = {
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [1], // Ethereum Mainnet (chain ID 1)
  showQrModal: true,
  // EthereumProvider internally handles namespace generation from chains array
};

/**
 * Optional: For multi-chain support in the future, add more chain IDs:
 * chains: [1, 56, 137, 8453] // Ethereum, BNB Smart Chain, Polygon, Base
 */

export const walletConnectMetadata = {
  name: "Flash Token System",
  description: "Bitcoin Token (BTC) and Ethereum Token (ETH) with Gas Fee Mechanism",
  url: typeof window !== "undefined" ? window.location.href : "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"], // Ethereum logo fallback
};
