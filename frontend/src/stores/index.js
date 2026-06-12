import { create } from "zustand";
import { ethers } from "ethers";

// Zustand stores for state management

// Web3 Store - Wallet and network state
export const useWeb3Store = create((set) => ({
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,
  isLoading: false,
  error: null,
  walletType: "metamask", // 'metamask', 'walletconnect', 'coinbase', etc.

  // Connect wallet (with demo/mock fallback if no wallet available)
  connect: async (walletType = "metamask", allowDemo = true) => {
    set({ isLoading: true, error: null });
    
    console.log("🔌 Attempting to connect wallet...");
    console.log("window.ethereum available?", typeof window.ethereum !== "undefined");
    
    try {
      // Check if any wallet is installed
      if (typeof window.ethereum === "undefined") {
        // If no real wallet but demo mode allowed, use mock/demo account
        if (allowDemo) {
          console.log("📱 No real wallet detected - using DEMO MODE");
          const mockAccount = "0xDEMO0000000000000000000000000000DEMO0001";
          const mockChainId = 1; // Mainnet
          
          // Create a read-only demo provider (no network calls)
          set({
            account: mockAccount,
            provider: null, // No provider in demo mode
            signer: null, // No signer in demo mode (read-only)
            chainId: mockChainId,
            isConnected: true,
            walletType: "demo",
          });
          
          console.log("✅ DEMO MODE connected! Account:", mockAccount);
          console.log("⚠️ Demo mode is READ-ONLY. Install MetaMask to enable transactions.");
          set({ isLoading: false });
          return;
        }
        
        const errorMsg = "❌ No Web3 wallet detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet browser extension.";
        console.error(errorMsg);
        set({ error: errorMsg, isLoading: false });
        return;
      }
      
      console.log("✅ Real wallet detected - connecting to it...");
      console.log("Wallet type:", window.ethereum.isMetaMask ? "MetaMask" : "Other Web3 Wallet");

      let provider;
      let accounts;

      // Try to connect to any available Web3 wallet via window.ethereum
      try {
        console.log("📤 Requesting account access...");
        accounts = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts returned from wallet");
        }

        console.log("✅ Connected account:", accounts[0]);
        
        provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();

        console.log("✅ Network:", network.name, "Chain ID:", network.chainId);

        set({
          account: accounts[0],
          provider,
          signer,
          chainId: Number(network.chainId),
          isConnected: true,
          walletType: window.ethereum.isMetaMask ? "metamask" : "web3",
        });

        console.log("✅ Wallet connected successfully!");
      } catch (requestError) {
        console.error("❌ Account request error:", requestError);
        
        if (requestError.code === 4001) {
          throw new Error("Connection rejected by user");
        } else if (requestError.code === -32002) {
          throw new Error("Connection request already pending. Check your wallet extension.");
        } else {
          throw new Error(`Connection failed: ${requestError.message}`);
        }
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to connect wallet";
      console.error("❌ Wallet connection error:", errorMsg);
      set({ error: errorMsg });
    } finally {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    set({
      account: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
      error: null,
    });
  },

  setError: (error) => set({ error }),
}));

// Token Store - Token selection and data
export const useTokenStore = create((set) => ({
  selectedToken: "BTC", // 'BTC' or 'ETH'
  tokenAddresses: {
    BTC: import.meta.env.VITE_FAKE_BTC_ADDRESS || "",
    ETH: import.meta.env.VITE_FAKE_ETH_ADDRESS || "",
  },
  tokenData: {
    BTC: {
      name: "Fake Bitcoin",
      symbol: "BTC",
      decimals: 8,
      balance: "0",
      gasBalance: "0",
    },
    ETH: {
      name: "Fake Ethereum",
      symbol: "ETH",
      decimals: 18,
      balance: "0",
      gasBalance: "0",
    },
  },
  prices: {
    BTC: 0,
    ETH: 0,
  },

  // Switch token
  selectToken: (token) => set({ selectedToken: token }),

  // Update token balance
  updateTokenBalance: (token, balance) => {
    set((state) => ({
      tokenData: {
        ...state.tokenData,
        [token]: {
          ...state.tokenData[token],
          balance,
        },
      },
    }));
  },

  // Update gas balance
  updateGasBalance: (token, gasBalance) => {
    set((state) => ({
      tokenData: {
        ...state.tokenData,
        [token]: {
          ...state.tokenData[token],
          gasBalance,
        },
      },
    }));
  },

  // Update prices
  updatePrices: (prices) => set({ prices }),
}));

// Transaction Store - Transaction history
export const useTransactionStore = create((set) => ({
  transactions: [],
  pendingTransaction: null,

  addTransaction: (tx) => {
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          ...tx,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  setPendingTransaction: (tx) => set({ pendingTransaction: tx }),

  clearPendingTransaction: () => set({ pendingTransaction: null }),
}));

// Settings Store - User preferences
export const useSettingsStore = create((set) => ({
  autoRefresh: true,
  refreshInterval: 5000, // 5 seconds
  showPrices: true,
  selectedWallet: "metamask",

  updateSettings: (settings) => {
    set((state) => ({
      ...state,
      ...settings,
    }));
  },
}));
