/**
 * CoinGecko API utility for fetching real-time crypto prices
 * Free API - no key required
 */

const COINGECKO_API = "https://api.coingecko.com/api/v3";

/**
 * Fetch real-time prices for cryptocurrencies
 * @param {string} ids - Comma-separated list of cryptocurrency IDs (bitcoin,ethereum)
 * @param {string} vsCurrency - Target currency (default: usd)
 * @returns {Object} - Price data { bitcoin: 45000, ethereum: 2500 }
 */
export async function fetchCryptoPrices(ids = "bitcoin,ethereum", vsCurrency = "usd") {
  try {
    const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=${vsCurrency}&include_market_cap=false&include_24hr_vol=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform response to simple format
    return {
      BTC: data.bitcoin?.[vsCurrency] || 0,
      ETH: data.ethereum?.[vsCurrency] || 0,
    };
  } catch (error) {
    console.error("❌ Error fetching prices:", error);
    return { BTC: 0, ETH: 0 };
  }
}

/**
 * Convert token amount to USD
 * @param {number} amount - Token amount
 * @param {string} token - Token symbol (BTC or ETH)
 * @param {Object} prices - Price data { BTC: 45000, ETH: 2500 }
 * @returns {string} - USD value formatted
 */
export function convertToUSD(amount, token, prices) {
  const price = prices[token] || 0;
  const usdValue = amount * price;
  return `$${usdValue.toFixed(2)}`;
}

/**
 * Format token amount for display
 * @param {string} amount - Amount in wei/smallest unit
 * @param {number} decimals - Token decimals
 * @returns {string} - Formatted amount
 */
export function formatTokenAmount(amount, decimals) {
  if (!amount) return "0";
  const divisor = Math.pow(10, decimals);
  const formatted = Number(amount) / divisor;
  return formatted.toFixed(decimals === 8 ? 8 : 2);
}

/**
 * Get cryptocurrency details
 * @param {string} id - Cryptocurrency ID (bitcoin, ethereum)
 * @returns {Object} - Full cryptocurrency data
 */
export async function getCryptoDetails(id) {
  try {
    const url = `${COINGECKO_API}/coins/${id}?localization=false`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${id} details:`, error);
    return null;
  }
}

/**
 * Get price history for chart
 * @param {string} id - Cryptocurrency ID
 * @param {number} days - Number of days (1, 7, 30, etc.)
 * @returns {Array} - Array of [timestamp, price] pairs
 */
export async function getPriceHistory(id = "bitcoin", days = 7) {
  try {
    const url = `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.error(`❌ Error fetching price history:`, error);
    return [];
  }
}
