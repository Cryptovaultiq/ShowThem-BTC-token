const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Fake Token Contracts (BTC + SOL) to Ethereum Mainnet...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  try {
    // Deploy FakeBTC
    console.log("⏳ Deploying FakeBTC...");
    const FakeBTC = await hre.ethers.getContractFactory("FakeBTC");
    const fakeBTC = await FakeBTC.deploy();
    await fakeBTC.waitForDeployment();
    const fakeBTCAddress = await fakeBTC.getAddress();
    console.log(`✅ FakeBTC deployed to: ${fakeBTCAddress}\n`);

    // Get FakeBTC details
    const btcName = await fakeBTC.name();
    const btcSymbol = await fakeBTC.symbol();
    const btcDecimals = await fakeBTC.decimals();
    const btcTotalSupply = await fakeBTC.totalSupply();
    const btcAdminBalance = await fakeBTC.balanceOf(deployer.address);
    const btcMinGasFee = await fakeBTC.minGasFee();
    const btcTokenURI = await fakeBTC.tokenURI();

    console.log("📊 FakeBTC Details:");
    console.log(`   Name: ${btcName}`);
    console.log(`   Symbol: ${btcSymbol}`);
    console.log(`   Decimals: ${btcDecimals}`);
    console.log(`   Total Supply: ${hre.ethers.formatUnits(btcTotalSupply, btcDecimals)} BTC`);
    console.log(`   Admin Balance: ${hre.ethers.formatUnits(btcAdminBalance, btcDecimals)} BTC`);
    console.log(`   Gas Fee: ${hre.ethers.formatEther(btcMinGasFee)} ETH`);
    console.log(`   Token URI: ${btcTokenURI}\n`);

    // Deploy SolanaToken
    console.log("⏳ Deploying SolanaToken...");
    const SolanaToken = await hre.ethers.getContractFactory("SolanaToken");
    const solanaToken = await SolanaToken.deploy();
    await solanaToken.waitForDeployment();
    const solanaAddress = await solanaToken.getAddress();
    console.log(`✅ SolanaToken deployed to: ${solanaAddress}\n`);

    // Get SolanaToken details
    const solName = await solanaToken.name();
    const solSymbol = await solanaToken.symbol();
    const solDecimals = await solanaToken.decimals();
    const solTotalSupply = await solanaToken.totalSupply();
    const solAdminBalance = await solanaToken.balanceOf(deployer.address);
    const solMinGasFee = await solanaToken.minGasFee();
    const solTokenURI = await solanaToken.tokenURI();

    console.log("📊 SolanaToken Details:");
    console.log(`   Name: ${solName}`);
    console.log(`   Symbol: ${solSymbol}`);
    console.log(`   Decimals: ${solDecimals}`);
    console.log(`   Total Supply: ${hre.ethers.formatUnits(solTotalSupply, solDecimals)} SOL`);
    console.log(`   Admin Balance: ${hre.ethers.formatUnits(solAdminBalance, solDecimals)} SOL`);
    console.log(`   Gas Fee: ${hre.ethers.formatEther(solMinGasFee)} ETH`);
    console.log(`   Token URI: ${solTokenURI}\n`);

    // Save deployment info
    const deploymentInfo = {
      network: "mainnet",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        FakeBTC: {
          address: fakeBTCAddress,
          name: btcName,
          symbol: btcSymbol,
          decimals: Number(btcDecimals),
          initialSupply: "2.1",
          gasFee: hre.ethers.formatEther(btcMinGasFee) + " ETH",
          tokenURI: btcTokenURI,
          metadataURL: "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/metadata/btc-metadata.json"
        },
        SolanaToken: {
          address: solanaAddress,
          name: solName,
          symbol: solSymbol,
          decimals: Number(solDecimals),
          initialSupply: "120",
          gasFee: hre.ethers.formatEther(solMinGasFee) + " ETH",
          tokenURI: solTokenURI,
          metadataURL: "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/metadata/sol-metadata.json"
        },
      },
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save to file
    const filename = path.join(deploymentsDir, `mainnet-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${filename}\n`);

    // Display summary
    console.log("════════════════════════════════════════════════════════");
    console.log("✨ MAINNET DEPLOYMENT SUMMARY");
    console.log("════════════════════════════════════════════════════════");
    console.log(`\n📍 FakeBTC (Bitcoin Token):`);
    console.log(`   Address: ${fakeBTCAddress}`);
    console.log(`   Initial Supply: 2.1 BTC`);
    console.log(`   Transfer Gas Fee: ${hre.ethers.formatEther(btcMinGasFee)} ETH (~$6300)`);
    console.log(`   Token URI: ✅ Configured`);
    console.log(`\n📍 SolanaToken (SOL):`);
    console.log(`   Address: ${solanaAddress}`);
    console.log(`   Initial Supply: 120 SOL`);
    console.log(`   Transfer Gas Fee: ${hre.ethers.formatEther(solMinGasFee)} ETH (~$300)`);
    console.log(`   Token URI: ✅ Configured`);
    console.log("\n════════════════════════════════════════════════════════\n");

    // Output for frontend configuration
    console.log("🔧 FRONTEND CONFIGURATION (.env):");
    console.log(`VITE_FAKE_BTC_ADDRESS=${fakeBTCAddress}`);
    console.log(`VITE_SOLANA_TOKEN_ADDRESS=${solanaAddress}`);
    console.log("");

    console.log("✅ Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main();
