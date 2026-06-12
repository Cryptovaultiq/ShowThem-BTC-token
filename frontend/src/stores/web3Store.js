import { create } from 'zustand';
import { ethers } from 'ethers';

export const useWeb3Store = create((set) => ({
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,
  isLoading: false,
  error: null,

  setAccount: (account) => set({ account }),
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  setChainId: (chainId) => set({ chainId }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  connect: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      set({
        account: accounts[0],
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnected: true,
        isLoading: false,
      });

      return accounts[0];
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
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
}));

export const useFlashTokenStore = create((set) => ({
  tokenAddress: null,
  balance: '0',
  gasBalance: '0',
  gasFeeBps: 0,
  minGasFee: '0',
  maxGasFee: '0',
  isLoading: false,
  error: null,

  setTokenAddress: (address) => set({ tokenAddress: address }),
  setBalance: (balance) => set({ balance }),
  setGasBalance: (gasBalance) => set({ gasBalance }),
  setGasFeeBps: (bps) => set({ gasFeeBps: bps }),
  setMinGasFee: (fee) => set({ minGasFee: fee }),
  setMaxGasFee: (fee) => set({ maxGasFee: fee }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  loadTokenData: async (contract, account) => {
    set({ isLoading: true, error: null });
    try {
      const balance = await contract.balanceOf(account);
      const gasBalance = await contract.gasBalance(account);
      const gasFeeBps = await contract.gasFeeBps();
      const minGasFee = await contract.minGasFee();
      const maxGasFee = await contract.maxGasFee();

      set({
        balance: ethers.formatEther(balance),
        gasBalance: ethers.formatEther(gasBalance),
        gasFeeBps: Number(gasFeeBps),
        minGasFee: ethers.formatEther(minGasFee),
        maxGasFee: ethers.formatEther(maxGasFee),
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateBalance: async (contract, account) => {
    try {
      const balance = await contract.balanceOf(account);
      const gasBalance = await contract.gasBalance(account);
      set({
        balance: ethers.formatEther(balance),
        gasBalance: ethers.formatEther(gasBalance),
      });
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  },
}));

export const useTransactionStore = create((set) => ({
  transactions: [],
  pendingTransaction: null,

  addTransaction: (tx) => {
    set((state) => ({
      transactions: [{ ...tx, timestamp: Date.now() }, ...state.transactions],
    }));
  },

  setPendingTransaction: (tx) => set({ pendingTransaction: tx }),

  clearPendingTransaction: () => set({ pendingTransaction: null }),
}));
