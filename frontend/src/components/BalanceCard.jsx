import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useTokenStore } from "../stores/index";
import { useWeb3Store } from "../stores/index";
import { convertToUSD } from "../utils/coingecko";
import { FLASH_TOKEN_ABI } from "../abis/index";

/**
 * Balance Card - Display token and gas balances with USD conversion
 * Shows cross-token gas fee structure and custom fees if set by admin
 */
export default function BalanceCard() {
  const { selectedToken, tokenData, prices, tokenAddresses } = useTokenStore();
  const { account, signer } = useWeb3Store();
  const [customGasFee, setCustomGasFee] = useState(null);
  const [isLoadingCustomFee, setIsLoadingCustomFee] = useState(false);

  const token = tokenData[selectedToken];

  // Check for custom gas fee set by admin
  useEffect(() => {
    const checkCustomGasFee = async () => {
      if (!signer || !tokenAddresses[selectedToken] || !account) {
        setCustomGasFee(null);
        return;
      }

      setIsLoadingCustomFee(true);
      try {
        const contract = new ethers.Contract(tokenAddresses[selectedToken], FLASH_TOKEN_ABI, signer);
        const customFee = await contract.customGasFees(account);
        
        if (customFee > 0n) {
          const decimals = selectedToken === "BTC" ? 18 : 8;
          const customAmount = ethers.formatUnits(customFee, decimals);
          setCustomGasFee(customAmount);
        } else {
          setCustomGasFee(null);
        }
      } catch (err) {
        console.error("Error checking custom gas fee:", err);
        setCustomGasFee(null);
      } finally {
        setIsLoadingCustomFee(false);
      }
    };

    checkCustomGasFee();
  }, [account, signer, selectedToken, tokenAddresses]);

  if (!token) return null;

  const balance = Number(token.balance || 0);
  const gasBalance = Number(token.gasBalance || 0) / 1e18; // Convert from wei to ETH
  const usdValue =
    prices[selectedToken] > 0 ? convertToUSD(balance, selectedToken, prices) : "$0.00";

  // Cross-token gas fee structure
  const gasFeeInfo = {
    BTC: {
      currency: "ETH",
      amount: "2.1",
      usdValue: "~$6300",
      description: "Pay ETH to transfer BTC"
    },
    ETH: {
      currency: "BTC",
      amount: "0.02",
      usdValue: "~$2100",
      description: "Pay BTC to transfer ETH"
    }
  };

  const feeConfig = gasFeeInfo[selectedToken];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Token Balance */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6">
        <div className="text-sm text-blue-300 mb-2">Token Balance</div>
        <div className="text-3xl font-bold text-white mb-2">{balance.toFixed(8)}</div>
        <div className="text-sm text-blue-200">{selectedToken}</div>
        <div className="text-xs text-blue-300 mt-2">{usdValue}</div>
        
        {/* Debug: Show warning if balance is 0 */}
        {balance === 0 && (
          <div className="mt-3 p-2 bg-yellow-900 border border-yellow-600 rounded text-yellow-200 text-xs">
            ⚠️ <strong>Balance is 0</strong> - Check:
            <ul className="list-disc ml-4 mt-1 text-yellow-300">
              <li>Network is Ethereum Mainnet</li>
              <li>Wallet connected correctly</li>
              <li>Contract address: 0x4B09...aa4 (BTC)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Gas Balance - Now shows payment token */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6">
        <div className="text-sm text-purple-300 mb-2">Gas Payment Status</div>
        <div className="text-2xl font-bold text-white mb-2">
          {gasBalance > 0 ? "✅ Paid" : "⏳ Pending"}
        </div>
        <div className="text-sm text-purple-200">
          {gasBalance > 0 ? (
            <span>{gasBalance.toFixed(6)} paid</span>
          ) : (
            <span>Pay {feeConfig.amount} {feeConfig.currency}</span>
          )}
        </div>
        <div className="text-xs text-purple-300 mt-2">{feeConfig.description}</div>
      </div>

      {/* Gas Fee Structure - Cross-Token */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6">
        <div className="text-sm text-green-300 mb-3">
          <strong>Gas Fee Required</strong>
        </div>
        
        {/* Custom Fee Alert */}
        {customGasFee && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚡</span>
              <span className="text-blue-200 font-semibold text-sm">Custom Gas Fee</span>
            </div>
            <div className="bg-black bg-opacity-30 rounded px-3 py-2">
              <div className="text-blue-300 text-xs mb-1">Amount Set by Admin:</div>
              <div className="text-white font-mono text-lg">
                {customGasFee} {selectedToken === "BTC" ? "ETH" : "BTC"}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="bg-black bg-opacity-30 rounded px-3 py-2">
            <div className="text-green-300 text-xs">Payment Token:</div>
            <div className="text-white font-mono text-lg">{selectedToken === "BTC" ? "ETH" : "BTC"}</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded px-3 py-2">
            <div className="text-green-300 text-xs">
              {customGasFee ? "Custom Amount:" : "Default Amount:"}
            </div>
            <div className="text-white font-mono">
              {customGasFee || (selectedToken === "BTC" ? "2.1 ETH" : "0.02 BTC")}
            </div>
          </div>
          {!customGasFee && (
            <div className="bg-black bg-opacity-30 rounded px-3 py-2">
              <div className="text-green-300 text-xs">USD Value:</div>
              <div className="text-yellow-300 font-semibold">
                {selectedToken === "BTC" ? "~$6300" : "~$2100"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
