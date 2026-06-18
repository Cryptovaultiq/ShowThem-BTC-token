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

  const logoUrl = token === "BTC" ? "/tokens/btc-logo.svg" : "/tokens/sol-logo.svg";
  const altText = token === "BTC" ? "Fake Bitcoin Logo" : "Solana Token Logo";

  return (
    <img
      src={logoUrl}
      alt={altText}
      className={`${sizes[size]} rounded-full`}
      title={token}
    />
  );
}
