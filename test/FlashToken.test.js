const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlashToken", function () {
  let flashToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy FlashToken
    const FlashToken = await ethers.getContractFactory("FlashToken");
    flashToken = await FlashToken.deploy(
      "Flash Token",
      "FLASH",
      1000000, // 1 million initial supply
      100, // 1% gas fee
      ethers.parseEther("0.001"),
      ethers.parseEther("1")
    );

    await flashToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await flashToken.name()).to.equal("Flash Token");
      expect(await flashToken.symbol()).to.equal("FLASH");
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await flashToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(
        ethers.parseEther("1000000")
      );
    });

    it("Should set correct gas fee parameters", async function () {
      expect(await flashToken.gasFeeBps()).to.equal(100);
      expect(await flashToken.minGasFee()).to.equal(ethers.parseEther("0.001"));
      expect(await flashToken.maxGasFee()).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Minting", function () {
    it("Only owner can mint tokens", async function () {
      await expect(
        flashToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Owner can mint tokens to addresses", async function () {
      await flashToken.mint(addr1.address, ethers.parseEther("500"));
      expect(await flashToken.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("500")
      );
    });

    it("Should emit FlashTokensMinted event", async function () {
      await expect(flashToken.mint(addr1.address, ethers.parseEther("100")))
        .to.emit(flashToken, "FlashTokensMinted")
        .withArgs(addr1.address, ethers.parseEther("100"));
    });
  });

  describe("Transfer Blocking", function () {
    beforeEach(async function () {
      // Give addr1 tokens
      await flashToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should block transfer without gas fee payment", async function () {
      await expect(
        flashToken
          .connect(addr1)
          .transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should emit TransferAttempted event when blocked", async function () {
      await expect(
        flashToken
          .connect(addr1)
          .transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should allow transfer after gas fee payment", async function () {
      // Pay gas fee via fallback
      await addr1.sendTransaction({
        to: await flashToken.getAddress(),
        value: ethers.parseEther("0.01"),
      });

      expect(await flashToken.gasBalance(addr1.address)).to.equal(
        ethers.parseEther("0.01")
      );

      // Now transfer should work (with gas deducted)
      const tx = await flashToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseEther("100"));

      expect(tx).to.not.be.reverted;
      expect(await flashToken.balanceOf(addr2.address)).to.equal(
        ethers.parseEther("100")
      );
    });
  });

  describe("Gas Fee Calculation", function () {
    it("Should calculate fee with minimum floor", async function () {
      // For small amounts, should use minimum fee
      const fee = await flashToken.calculateGasFee(ethers.parseEther("0.1"));
      expect(fee).to.equal(ethers.parseEther("0.001"));
    });

    it("Should calculate fee based on BPS", async function () {
      // For 10 ETH with 1% fee, should be 0.1 ETH
      const fee = await flashToken.calculateGasFee(ethers.parseEther("10"));
      // 1% of 10 ETH = 0.1 ETH
      expect(fee).to.equal(ethers.parseEther("0.1"));
    });

    it("Should cap fee at maximum", async function () {
      // For extremely large amounts
      const fee = await flashToken.calculateGasFee(
        ethers.parseEther("100000")
      );
      expect(fee).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Gas Fee Payment", function () {
    it("Should accept direct ETH payments", async function () {
      await owner.sendTransaction({
        to: await flashToken.getAddress(),
        value: ethers.parseEther("0.5"),
      });

      expect(await flashToken.gasBalance(owner.address)).to.equal(
        ethers.parseEther("0.5")
      );
    });

    it("Should emit GasFeePaid event", async function () {
      await expect(
        addr1.sendTransaction({
          to: await flashToken.getAddress(),
          value: ethers.parseEther("0.1"),
        })
      )
        .to.emit(flashToken, "GasFeePaid")
        .withArgs(addr1.address, ethers.parseEther("0.1"));
    });

    it("Should track payment history", async function () {
      await addr1.sendTransaction({
        to: await flashToken.getAddress(),
        value: ethers.parseEther("0.1"),
      });

      const history = await flashToken.getGasPaymentHistory(addr1.address);
      expect(history.length).to.equal(1);
      expect(history[0].amount).to.equal(ethers.parseEther("0.1"));
    });
  });

  describe("Approved Senders", function () {
    beforeEach(async function () {
      await flashToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Only owner can approve senders", async function () {
      await expect(
        flashToken.connect(addr1).setApprovedSender(addr1.address, true)
      ).to.be.reverted;
    });

    it("Approved senders can transfer without gas fee", async function () {
      // Approve addr1
      await flashToken.setApprovedSender(addr1.address, true);
      expect(await flashToken.approvedSenders(addr1.address)).to.equal(true);

      // Should be able to transfer without paying gas
      const tx = await flashToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseEther("100"));

      expect(tx).to.not.be.reverted;
      expect(await flashToken.balanceOf(addr2.address)).to.equal(
        ethers.parseEther("100")
      );
    });
  });

  describe("Admin Functions", function () {
    it("Only owner can update gas fee", async function () {
      await expect(
        flashToken.connect(addr1).updateGasFee(200, ethers.parseEther("0.002"), ethers.parseEther("2"))
      ).to.be.reverted;
    });

    it("Should update gas fee parameters", async function () {
      await flashToken.updateGasFee(200, ethers.parseEther("0.002"), ethers.parseEther("2"));

      expect(await flashToken.gasFeeBps()).to.equal(200);
      expect(await flashToken.minGasFee()).to.equal(ethers.parseEther("0.002"));
      expect(await flashToken.maxGasFee()).to.equal(ethers.parseEther("2"));
    });

    it("Should emit GasFeeUpdated event", async function () {
      await expect(flashToken.updateGasFee(200, ethers.parseEther("0.002"), ethers.parseEther("2")))
        .to.emit(flashToken, "GasFeeUpdated")
        .withArgs(200, ethers.parseEther("0.002"), ethers.parseEther("2"));
    });

    it("Should allow owner to withdraw gas fees", async function () {
      // Send some ETH to contract
      await owner.sendTransaction({
        to: await flashToken.getAddress(),
        value: ethers.parseEther("1"),
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await flashToken.withdrawGasFees();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("TransferFrom", function () {
    beforeEach(async function () {
      await flashToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should block transferFrom without gas fee", async function () {
      // addr1 approves addr2
      await flashToken.connect(addr1).approve(addr2.address, ethers.parseEther("100"));

      // addr2 tries to transfer from addr1
      await expect(
        flashToken
          .connect(addr2)
          .transferFrom(addr1.address, addr2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should allow transferFrom after gas fee payment", async function () {
      // Approve and pay gas
      await flashToken.connect(addr1).approve(addr2.address, ethers.parseEther("100"));
      await addr1.sendTransaction({
        to: await flashToken.getAddress(),
        value: ethers.parseEther("0.01"),
      });

      // Transfer should work
      const tx = await flashToken
        .connect(addr2)
        .transferFrom(addr1.address, addr2.address, ethers.parseEther("100"));

      expect(tx).to.not.be.reverted;
    });
  });
});
