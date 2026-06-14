import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Store, useTokenStore, useSettingsStore } from './stores/index';
import { fetchCryptoPrices } from './utils/coingecko';
import { FAKE_BTC_ABI } from './abis/index';
import WalletConnect from './components/WalletConnect';
import SettingsPanel from './components/SettingsPanel';
import AdminPanel from './components/AdminPanel';
import BalanceCard from './components/BalanceCard';
import GasPaymentCard from './components/GasPaymentCard';
import TokenTransferCard from './components/TokenTransferCard';
import './App.css';

// Default contract addresses
const FAKE_BTC_ADDRESS = import.meta.env.VITE_FAKE_BTC_ADDRESS || '';
const SOLANA_TOKEN_ADDRESS = import.meta.env.VITE_SOLANA_TOKEN_ADDRESS || '';

export function App() {
  const { account, provider, signer, isConnected } = useWeb3Store();
  const { selectedToken, updateTokenBalance, updateGasBalance, updatePrices, tokenAddresses } = useTokenStore();
  const { autoRefresh, refreshInterval } = useSettingsStore();

  const [network, setNetwork] = useState(null);
  const [contracts, setContracts] = useState({ BTC: null, SOL: null });
  const [isInitialized, setIsInitialized] = useState(false);

  // Set contract addresses in store
  useEffect(() => {
    if (FAKE_BTC_ADDRESS) {
      updateTokenBalance('BTC', '0');
    }
    if (SOLANA_TOKEN_ADDRESS) {
      updateTokenBalance('SOL', '0');
    }
  }, []);

  // Initialize contracts (BTC and SOL)
  useEffect(() => {
    // Check if addresses are valid (not placeholders or empty)
    const isValidAddress = (addr) => {
      return addr && addr.startsWith('0x') && addr.length === 42 && addr !== '0x...';
    };

    if (!signer) {
      setContracts({ BTC: null, SOL: null });
      return;
    }

    const newContracts = { BTC: null, SOL: null };
    let hasContract = false;

    try {
      if (isValidAddress(FAKE_BTC_ADDRESS)) {
        const btcContract = new ethers.Contract(FAKE_BTC_ADDRESS, FAKE_BTC_ABI, signer);
        newContracts.BTC = btcContract;
        hasContract = true;
        console.log('✅ FakeBTC Contract initialized:', FAKE_BTC_ADDRESS);
      } else if (FAKE_BTC_ADDRESS === '0x...') {
        console.log('⚠️ BTC Contract address not configured. Update VITE_FAKE_BTC_ADDRESS in frontend/.env');
      }

      if (isValidAddress(SOLANA_TOKEN_ADDRESS)) {
        const solContract = new ethers.Contract(SOLANA_TOKEN_ADDRESS, FAKE_BTC_ABI, signer);
        newContracts.SOL = solContract;
        hasContract = true;
        console.log('✅ Solana Token Contract initialized:', SOLANA_TOKEN_ADDRESS);
      } else if (SOLANA_TOKEN_ADDRESS === '0x...') {
        console.log('⚠️ SOL Contract address not configured. Update VITE_SOLANA_TOKEN_ADDRESS in frontend/.env');
      }

      if (!hasContract) {
        console.log('⚠️ No valid contract addresses configured');
      }

      setContracts(newContracts);
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      setContracts({ BTC: null, SOL: null });
    }
  }, [signer, FAKE_BTC_ADDRESS, SOLANA_TOKEN_ADDRESS]);

  // Load token balances
  useEffect(() => {
    // Handle demo mode
    if (account?.includes("DEMO")) {
      console.log("📱 Demo mode - skipping balance loading");
      setIsInitialized(true);
      return;
    }

    // Check if contracts are initialized
    const selectedContract = contracts[selectedToken];
    if (!account || !isConnected || !selectedContract) {
      setIsInitialized(selectedContract ? true : false);
      return;
    }

    const loadBalances = async () => {
      try {
        const tokenDecimals = selectedToken === "BTC" ? 8 : 8; // Both have 8 decimals
        const contractAddress = selectedToken === "BTC" ? FAKE_BTC_ADDRESS : SOLANA_TOKEN_ADDRESS;

        console.log(`📊 Loading ${selectedToken} balance for`, account);
        console.log('🔗 Network:', network?.name, 'Chain ID:', network?.chainId);
        console.log(`📝 ${selectedToken} Contract Address:`, contractAddress);
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`⏱️ Timeout loading ${selectedToken} balance after 10 seconds`)), 10000)
        );
        
        // Check if contract has code at that address
        if (provider) {
          try {
            const codePromise = provider.getCode(contractAddress);
            const code = await Promise.race([codePromise, timeoutPromise]);
            console.log(`🔍 ${selectedToken} Contract has code on-chain:`, code !== '0x');
            if (code === '0x') {
              console.warn(`⚠️ ERROR: No contract code at ${selectedToken} address on current network!`);
              console.warn('⚠️ Make sure you are connected to Ethereum Mainnet (Chain ID: 1)');
              console.warn(`⚠️ Contract address: ${contractAddress}`);
              setIsInitialized(true);
              return;
            }
          } catch (codeCheckError) {
            console.warn(`⚠️ Could not verify contract code:`, codeCheckError.message);
            // Continue anyway - might just be a network issue
          }
        }
        
        console.log(`📤 Calling balanceOf() on ${selectedToken} contract...`);
        
        // Wrap balance calls with timeout
        const balancePromise = Promise.all([
          selectedContract.balanceOf(account),
          selectedContract.gasBalance(account),
        ]);
        
        const [balance, gasBalance] = await Promise.race([
          balancePromise,
          timeoutPromise
        ]);

        // Format balance
        const formatted = ethers.formatUnits(balance, tokenDecimals);

        console.log(`✅ Raw ${selectedToken} balance:`, balance.toString());
        console.log(`✅ Formatted ${selectedToken} Balance:`, formatted);

        updateTokenBalance(selectedToken, formatted);
        updateGasBalance(selectedToken, gasBalance.toString());

        setIsInitialized(true);
      } catch (error) {
        console.error(`❌ Error loading ${selectedToken} balance:`, error.message);
        console.error('❌ Full error:', error);
        console.log('💡 Troubleshooting:');
        console.log('  1. Are you connected to Ethereum Mainnet (Chain ID 1)?');
        const addr = selectedToken === "BTC" ? FAKE_BTC_ADDRESS : SOLANA_TOKEN_ADDRESS;
        console.log(`  2. Is the ${selectedToken} contract address correct?`, addr);
        console.log(`  3. Can you access it on Etherscan?`, `https://etherscan.io/address/${addr}`);
        
        // Check if it's a timeout error
        if (error.message.includes('Timeout')) {
          console.warn('⏱️ Request timed out. This could mean:');
          console.warn('  - The RPC provider is slow or rate-limited');
          console.warn('  - The contract is not deployed on this network');
          console.warn('  - You are not connected to mainnet');
        }
        
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
  }, [account, isConnected, contracts, selectedToken, autoRefresh, refreshInterval]);

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
              Send BTC or SOL fake tokens that appear in wallets but require gas fees to transfer
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
              {(!FAKE_BTC_ADDRESS || !SOLANA_TOKEN_ADDRESS || FAKE_BTC_ADDRESS === '0x...' || SOLANA_TOKEN_ADDRESS === '0x...') && (
                <div className="mb-8 bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
                  <p className="font-semibold mb-2">⚠️ Contracts Not Deployed</p>
                  <p className="text-sm mb-3">
                    Contract addresses are not configured. You need to:
                  </p>
                  <ol className="text-sm list-decimal list-inside space-y-1">
                    <li>Deploy FakeBTC and SolanaToken contracts to mainnet</li>
                    <li>Copy the contract addresses from deployment output</li>
                    <li>Update <code className="bg-black/30 px-2 py-1 rounded">VITE_FAKE_BTC_ADDRESS</code> and <code className="bg-black/30 px-2 py-1 rounded">VITE_SOLANA_TOKEN_ADDRESS</code> in <code className="bg-black/30 px-2 py-1 rounded">frontend/.env</code></li>
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
                    <p>Select a token (BTC or SOL) from settings or the token selector</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">2.</span>
                    <p>View your fake token balance in the Balance Card</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">3.</span>
                    <p><strong>Admin Only:</strong> Send tokens to users without gas fees</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">4.</span>
                    <p><strong>Users:</strong> Pay gas fee in ETH to enable transfers</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-bold">5.</span>
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
          <p>Fake Token System v3.0 | BTC & SOL Support | Powered by Mainnet</p>
        </div>
      </div>
    </div>
  );
}

export default App;
