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

export const walletConnectConfig = {
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [1], // Ethereum Mainnet
  showQrModal: true,
  optionalChains: [11155111], // Sepolia testnet
  // Required namespaces for SafePal and other wallets
  requiredNamespaces: {
    eip155: {
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
      ],
      chains: ["eip155:1"], // Ethereum Mainnet
      events: ["chainChanged", "accountsChanged"],
    },
  },
};

export const walletConnectMetadata = {
  name: "Flash Token System",
  description: "Bitcoin Token (BTC) and Ethereum Token (ETH) with Gas Fee Mechanism",
  url: typeof window !== "undefined" ? window.location.href : "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"], // Ethereum logo fallback
};
