import React, { useState } from "react";

/**
 * AddToWalletButton - Adds BTC or SOL token to wallet with logo using wallet_watchAsset
 * Works with: MetaMask, SafePal, TrustWallet, Coinbase, and 80%+ of wallets
 * 
 * Token Configuration:
 * - BTC: 0x55E6b22e6f4A350a75502AFAe7F3d56192426B57 (Decimals: 8, Logo: GitHub CDN)
 * - SOL: 0xC29618eB77aa594Cb533BC004D804ACE21103b8B (Decimals: 8, Logo: GitHub CDN)
 */

const TOKEN_CONFIG = {
  BTC: {
    address: "0x55E6b22e6f4A350a75502AFAe7F3d56192426B57",
    symbol: "BTC",
    decimals: 8,
    name: "Bitcoin Token",
    image: "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/frontend/public/BTC.png",
  },
  SOL: {
    address: "0xC29618eB77aa594Cb533BC004D804ACE21103b8B",
    symbol: "SOL",
    decimals: 8,
    name: "Solana Token",
    image: "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/frontend/public/Solana1.png",
  },
};

export default function AddToWalletButton({ token = "BTC" }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddToWallet = async () => {
    // Check if MetaMask/wallet is installed
    if (!window.ethereum) {
      setMessage("❌ Wallet not found. Please install MetaMask or compatible wallet.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const tokenData = TOKEN_CONFIG[token];

      if (!tokenData) {
        setMessage("❌ Invalid token");
        setSuccess(false);
        return;
      }

      // Call wallet_watchAsset method
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Standard ERC-20
          options: {
            address: tokenData.address, // Contract address
            symbol: tokenData.symbol, // Token symbol (BTC or SOL)
            decimals: tokenData.decimals, // 8 decimals
            image: tokenData.image, // Logo from GitHub CDN
          },
        },
      });

      if (wasAdded) {
        setMessage(`✅ ${tokenData.name} (${tokenData.symbol}) added to wallet!`);
        setSuccess(true);
      } else {
        setMessage("⚠️ You cancelled the token import.");
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error adding token to wallet:", error);
      setMessage(`❌ Error: ${error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAddToWallet}
        disabled={loading}
        className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
          success
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {loading ? "Adding..." : `Add ${TOKEN_CONFIG[token]?.symbol} to Wallet`}
      </button>

      {message && (
        <div
          className={`text-sm text-center px-3 py-2 rounded ${
            success
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
