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
      console.error("Full error object:", error);
      
      // Check if the wallet doesn't support wallet_watchAsset
      if (error.message.includes("wallet_watchAsset does not exist") || 
          error.message.includes("does not exist/is not available") ||
          error.code === -32601) {
        const tokenData = TOKEN_CONFIG[token];
        const isSafePal = window.ethereum?.isSafePal;
        
        let instructions = `⚠️ Auto-import not available. Manual import steps:\n\n1. Open your wallet\n2. Click "+" or "Add Token/Custom Token"\n3. Contract: ${tokenData.address}\n4. Symbol: ${tokenData.symbol}\n5. Decimals: ${tokenData.decimals}\n6. Logo: ${tokenData.image}`;
        
        if (isSafePal) {
          instructions = `SafePal Issue Detected:\n\n${instructions}\n\nOr try:\n• Disconnect and reconnect to SafePal\n• Make sure you're on Ethereum Mainnet\n• Update SafePal to latest version`;
        }
        
        setMessage(instructions);
      } else {
        setMessage(`❌ Error: ${error.message}\n\nTry:\n• Disconnect and reconnect\n• Check you're on Ethereum Mainnet\n• Update your wallet to latest version`);
      }
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
          className={`text-sm px-3 py-2 rounded whitespace-pre-wrap ${
            success
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-yellow-100 text-yellow-800 border border-yellow-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
