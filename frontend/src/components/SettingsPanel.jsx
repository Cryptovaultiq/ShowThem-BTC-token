import React from "react";
import { useTokenStore, useSettingsStore } from "../stores/index";

/**
 * Settings Component - Token selection and preferences
 */
export default function SettingsPanel() {
  const { selectedToken, selectToken, prices, tokenData } = useTokenStore();
  const { showPrices, updateSettings } = useSettingsStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const tokens = [
    {
      symbol: "BTC",
      name: "Fake Bitcoin",
      decimals: 8,
      icon: "₿",
      color: "from-orange-500 to-orange-600",
    },
    {
      symbol: "SOL",
      name: "Solana Token",
      decimals: 8,
      icon: "◎",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const currentToken = tokens.find((t) => t.symbol === selectedToken);

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm font-medium">
          {currentToken?.symbol}
        </span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 z-50">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>

          {/* Header */}
          <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Token
            </label>
            <div className="space-y-2">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    selectToken(token.symbol);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-lg transition-all text-left ${
                    selectedToken === token.symbol
                      ? `bg-gradient-to-r ${token.color} text-white`
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{token.name}</div>
                      <div className="text-xs opacity-75">
                        {token.decimals} decimals
                      </div>
                    </div>
                    <div className="text-2xl">{token.icon}</div>
                  </div>

                  {/* Price Display */}
                  {showPrices && prices[token.symbol] > 0 && (
                    <div className="text-sm mt-2 opacity-90">
                      ${prices[token.symbol].toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Token Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              {selectedToken} Balance
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Token Balance:</span>
                <span className="text-white font-mono">
                  {tokenData[selectedToken]?.balance || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Balance (ETH):</span>
                <span className="text-white font-mono">
                  {(
                    Number(tokenData[selectedToken]?.gasBalance || 0) / 1e18
                  ).toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="border-t border-gray-700 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrices}
                onChange={(e) => updateSettings({ showPrices: e.target.checked })}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600"
              />
              <span className="text-sm text-gray-300">Show real-time prices</span>
            </label>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-xs text-gray-500 border-t border-gray-700 pt-4">
            <p>
              💡 Select the token you want to transfer. Prices are powered by
              CoinGecko.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
