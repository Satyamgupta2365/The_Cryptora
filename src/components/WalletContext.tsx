import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { WalletBalance, HederaBalance } from '../types';

interface WalletContextType {
    multiChainWalletBalance: WalletBalance | null;
    hederaBalance: HederaBalance | null;
    loading: boolean;
    error: string[];
}

export const WalletContext = createContext<WalletContextType>({
    multiChainWalletBalance: null,
    hederaBalance: null,
    loading: true,
    error: [],
});

interface WalletProviderProps {
    children: ReactNode;
    privateKey: string;
    hederaAccountId: string;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, privateKey, hederaAccountId }) => {
    const [multiChainWalletBalance, setMultiChainWalletBalance] = useState<WalletBalance | null>(null);
    const [hederaBalance, setHederaBalance] = useState<HederaBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string[]>([]);

    useEffect(() => {
        const fetchBalances = async () => {
            // Skip fetching if data is already present
            if (multiChainWalletBalance && hederaBalance) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError([]);

            if (!privateKey) {
                setError((prev) => [...prev, 'Private key is not set']);
                setLoading(false);
                return;
            }

            try {
                // Fetch balances from FastAPI endpoints
                const [walletData, hederaData] = await Promise.all([
                    api.getWalletBalance(privateKey).catch((err) => ({
                        error: `Failed to fetch wallet balance: ${err.message}`,
                    })),
                    api.getHederaBalance(hederaAccountId).catch((err) => ({
                        error: `Failed to fetch Hedera balance: ${err.message}`,
                    })),
                ]);

                console.log('Wallet Data:', walletData);
                console.log('Hedera Data:', hederaData);

                // Mock Coinbase and MetaMask balances
                const coinbaseData = {
                    ethereum: { balance_eth: 0, network: 'Ethereum Mainnet' },
                    polygon: { balance_matic: 3, network: 'Polygon Mainnet' },
                };
                const metaMaskData = {
                    metamask: { balance_eth: 0, network: 'Ethereum Mainnet' },
                };

                // Handle wallet balance response and combine with mock Coinbase and MetaMask data
                if (walletData.error) {
                    setError((prev) => [...prev, walletData.error]);
                    console.error('Wallet balance error:', walletData.error);
                } else {
                    const combinedBalance: WalletBalance = {
                        address: walletData.address,
                        ethereum: {
                            balance_eth: (walletData.ethereum?.balance_eth || 0) + (coinbaseData.ethereum.balance_eth),
                            network: walletData.ethereum?.network || 'Mainnet',
                        },
                        polygon: {
                            balance_matic: (walletData.polygon?.balance_matic || 0) + (coinbaseData.polygon.balance_matic),
                            network: walletData.polygon?.network || 'Mainnet',
                        },
                        arbitrum: walletData.arbitrum,
                        bsc: walletData.bsc,
                        metamask: {
                            balance_eth: (walletData.ethereum?.balance_eth || 0) + (metaMaskData.metamask.balance_eth),
                            network: metaMaskData.metamask.network,
                        },
                        total_usd_value: (walletData.total_usd_value || 0) +
                            ((coinbaseData.ethereum.balance_eth * 2500) +
                             (coinbaseData.polygon.balance_matic * 0.5) +
                             (metaMaskData.metamask.balance_eth * 2500)),
                    };
                    setMultiChainWalletBalance(combinedBalance);
                }

                // Handle Hedera balance response
                if (hederaData.error) {
                    setError((prev) => [...prev, hederaData.error]);
                    console.error('Hedera balance error:', hederaData.error);
                } else if (hederaData.balance !== undefined) {
                    setHederaBalance(hederaData);
                }

            } catch (err: any) {
                setError((prev) => [...prev, `Unexpected error: ${err.message}`]);
                console.error('Unexpected error fetching balances:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [privateKey, hederaAccountId, multiChainWalletBalance, hederaBalance]);

    return (
        <WalletContext.Provider value={{ multiChainWalletBalance, hederaBalance, loading, error }}>
            {children}
        </WalletContext.Provider>
    );
};