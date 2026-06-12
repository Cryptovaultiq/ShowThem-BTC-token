import { useEffect, useState } from 'react';
import { useWeb3Store, useFlashTokenStore } from '../stores/web3Store';
import { getProvider } from '../utils/web3';

export const useWeb3 = () => {
  const { account, isConnected, connect } = useWeb3Store();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            await connect();
          }
        } catch (error) {
          console.error('Failed to check connection:', error);
        }
      }
      setIsReady(true);
    };

    checkConnection();
  }, [connect]);

  return { account, isConnected, isReady };
};

export const useFlashToken = (contractAddress, contract) => {
  const { account } = useWeb3Store();
  const { balance, gasBalance, isLoading } = useFlashTokenStore();
  const loadTokenData = useFlashTokenStore((s) => s.loadTokenData);
  const updateBalance = useFlashTokenStore((s) => s.updateBalance);

  useEffect(() => {
    if (contract && account) {
      loadTokenData(contract, account);
    }
  }, [contract, account, loadTokenData]);

  return {
    balance,
    gasBalance,
    isLoading,
    refreshBalance: () => updateBalance(contract, account),
  };
};

export const useBalance = (address) => {
  const { provider } = useWeb3Store();
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!provider || !address) return;

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const bal = await provider.getBalance(address);
        setBalance(bal);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [provider, address]);

  return { balance, isLoading };
};

export const useNetworkListener = () => {
  const { setChainId, connect } = useWeb3Store();

  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      // Reconnect after network switch
      connect();
    };

    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [setChainId, connect]);
};
