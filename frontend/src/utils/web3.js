import { ethers } from 'ethers';

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider found');
  return provider.getSigner();
};

export const getContract = async (contractAddress, abi) => {
  const signer = await getSigner();
  return new ethers.Contract(contractAddress, abi, signer);
};

export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }
  throw new Error('MetaMask not installed');
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei) => {
  try {
    return ethers.formatEther(wei);
  } catch {
    return '0';
  }
};

export const parseEther = (ether) => {
  try {
    return ethers.parseEther(ether.toString());
  } catch {
    return BigInt(0);
  }
};

export const getChainName = (chainId) => {
  const chains = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    1337: 'Hardhat Local',
    31337: 'Hardhat Local',
  };
  return chains[chainId] || `Chain ${chainId}`;
};

export const switchNetwork = async (chainId) => {
  if (!window.ethereum) throw new Error('MetaMask not installed');

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + chainId.toString(16) }],
    });
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, would need to add it
      throw new Error('Please add this network to MetaMask');
    }
    throw error;
  }
};

export const waitForTransaction = async (hash, provider) => {
  const receipt = await provider.waitForTransaction(hash);
  return receipt;
};
