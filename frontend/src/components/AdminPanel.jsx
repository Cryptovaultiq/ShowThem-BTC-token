import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3Store, useTokenStore } from "../stores/index";
import { FAKE_BTC_ABI } from "../abis/index";

/**
 * Admin Panel - Send tokens to wallet addresses without gas fees
 * And set custom gas fees for each recipient
 * Only owner/admin can use this
 */
export default function AdminPanel() {
  const { account, signer, isConnected } = useWeb3Store();
  const { selectedToken, tokenAddresses, tokenData } = useTokenStore();

  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [customGasFee, setCustomGasFee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const contractAddress = tokenAddresses[selectedToken];
  const decimals = selectedToken === "BTC" ? 8 : 8; // Both have 8 decimals
  const maxSupply = selectedToken === "BTC" ? 2.1 : 120; // BTC max 2.1, SOL max 120

  // Gas fee configuration - Admin sends WITHOUT gas fee, but we can set custom gas fees for users
  const gasFeeConfig = {
    BTC: {
      paymentToken: "ETH",
      defaultAmount: "2.1",
      defaultDecimals: 18,
      displayDefault: "2.1 ETH (~$6300)"
    },
    SOL: {
      paymentToken: "ETH",
      defaultAmount: "0.1",
      defaultDecimals: 18,
      displayDefault: "0.1 ETH (~$300)"
    }
  };

  const currentFeeConfig = gasFeeConfig[selectedToken];

  // Check if connected account is admin/owner
  useEffect(() => {
    const checkAdmin = async () => {
      if (!signer || !contractAddress) {
        setIsAdmin(false);
        return;
      }

      try {
        const contract = new ethers.Contract(contractAddress, FAKE_BTC_ABI, signer);
        const owner = await contract.owner();
        setIsAdmin(owner.toLowerCase() === account?.toLowerCase());
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [account, signer, contractAddress]);

  const handleSendToWallet = async () => {
    if (!isAdmin) {
      setError("Only admin/owner can send tokens");
      return;
    }

    if (!isConnected || !signer) {
      setError("Please connect wallet first");
      return;
    }

    if (!receiverAddress || !ethers.isAddress(receiverAddress)) {
      setError("Invalid receiver address");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(amount) > maxSupply) {
      setError(`Amount cannot exceed ${maxSupply} ${selectedToken}`);
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const contract = new ethers.Contract(contractAddress, FAKE_BTC_ABI, signer);
      const amountWei = ethers.parseUnits(amount, decimals);

      console.log(`📤 Admin sending ${amount} ${selectedToken} to ${receiverAddress}`);
      console.log(`💰 Setting custom gas fee: ${customGasFee || currentFeeConfig.displayDefault}`);

      // Send token to wallet
      const tx = await contract.transfer(receiverAddress, amountWei);
      console.log(`⏳ Transfer pending: ${tx.hash}`);
      await tx.wait();

      // Set custom gas fee if provided
      if (customGasFee && Number(customGasFee) > 0) {
        const gasFeeWei = ethers.parseUnits(customGasFee, currentFeeConfig.defaultDecimals);
        console.log(`⏳ Setting custom gas fee: ${customGasFee} ${currentFeeConfig.paymentToken}`);
        const feeTx = await contract.setCustomGasFee(receiverAddress, gasFeeWei);
        console.log(`⏳ Gas fee setup pending: ${feeTx.hash}`);
        await feeTx.wait();

        setResult({
          success: true,
          hash: tx.hash,
          feeHash: feeTx.hash,
          message: `✅ Sent ${amount} ${selectedToken} to ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)} with custom gas fee: ${customGasFee} ${currentFeeConfig.paymentToken}`,
        });
      } else {
        setResult({
          success: true,
          hash: tx.hash,
          message: `✅ Sent ${amount} ${selectedToken} to ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)} (default gas fee: ${currentFeeConfig.displayDefault})`,
        });
      }

      // Clear form
      setReceiverAddress("");
      setAmount("");
      setCustomGasFee("");
    } catch (err) {
      const errorMsg = err.reason || err.message || "Transfer failed";
      setError(errorMsg);
      setResult({
        success: false,
        message: `❌ Transfer failed: ${errorMsg}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if not admin
  if (!isAdmin || !isConnected) {
    return null;
  }

  // Check if in demo mode
  const isDemoMode = account?.includes("DEMO");

  return (
    <div className="bg-gradient-to-br from-yellow-900 to-orange-900 border border-orange-700 rounded-xl p-6 shadow-xl mb-8">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="text-2xl">👑</span>
        Admin Panel - Send & Set Gas Fees
      </h2>
      <p className="text-sm text-orange-200 mb-6">
        Owner only - Send tokens without gas fees, set custom gas fees per recipient
      </p>

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="bg-purple-900 border border-purple-700 rounded-lg p-4 mb-5">
          <div className="flex gap-3">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-purple-200 font-semibold">Demo Mode Active</p>
              <p className="text-purple-300 text-sm mt-1">
                You're in demo/read-only mode. To send real tokens, connect a real wallet (MetaMask, Coinbase, etc.)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Status */}
      <div className="bg-orange-800 rounded-lg p-4 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-orange-300">Admin Status:</span>
          <span className="text-lg font-mono text-white font-semibold">✅ ADMIN</span>
        </div>
      </div>

      {/* Receiver Address */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-orange-200 mb-2">
          Receiver Wallet Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
        />
      </div>

      {/* Amount Input */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-orange-200 mb-2">
          Amount ({selectedToken})
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step={selectedToken === "BTC" ? "0.00000001" : "0.000000000000000001"}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
          />
          <button
            onClick={() => setAmount(maxSupply.toString())}
            className="px-3 py-2 bg-gray-700 hover:bg-orange-600 text-gray-300 hover:text-white rounded-lg transition-colors font-semibold"
          >
            MAX
          </button>
        </div>
        <p className="text-xs text-orange-300 mt-2">Max supply: {maxSupply} {selectedToken}</p>
      </div>

      {/* Custom Gas Fee Input */}
      <div className="mb-5 p-4 bg-orange-800 bg-opacity-40 border border-orange-700 rounded-lg">
        <label className="block text-sm font-medium text-orange-200 mb-2">
          🔄 Custom Gas Fee (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder={currentFeeConfig.displayDefault}
            value={customGasFee}
            onChange={(e) => setCustomGasFee(e.target.value)}
            step={currentFeeConfig.defaultDecimals === 8 ? "0.00000001" : "0.000000000000000001"}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm"
          />
          <span className="flex items-center px-3 py-2 bg-gray-700 rounded-lg text-white text-sm font-mono">
            {currentFeeConfig.paymentToken}
          </span>
        </div>
        <p className="text-xs text-orange-300">
          Leave empty to use default: {currentFeeConfig.displayDefault}
        </p>
        <p className="text-xs text-orange-300 mt-1">
          💡 Each recipient can have a different gas fee requirement
        </p>
      </div>

      {/* Fee Summary */}
      {amount && (
        <div className="mb-5 p-4 bg-gray-700 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Sending:</span>
            <span className="text-white font-mono">{amount} {selectedToken}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Recipient's Gas Fee:</span>
            <span className="text-orange-300 font-mono font-bold">
              {customGasFee || currentFeeConfig.displayDefault}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            • Admin pays: ZERO ETH (no gas fee)
            • Recipient will pay {customGasFee || currentFeeConfig.displayDefault} to transfer {selectedToken}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`rounded-lg p-4 mb-4 border ${
            result.success
              ? "bg-green-900 border-green-700 text-green-200"
              : "bg-red-900 border-red-700 text-red-200"
          }`}
        >
          <p className="text-sm font-semibold mb-2">{result.message}</p>
          {result.hash && (
            <a
              href={`https://etherscan.io/tx/${result.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline hover:opacity-80 block mb-1"
            >
              View Transfer on Etherscan →
            </a>
          )}
          {result.feeHash && (
            <a
              href={`https://etherscan.io/tx/${result.feeHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline hover:opacity-80"
            >
              View Gas Fee Setup on Etherscan →
            </a>
          )}
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSendToWallet}
        disabled={isLoading || !receiverAddress || !amount || isDemoMode}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          isLoading || !receiverAddress || !amount || isDemoMode
            ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-lg hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Processing...
          </>
        ) : (
          <>
            <span>📤</span>
            Send {selectedToken} & Set Gas Fee
          </>
        )}
      </button>

      {/* Demo Mode Message */}
      {isDemoMode && (
        <div className="mt-4 p-3 bg-purple-900 border border-purple-700 rounded-lg text-xs text-purple-200 text-center">
          📱 Demo mode is read-only. Disconnect and install MetaMask to send real transactions.
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-orange-900 bg-opacity-50 border border-orange-700 rounded-lg text-xs text-orange-200 space-y-2">
        <p>
          👑 <strong>Admin Benefits:</strong> No gas fee to send tokens
        </p>
        <p>
          🔄 <strong>Custom Fees:</strong> Set different gas requirements for each recipient
        </p>
        <p>
          💰 <strong>Example:</strong> Send $45K BTC to wallet-1 with $60 ETH fee, send $200 BTC to wallet-2 with $10 ETH fee
        </p>
      </div>
    </div>
  );
}
