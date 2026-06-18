const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Solana Token (SOL) to Ethereum Mainnet...\n");

  // Get the account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying from account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy Solana Token
  console.log("Deploying SolanaToken contract...");
  const SolanaToken = await hre.ethers.getContractFactory("SolanaToken");
  const solanaToken = await SolanaToken.deploy();
  await solanaToken.waitForDeployment();

  const solanaAddress = await solanaToken.getAddress();
  console.log(`✅ SolanaToken deployed to: ${solanaAddress}\n`);

  // Get token details
  const name = await solanaToken.name();
  const symbol = await solanaToken.symbol();
  const decimals = await solanaToken.decimals();
  const totalSupply = await solanaToken.totalSupply();
  const adminBalance = await solanaToken.balanceOf(deployer.address);
  const minGasFee = await solanaToken.minGasFee();

  console.log("📊 Token Details:");
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} SOL`);
  console.log(`   Admin Balance: ${hre.ethers.formatUnits(adminBalance, decimals)} SOL`);
  console.log(`   Gas Fee: ${hre.ethers.formatEther(minGasFee)} ETH\n`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      SolanaToken: {
        address: solanaAddress,
        name: name,
        symbol: symbol,
        decimals: Number(decimals),
        initialSupply: "120",
        gasFee: hre.ethers.formatEther(minGasFee) + " ETH",
        note: "Users must pay ETH gas fee to transfer tokens. Admin can transfer without gas fee."
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to file
  const filename = path.join(deploymentsDir, `mainnet-solana-${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${filename}\n`);

  console.log("🎉 Deployment complete!");
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Wait for block confirmation`);
  console.log(`   2. Flatten contract: npx hardhat flatten contracts/ethereum/SolanaToken.sol`);
  console.log(`   3. Verify on Etherscan: https://etherscan.io/verifyContract?a=${solanaAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
