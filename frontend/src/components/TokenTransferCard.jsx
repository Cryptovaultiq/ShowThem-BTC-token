import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3Store, useTokenStore, useTransactionStore } from "../stores/index";
import { formatTokenAmount, convertToUSD } from "../utils/coingecko";
import { FAKE_BTC_ABI } from "../abis/index";

/**
 * Token Transfer Card - Send fake tokens with controllable amounts
 */
export default function TokenTransferCard() {
  const { account, signer, isConnected } = useWeb3Store();
  const { selectedToken, tokenAddresses, tokenData, prices } = useTokenStore();
  const { addTransaction } = useTransactionStore();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasFee, setGasFee] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const contractAddress = tokenAddresses[selectedToken];
  const decimals = selectedToken === "BTC" ? 8 : 18;
  const token = tokenData[selectedToken];

  // Calculate gas fee when amount changes
  useEffect(() => {
    const calculateFee = async () => {
      if (!amount || !signer || !contractAddress) return;

      try {
        const contract = new ethers.Contract(contractAddress, FAKE_BTC_ABI, signer);
        const amountWei = ethers.parseUnits(amount, decimals);
        const fee = await contract.calculateGasFee(amountWei);
        setGasFee(ethers.formatEther(fee));
      } catch (err) {
        console.error("Fee calculation error:", err);
      }
    };

    calculateFee();
  }, [amount, signer, contractAddress, decimals]);

  const handleTransfer = async () => {
    if (!isConnected) {
      setError("Please connect wallet first");
      return;
    }

    if (!recipient || !ethers.isAddress(recipient)) {
      setError("Invalid recipient address");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const contract = new ethers.Contract(contractAddress, FLASH_TOKEN_ABI, signer);
      const amountWei = ethers.parseUnits(amount, decimals);

      console.log(`💸 Transferring ${amount} ${selectedToken} to ${recipient}`);
      const tx = await contract.transfer(recipient, amountWei);

      console.log(`⏳ Transaction pending: ${tx.hash}`);
      const receipt = await tx.wait();

      setResult({
        success: true,
        hash: tx.hash,
        message: `✅ Successfully sent ${amount} ${selectedToken} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      });

      // Add to transaction history
      addTransaction({
        type: "transfer",
        token: selectedToken,
        amount,
        recipient,
        hash: tx.hash,
      });

      // Clear form
      setRecipient("");
      setAmount("");
    } catch (err) {
      const errorMsg = err.reason || err.message || "Transfer failed";
      setError(errorMsg);
      setResult({
        success: false,
        message: `❌ Transfer blocked: ${errorMsg}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick send buttons for common amounts
  const quickAmounts = ["10", "50", "100", "500"];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">💸</span>
        Send {selectedToken}
      </h2>

      {/* Recipient Address */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Recipient Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Amount Input */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount ({selectedToken})
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step={selectedToken === "BTC" ? "0.00000001" : "0.000000000000000001"}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <span
            className="flex items-center px-3 py-2 bg-gray-700 rounded-lg text-gray-300 text-sm font-mono cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => setAmount(token?.balance || "0")}
            title="Click to use max balance"
          >
            MAX
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount)}
              className="px-3 py-2 text-xs font-semibold bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-all"
            >
              {quickAmount}
            </button>
          ))}
        </div>

        {/* USD Conversion */}
        {amount && prices[selectedToken] > 0 && (
          <div className="text-sm text-gray-400">
            ≈ {convertToUSD(Number(amount), selectedToken, prices)}
          </div>
        )}
      </div>

      {/* Gas Fee Info - Cross-Token */}
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 border border-orange-700 rounded-lg p-4 mb-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-orange-300 mb-2">🔄 Gas Fee Required</h4>
          <div className="bg-black bg-opacity-40 rounded p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-orange-300 text-sm">Payment Token:</span>
              <span className="text-white font-mono text-sm">
                {selectedToken === "BTC" ? "ETH" : "BTC"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-300 text-sm">Fixed Amount:</span>
              <span className="text-white font-mono text-sm font-bold">
                {selectedToken === "BTC" ? "2.1 ETH (~$6300)" : "0.02 BTC (~$2100)"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-orange-200 p-2 bg-black bg-opacity-30 rounded">
          💡 You must pay in <strong>{selectedToken === "BTC" ? "ETH" : "BTC"}</strong> to transfer {selectedToken}
        </div>
      </div>

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
              href={`https://sepolia.etherscan.io/tx/${result.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline hover:opacity-80"
            >
              View on Etherscan →
            </a>
          )}
        </div>
      )}

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        disabled={isLoading || !isConnected || !amount}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          isLoading || !isConnected || !amount
            ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Transferring...
          </>
        ) : (
          <>
            <span>📤</span>
            Send {selectedToken}
          </>
        )}
      </button>

      {/* Info Box - Cross-Token Fee Requirement */}
      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-xs text-blue-200">
        <p className="mb-2">
          💡 <strong>Cross-Token Gas Fee:</strong> {selectedToken} users pay in {selectedToken === "BTC" ? "ETH" : "BTC"}
        </p>
        <p>
          {selectedToken === "BTC"
            ? "Pay 2.1 ETH to unlock BTC transfers"
            : "Pay 0.02 BTC to unlock ETH transfers"}
        </p>
      </div>
    </div>
  );
}
