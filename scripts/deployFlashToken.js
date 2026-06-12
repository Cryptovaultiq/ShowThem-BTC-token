const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FlashToken to Ethereum...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  // Token parameters
  const tokenName = "Flash Token";
  const tokenSymbol = "FLASH";
  const initialSupply = 1000000; // 1 million tokens
  const gasFeeBps = 100; // 1% gas fee
  const minGasFee = ethers.parseEther("0.001"); // Min 0.001 ETH
  const maxGasFee = ethers.parseEther("1"); // Max 1 ETH

  // Deploy FlashToken
  const FlashToken = await ethers.getContractFactory("FlashToken");
  const flashToken = await FlashToken.deploy(
    tokenName,
    tokenSymbol,
    initialSupply,
    gasFeeBps,
    minGasFee,
    maxGasFee
  );

  await flashToken.waitForDeployment();
  const deployedAddress = await flashToken.getAddress();

  console.log("✅ FlashToken deployed to:", deployedAddress);
  console.log("\n📊 Token Details:");
  console.log(`  Name: ${tokenName}`);
  console.log(`  Symbol: ${tokenSymbol}`);
  console.log(`  Initial Supply: ${initialSupply}`);
  console.log(`  Gas Fee: ${gasFeeBps} BPS`);
  console.log(`  Min Gas Fee: ${ethers.formatEther(minGasFee)} ETH`);
  console.log(`  Max Gas Fee: ${ethers.formatEther(maxGasFee)} ETH`);

  // Verify contract on block explorers (if network has verification support)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmation...");
    await flashToken.deploymentTransaction().wait(6);
    
    console.log("🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [
          tokenName,
          tokenSymbol,
          initialSupply,
          gasFeeBps,
          minGasFee,
          maxGasFee,
        ],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️  Verification failed (this is okay for development):", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    address: deployedAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    tokenDetails: {
      name: tokenName,
      symbol: tokenSymbol,
      initialSupply,
      gasFeeBps,
      minGasFee: ethers.formatEther(minGasFee),
      maxGasFee: ethers.formatEther(maxGasFee),
    },
  };

  // Write to deployment file
  const fs = require("fs");
  const deploymentPath = `./deployments/${hre.network.name}.json`;
  
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  return deployedAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
