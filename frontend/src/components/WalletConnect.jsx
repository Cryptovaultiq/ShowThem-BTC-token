import React, { useState, useEffect } from "react";
import { useWeb3Store } from "../stores/index";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { walletConnectConfig, walletConnectMetadata } from "../utils/walletConnectConfig";

/**
 * Wallet Connection Component - Connect/disconnect wallet
 * Supports WalletConnect, detected wallets, and demo mode fallback
 */

// Detect installed wallet extensions (comprehensive coverage)
function detectWallets() {
  const wallets = [];
  const eth = window.ethereum;

  // EVM Provider Detection
  if (eth) {
    if (eth.isMetaMask) wallets.push({ name: "MetaMask", icon: "🦊", id: "metamask" });
    if (eth.isCoinbaseWallet) wallets.push({ name: "Coinbase Wallet", icon: "⬜", id: "coinbase" });
    if (eth.isTrust) wallets.push({ name: "Trust Wallet", icon: "🔐", id: "trust" });
    if (eth.isOkxWallet) wallets.push({ name: "OKX Wallet", icon: "🎭", id: "okx" });
    if (eth.isRabby) wallets.push({ name: "Rabby", icon: "🐰", id: "rabby" });
    if (eth.isBraveWallet) wallets.push({ name: "Brave Wallet", icon: "⚔️", id: "brave" });
    if (eth.isBitKeep || eth.isBitgetWallet) wallets.push({ name: "Bitget Wallet", icon: "🔑", id: "bitget" });
    if (eth.isTokenPocket) wallets.push({ name: "TokenPocket", icon: "🎫", id: "tokenpocket" });
    if (eth.isMathWallet) wallets.push({ name: "MathWallet", icon: "📐", id: "mathwallet" });
    if (eth.isOneInchIOSWallet) wallets.push({ name: "1inch Wallet", icon: "🔄", id: "1inch" });
    if (eth.isSafePal) wallets.push({ name: "SafePal (Desktop)", icon: "🛡️", id: "safepal" });
    if (eth.isTally) wallets.push({ name: "Taho (Tally)", icon: "📊", id: "taho" });
  }

  // Phantom (EVM)
  if (window.phantom?.ethereum) {
    wallets.push({ name: "Phantom (EVM)", icon: "👻", id: "phantom-evm" });
  }

  // Phantom (Solana)
  if (window.phantom?.solana?.isPhantom) {
    wallets.push({ name: "Phantom (Solana)", icon: "👻", id: "phantom-solana" });
  }

  // Solflare
  if (window.solflare?.isSolflare) {
    wallets.push({ name: "Solflare", icon: "☀️", id: "solflare" });
  }

  // Backpack
  if (window.backpack?.isBackpack) {
    wallets.push({ name: "Backpack", icon: "🎒", id: "backpack" });
  }

  // Keplr
  if (window.keplr) {
    wallets.push({ name: "Keplr", icon: "🌌", id: "keplr" });
  }

  // Leap
  if (window.leap) {
    wallets.push({ name: "Leap", icon: "🦘", id: "leap" });
  }

  // XDEFI
  if (window.xfi) {
    wallets.push({ name: "XDEFI", icon: "🔗", id: "xdefi" });
  }

  // Remove duplicates based on name
  const uniqueWallets = Array.from(new Map(wallets.map(w => [w.name, w])).values());

  console.log("🔍 Detected wallets:", uniqueWallets.map(w => w.name).join(", ") || "None");

  return uniqueWallets;
}

