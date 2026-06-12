const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Fake Token Contracts to Sepolia Testnet...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  try {
    // Deploy FakeBTC
    console.log("⏳ Deploying FakeBTC...");
    const FakeBTC = await hre.ethers.getContractFactory("FakeBTC");
    const fakeBTC = await FakeBTC.deploy();
    await fakeBTC.waitForDeployment();
    const fakeBTCAddress = await fakeBTC.getAddress();
    console.log(`✅ FakeBTC deployed to: ${fakeBTCAddress}\n`);

    // Deploy FakeETH with FakeBTC address
    console.log("⏳ Deploying FakeETH...");
    const FakeETH = await hre.ethers.getContractFactory("FakeETH");
    const fakeETH = await FakeETH.deploy(fakeBTCAddress);
    await fakeETH.waitForDeployment();
    const fakeETHAddress = await fakeETH.getAddress();
    console.log(`✅ FakeETH deployed to: ${fakeETHAddress}\n`);

    // Save deployment info
    const deploymentInfo = {
      network: "sepolia",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      gasFees: {
        description: "Cross-token gas fee mechanism",
        BTC_transfer_requires: "2.1 ETH (~$6300)",
        ETH_transfer_requires: "0.02 BTC (~$2100)"
      },
      contracts: {
        FakeBTC: {
          address: fakeBTCAddress,
          name: "Fake Bitcoin",
          symbol: "BTC",
          decimals: 8,
          initialSupply: "2.1",
          gasFee: "2.1 ETH for transfers",
          note: "Users must pay ETH to transfer BTC"
        },
        FakeETH: {
          address: fakeETHAddress,
          name: "Fake Ethereum",
          symbol: "ETH",
          decimals: 18,
          initialSupply: "7.5",
          gasFee: "0.02 BTC for transfers",
          note: "Users must pay BTC to transfer ETH"
        },
      },
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save to file
    const filename = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${filename}\n`);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const btcBalance = await fakeBTC.balanceOf(deployer.address);
    const ethBalance = await fakeETH.balanceOf(deployer.address);
    const fakeETHBTCAddress = await fakeETH.fakeBTCContract();
    
    console.log(`✅ FakeBTC minted to deployer: ${hre.ethers.formatUnits(btcBalance, 8)} BTC`);
    console.log(`✅ FakeETH minted to deployer: ${hre.ethers.formatUnits(ethBalance, 18)} ETH`);
    console.log(`✅ FakeBTC address in FakeETH: ${fakeETHBTCAddress}`);
    
    // Verify addresses are correct
    if (fakeETHBTCAddress.toLowerCase() !== fakeBTCAddress.toLowerCase()) {
      throw new Error("❌ FakeBTC address not correctly set in FakeETH!");
    }
    
    console.log("\n✅ All verifications passed!\n");

    // Display summary
    console.log("════════════════════════════════════════════════════════");
    console.log("✨ DEPLOYMENT SUMMARY");
    console.log("════════════════════════════════════════════════════════");
    console.log(`Network: ${hre.network.name === 'sepolia' ? 'Sepolia Testnet' : 'Mainnet'}`);
    console.log(`\n📍 FakeBTC (8 decimals):`);
    console.log(`   Address: ${fakeBTCAddress}`);
    console.log(`   Initial Supply: 2.1 BTC`);
    console.log(`   Transfer Gas Fee: 2.1 ETH (~$6300)`);
    console.log(`   Payment Method: ETH`);
    console.log(`\n📍 FakeETH (18 decimals):`);
    console.log(`   Address: ${fakeETHAddress}`);
    console.log(`   Initial Supply: 7.5 ETH`);
    console.log(`   Transfer Gas Fee: 0.02 BTC (~$2100)`);
    console.log(`   Payment Method: BTC (cross-token fee)`);
    console.log(`\n💡 Gas Fee Mechanism (Cross-Token):`);
    console.log(`   - BTC users pay in ETH to transfer`);
    console.log(`   - ETH users pay in BTC to transfer`);
    console.log(`\n📝 IMPORTANT - Add these to frontend/.env:`);
    console.log(`   VITE_FAKE_BTC_ADDRESS=${fakeBTCAddress}`);
    console.log(`   VITE_FAKE_ETH_ADDRESS=${fakeETHAddress}`);
    console.log("════════════════════════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main();
