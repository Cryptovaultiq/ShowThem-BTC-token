import React from "react";

/**
 * TokenLogo Component - Display token logos
 * Shows BTC (orange circle with ₿ symbol) or SOL (green circle with S symbol)
 */
export default function TokenLogo({ token, size = "md" }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Use GitHub CDN URLs for real token PNG images
  const logoUrl = token === "BTC" 
    ? "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/public/tokens/btc-logo.png"
    : "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/frontend/public/Solana1.png";
  
  const altText = token === "BTC" ? "Fake Bitcoin Logo" : "Solana Token Logo";

  return (
    <img
      src={logoUrl}
      alt={altText}
      className={`${sizes[size]} rounded-full`}
      title={token}
      onError={(e) => {
        // Fallback: if GitHub CDN fails, show placeholder
        if (!e.target.dataset.fallbackAttempted) {
          e.target.dataset.fallbackAttempted = "true";
          e.target.src = token === "BTC" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23F7931A'/%3E%3Ctext x='50' y='70' text-anchor='middle' font-size='50' fill='white' font-weight='bold'%3E₿%3C/text%3E%3C/svg%3E" : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2314F195'/%3E%3Ctext x='50' y='70' text-anchor='middle' font-size='40' fill='white' font-weight='bold'%3ES%3C/text%3E%3C/svg%3E";
        }
      }}
    />
  );
}
