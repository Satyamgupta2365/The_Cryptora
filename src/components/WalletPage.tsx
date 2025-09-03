// ...existing code...
import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { WalletBalance, HederaBalance, MetaMaskBalance } from '../types';

const WalletPage: React.FC = () => {
    // Separate states for each wallet type
    const [multiChainWalletBalance, setMultiChainWalletBalance] = useState<WalletBalance | null>(null);
    const [hederaBalance, setHederaBalance] = useState<HederaBalance | null>(null);
    const [metaMaskBalance] = useState<MetaMaskBalance>({ address: '0xDummyMetaMaskAddress1234567890', balance_eth: 0, network: 'Ethereum Mainnet' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string[]>([]);
    const privateKey = '0x77a206935dffea1bf19c9fdfe2e8cdd47e3f8bfd8d607c16df83239b9acb093c'; // Hardcoded for testing

    useEffect(() => {
        // Check localStorage for cached balances
        const cachedMultiChainBalance = localStorage.getItem('multiChainWalletBalance');
        const cachedHederaBalance = localStorage.getItem('hederaBalance');

        if (cachedMultiChainBalance && cachedHederaBalance) {
            // Load from localStorage if available
            setMultiChainWalletBalance(JSON.parse(cachedMultiChainBalance));
            setHederaBalance(JSON.parse(cachedHederaBalance));
            setLoading(false);
            return;
        }

        // Fetch balances only if not in localStorage
        const fetchBalances = async () => {
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
                    api.getHederaBalance().catch((err) => ({
                        error: `Failed to fetch Hedera balance: ${err.message}`,
                    })),
                ]);

                // Mock Coinbase balances
                const coinbaseData = {
                    ethereum: { balance_eth: 0, network: 'Ethereum Mainnet' },
                    polygon: { balance_matic: 3, network: 'Polygon Mainnet' },
                };

                // Handle wallet balance response and combine with mock Coinbase data
                if (walletData.error) {
                    setError((prev) => [...prev, walletData.error]);
                } else {
                    // Combine the balances
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
                        total_usd_value: (walletData.total_usd_value || 0) +
                            ((coinbaseData.ethereum.balance_eth * 2500) +
                                (coinbaseData.polygon.balance_matic * 0.5)),
                    };
                    setMultiChainWalletBalance(combinedBalance);
                    localStorage.setItem('multiChainWalletBalance', JSON.stringify(combinedBalance));
                }

                // Handle Hedera balance response
                if (hederaData.error) {
                    setError((prev) => [...prev, hederaData.error]);
                } else if (typeof hederaData.balance !== 'undefined') {
                    setHederaBalance(hederaData);
                    localStorage.setItem('hederaBalance', JSON.stringify(hederaData));
                }

            } catch (err: any) {
                setError((prev) => [...prev, `Unexpected error: ${err.message}`]);
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();
    }, []); // Empty dependency array to run only once on mount

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).catch((err) => {
            setError((prev) => [...prev, `Failed to copy to clipboard: ${err.message}`]);
        });
    };

    const getTotalBalance = () => {
        let total = 0;
        const ethPrice = 2500;
        const maticPrice = 0.5;
        const hbarPrice = 0.05;

        if (multiChainWalletBalance) {
            total += multiChainWalletBalance.total_usd_value || 0;
        }
        if (hederaBalance) {
            total += ((hederaBalance.balance || 0) * 0.00000001 * hbarPrice) || 0;
        }
        if (metaMaskBalance) {
            total += (metaMaskBalance.balance_eth * ethPrice) || 0;
        }

        return total;
    };

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="mb-10">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">Portfolio Dashboard</h1>
                <p className="text-gray-600 text-xl font-medium">Your crypto assets at a glance</p>
            </div>

            {error.length > 0 && (
                <div className="mb-10 p-6 bg-red-50 border border-red-300 rounded-xl shadow-md text-red-800 animate-pulse">
                    {error.map((err, index) => (
                        <p key={index} className="text-base font-medium">{err}</p>
                    ))}
                </div>
            )}

            {loading && (
                <div className="mb-10 p-6 bg-blue-50 border border-blue-300 rounded-xl shadow-md text-blue-800 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-base font-medium">Loading balances...</span>
                </div>
            )}

            <div className="bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-10 mb-10 text-white transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold">Total Portfolio Value</h2>
                    <TrendingUp className="w-10 h-10 text-green-300" />
                </div>
                <div className="text-6xl font-extrabold mb-3">
                    ${getTotalBalance().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-blue-200 text-lg">Across all networks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Multi-Chain Wallet Section */}
                {multiChainWalletBalance && (
                    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-semibold text-gray-900">Multi-Chain Wallets</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => copyToClipboard(multiChainWalletBalance.address || '')}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Ethereum Balance */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-base">ETH</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">Ethereum</p>
                                        <p className="text-sm text-gray-500">{multiChainWalletBalance.ethereum?.network || 'Mainnet'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-lg">{(multiChainWalletBalance.ethereum?.balance_eth || 0).toFixed(6)} ETH</p>
                                    <p className="text-sm text-gray-500">${((multiChainWalletBalance.ethereum?.balance_eth || 0) * 2500).toFixed(2)}</p>
                                </div>
                            </div>
                            {/* Polygon Balance */}
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-base">MATIC</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">Polygon</p>
                                        <p className="text-sm text-gray-500">{multiChainWalletBalance.polygon?.network || 'Mainnet'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-lg">{(multiChainWalletBalance.polygon?.balance_matic || 0).toFixed(4)} MATIC</p>
                                    <p className="text-sm text-gray-500">${((multiChainWalletBalance.polygon?.balance_matic || 0) * 0.5).toFixed(2)}</p>
                                </div>
                            </div>
                            {/* Arbitrum Balance */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-base">ARB</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">Arbitrum</p>
                                        <p className="text-sm text-gray-500">{multiChainWalletBalance.arbitrum?.network || 'Mainnet'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-lg">{(multiChainWalletBalance.arbitrum?.balance_eth || 0).toFixed(6)} ETH</p>
                                    <p className="text-sm text-gray-500">${((multiChainWalletBalance.arbitrum?.balance_eth || 0) * 2500).toFixed(2)}</p>
                                </div>
                            </div>
                            {/* BSC Balance */}
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-base">BNB</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">BSC</p>
                                        <p className="text-sm text-gray-500">{multiChainWalletBalance.bsc?.network || 'Mainnet'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-lg">{(multiChainWalletBalance.bsc?.balance_bnb || 0).toFixed(4)} BNB</p>
                                    <p className="text-sm text-gray-500">${((multiChainWalletBalance.bsc?.balance_bnb || 0) * 500).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border border-green-300">
                            <p className="text-sm text-green-800 font-medium">Total USD Value</p>
                            <p className="text-2xl font-bold text-green-900">
                                ${(multiChainWalletBalance.total_usd_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                )}

                {/* MetaMask Wallet Section */}
                {metaMaskBalance && (
                    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-semibold text-gray-900">MetaMask Wallet</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => copyToClipboard(metaMaskBalance.address || '')}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-base">ETH</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">MetaMask</p>
                                        <p className="text-sm text-gray-500">{metaMaskBalance.network || 'Mainnet'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {(metaMaskBalance.balance_eth || 0).toFixed(6)} ETH
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ${(metaMaskBalance.balance_eth * 2500).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-100 rounded-xl border border-orange-300">
                            <p className="text-sm text-orange-800 font-medium">Estimated USD Value</p>
                            <p className="text-2xl font-bold text-orange-900">
                                ${(metaMaskBalance.balance_eth * 2500).toFixed(2)}
                            </p>
                            <p className="text-xs text-orange-700 mt-1">*Based on estimated ETH price</p>
                        </div>
                    </div>
                )}

                {/* Hedera Balance */}
                {hederaBalance && (
                    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-semibold text-gray-900">Hedera Network</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => copyToClipboard(hederaBalance.account_id || '')}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:bg-purple-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-base">ℏ</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">HBAR</p>
                                        <p className="text-sm text-gray-500">Account: {hederaBalance.account_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {((hederaBalance.balance || 0) * 0.00000001).toFixed(8)} ℏ
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {(hederaBalance.balance || 0).toLocaleString()} tinybars
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl border border-purple-300">
                            <p className="text-sm text-purple-800 font-medium">Estimated USD Value</p>
                            <p className="text-2xl font-bold text-purple-900">
                                ${(((hederaBalance.balance || 0) * 0.00000001) * 0.05).toFixed(2)}
                            </p>
                            <p className="text-xs text-purple-700 mt-1">*Based on estimated HBAR price</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletPage;
// ...existing code...