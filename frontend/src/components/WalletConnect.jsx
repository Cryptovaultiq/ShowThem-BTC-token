import React, { useState } from "react";
import { useWeb3Store } from "../stores/index";

/**
 * Wallet Connection Component - Connect/disconnect wallet
 * Supports real wallets and demo mode fallback
 */
export default function WalletConnect() {
  const { account, isConnected, isLoading, error, connect, disconnect } = useWeb3Store();
  const [showError, setShowError] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isDemoMode = account?.includes("DEMO");
  const isMobile = () => /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);

  const handleConnect = async (useDemo = false) => {
    setShowError(false);
    try {
      console.log("🔌 Starting wallet connection...");
      // allowDemo is true if useDemo is true OR if not explicitly set to false
      await connect("metamask", useDemo !== false);
    } catch (err) {
      console.error("Connection failed:", err);
      setShowError(true);
    }
  };

  const handleMetaMaskMobile = () => {
    // Deep link to MetaMask mobile app
    const appUrl = `https://metamask.app.link/dapp/${window.location.href.replace(/https?:\/\//, '')}`;
    window.location.href = appUrl;
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
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      {isMobile() && !error && (
        <div className="mb-4 bg-blue-900 border border-blue-700 rounded-lg p-4">
          <p className="text-blue-200 text-sm mb-3">📱 <strong>Mobile User?</strong></p>
          <button
            onClick={handleMetaMaskMobile}
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-all bg-orange-600 hover:bg-orange-700 text-white mb-2"
          >
            🦊 Open in MetaMask Mobile
          </button>
          <p className="text-xs text-blue-300 text-center mb-2">or</p>
        </div>
      )}
      
      <button
        onClick={handleConnect}
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
            Connect Your Web3 Wallet (MetaMask, Coinbase, etc.)
          </>
        )}
      </button>

      {/* Demo Mode - Always Available Option */}
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

      {/* Error Display with Demo Mode Option */}
      {error && (showError || isLoading === false) && (
        <div className="mt-4 bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-200 font-semibold mb-2">Connection Error</p>
              <p className="text-red-300 text-sm mb-3">{error}</p>
              
              <div className="mt-3 text-xs text-red-400 space-y-1 mb-4">
                <p>💡 <strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  {isMobile() ? (
                    <>
                      <li>Open this link in MetaMask mobile app (see button above)</li>
                      <li>Or download MetaMask: https://metamask.io</li>
                      <li>Don't have a wallet? Try Demo Mode below</li>
                    </>
                  ) : (
                    <>
                      <li>Make sure MetaMask or another Web3 wallet extension is installed</li>
                      <li>Check that the wallet extension is enabled in your browser</li>
                      <li>Try clicking the wallet icon in your browser toolbar</li>
                      <li>Refresh the page and try again</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Demo Mode Option */}
              <button
                onClick={() => handleConnect(true)}
                disabled={isLoading}
                className="w-full mt-3 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>📱</span>
                Try Demo Mode (Read-Only)
              </button>
              <p className="text-xs text-red-500 mt-2 text-center">
                Demo mode lets you explore the UI without a wallet installed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