export default function WalletConnect() {
  const { account, isConnected, isLoading, error, connect, disconnect } = useWeb3Store();
  const [showError, setShowError] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState([]);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isDemoMode = account?.includes("DEMO");
  const isMobile = () => /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);

  // Detect wallets on mount
  useEffect(() => {
    const wallets = detectWallets();
    setDetectedWallets(wallets);
  }, []);

  const handleConnect = async (useDemo = false) => {
    setShowError(false);
    try {
      console.log("🔌 Starting wallet connection...");
      await connect("metamask", useDemo !== false);
    } catch (err) {
      console.error("Connection failed:", err);
      setShowError(true);
    }
  };

  // Connect via WalletConnect (works across all platforms)
  const handleWalletConnect = async () => {
    setShowError(false);
    try {
      console.log("🌐 Starting WalletConnect...");
      const provider = await EthereumProvider.init({
        ...walletConnectConfig,
        metadata: walletConnectMetadata,
      });

      const accounts = await provider.enable();
      if (accounts && accounts.length > 0) {
        // Store provider in window for ethers to use
        window.ethereum = provider;
        await connect("walletconnect", false);
      }
    } catch (err) {
      console.error("WalletConnect failed:", err);
      if (err.code !== 4001) { // Ignore user cancellation
        setShowError(true);
      }
    }
  };

  const handleDetectedWalletConnect = async (walletId) => {
    setShowWalletModal(false);
    await handleConnect(false);
  };

  // Handle disconnect - properly clear WalletConnect session
  const handleDisconnect = () => {
    console.log("🔌 Disconnecting wallet and clearing session...");
    setShowWalletModal(false);  // Close modal
    setShowError(false);         // Clear any errors
    disconnect();                // Call store disconnect (which clears WalletConnect)
  };

  if (isConnected && account) {
    return (
      <div className={`rounded-lg p-4 flex items-center justify-between shadow-lg ${
        isDemoMode 
          ? 'bg-gradient-to-r from-purple-900 to-purple-800 border border-purple-700'
          : 'bg-gradient-to-r from-green-900 to-green-800 border border-green-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isDemoMode ? 'bg-purple-400' : 'bg-green-400'}`} />
          <div>
            <p className={`text-xs ${isDemoMode ? 'text-purple-300' : 'text-green-300'}`}>
              {isDemoMode ? '📱 Demo Mode' : 'Connected Wallet'}
            </p>
            <p className="font-mono text-white font-semibold">{formatAddress(account)}</p>
          </div>
          {isDemoMode && (
            <span className="ml-2 px-2 py-1 bg-purple-800 text-purple-200 text-xs rounded font-semibold">
              READ-ONLY
            </span>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      {isConnected && account ? (
        // Connected State
        <div className={`rounded-lg p-4 flex items-center justify-between shadow-lg ${
          isDemoMode 
            ? 'bg-gradient-to-r from-purple-900 to-purple-800 border border-purple-700'
            : 'bg-gradient-to-r from-green-900 to-green-800 border border-green-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isDemoMode ? 'bg-purple-400' : 'bg-green-400'}`} />
            <div>
              <p className={`text-xs ${isDemoMode ? 'text-purple-300' : 'text-green-300'}`}>
                {isDemoMode ? '📱 Demo Mode' : 'Connected Wallet'}
              </p>
              <p className="font-mono text-white font-semibold">{formatAddress(account)}</p>
            </div>
            {isDemoMode && (
              <span className="ml-2 px-2 py-1 bg-purple-800 text-purple-200 text-xs rounded font-semibold">
                READ-ONLY
              </span>
            )}
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      ) : (
        // Not Connected State
        <div>
          <button
            onClick={() => setShowWalletModal(true)}
            disabled={isLoading}
            className={`w-full px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-lg ${
              isLoading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Connecting...
              </>
            ) : (
              <>
                <span>👛</span>
                Connect Your Wallet
              </>
            )}
          </button>

          {/* Demo Mode - Always Available */}
          {!error && (
            <button
              onClick={() => handleConnect(true)}
              disabled={isLoading}
              className="w-full mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              Continue as Guest (Demo Mode)
            </button>
          )}

          {/* Wallet Selection Modal */}
          {showWalletModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-white mb-4">Select Wallet</h2>

                {/* Detected Installed Wallets */}
                {detectedWallets.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Detected Wallets</p>
                    <div className="space-y-2">
                      {detectedWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => handleDetectedWalletConnect(wallet.id)}
                          disabled={isLoading}
                          className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-3 font-semibold"
                        >
                          <span className="text-2xl">{wallet.icon}</span>
                          <span>{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="my-4 border-t border-gray-700"></div>
                  </div>
                )}

                {/* WalletConnect Option */}
                <button
                  onClick={handleWalletConnect}
                  disabled={isLoading}
                  className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-3 font-semibold mb-3"
                >
                  <span className="text-2xl">🌐</span>
                  <div className="text-left">
                    <div>WalletConnect</div>
                    <div className="text-xs text-gray-300">Works with all mobile wallets</div>
                  </div>
                </button>

                {/* Close Modal */}
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (showError || isLoading === false) && (
            <div className="mt-4 bg-red-900 border border-red-700 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-200 font-semibold mb-2">Connection Error</p>
                  <p className="text-red-300 text-sm mb-3">{error}</p>
                  
                  <div className="mt-3 text-xs text-red-400 space-y-1 mb-4">
                    <p>💡 <strong>Solutions:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {isMobile() ? (
                        <>
                          <li>Use WalletConnect to connect any mobile wallet</li>
                          <li>Or install MetaMask mobile app</li>
                          <li>Not ready? Try Demo Mode below</li>
                        </>
                      ) : (
                        <>
                          <li>Install a Web3 wallet extension</li>
                          <li>Or use WalletConnect for any wallet</li>
                          <li>Try Demo Mode for read-only access</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleConnect(true)}
                    disabled={isLoading}
                    className="w-full mt-3 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-semibold"
                  >
                    <span>👁️</span> Demo Mode (Read-Only)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
