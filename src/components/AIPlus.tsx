import React, { useState, useEffect } from 'react';
import { Copy, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface WalletBalance {
  total_usd_value: number;
  hydra: { balance_hbar: number; usd_value: number };
  coinbase: { balance_usd: number };
}

const AIPlus: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    total_usd_value: 51.50,
    hydra: { balance_hbar: 1000, usd_value: 50 }, // 1000 HBAR at $0.05 = $50
    coinbase: { balance_usd: 2.50 }, // $1 + $1.50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [customThreshold, setCustomThreshold] = useState('');
  const [message, setMessage] = useState('');

  const conditions = [
    { label: 'Total Balance Crosses $51', value: 'total_above_51' },
    { label: 'Hydra Balance Increases', value: 'hydra_increase' },
    { label: 'Coinbase Balance Increases', value: 'coinbase_increase' },
    { label: 'Total Balance Drops Below $51', value: 'total_below_51' },
    { label: 'Custom', value: 'custom' },
  ];

  useEffect(() => {
    const fetchBalances = async () => {
      setLoading(true);
      setError([]);

      try {
        const response = await api.getAIBalances();
        setWalletBalance(response);
      } catch (err: any) {
        setError((prev) => [...prev, `Failed to fetch balances: ${err.message}`]);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch((err) => {
      setError((prev) => [...prev, `Failed to copy to clipboard: ${err.message}`]);
    });
  };

  const handleSetReminder = async () => {
    if (!email || !selectedCondition) {
      setMessage('Please enter an email and select a condition.');
      return;
    }
    if (selectedCondition === 'custom' && !customThreshold) {
      setMessage('Please enter a custom threshold.');
      return;
    }

    try {
      await api.setEmailReminder({
        email,
        condition: selectedCondition,
        threshold: selectedCondition === 'custom' ? parseFloat(customThreshold) : undefined,
        currentBalances: walletBalance,
      });
      setMessage('Reminder set successfully!');
      setEmail('');
      setSelectedCondition('');
      setCustomThreshold('');
    } catch (err: any) {
      setMessage(`Failed to set reminder: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">AI+ Dashboard</h1>
        <p className="text-gray-600 text-lg">Monitor your crypto wallet and set AI-powered email reminders</p>
      </div>

      {error.length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-pulse">
          {error.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </div>
      )}

      {loading && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 animate-pulse">
          Loading balances...
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Wallet Balances</h2>
          <TrendingUp className="w-8 h-8 text-green-300" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Total Balance</p>
                <p className="text-sm text-gray-500">Across all wallets</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">${walletBalance.total_usd_value.toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">ℏ</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Hydra (Hedera)</p>
                <p className="text-sm text-gray-500">Hedera Network</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{walletBalance.hydra.balance_hbar.toFixed(2)} ℏ</p>
              <p className="text-sm text-gray-500">${walletBalance.hydra.usd_value.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Coinbase</p>
                <p className="text-sm text-gray-500">Ethereum + Polygon</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">${walletBalance.coinbase.balance_usd.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-sm text-green-700 font-medium">Total USD Value</p>
          <p className="text-2xl font-bold text-green-800">
            ${walletBalance.total_usd_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Set AI-Powered Email Reminders</h2>
          <button
            onClick={() => copyToClipboard(email)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reminder Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select a condition</option>
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>
          {selectedCondition === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Threshold ($)</label>
              <input
                type="number"
                value={customThreshold}
                onChange={(e) => setCustomThreshold(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter custom USD threshold"
              />
            </div>
          )}
          <button
            onClick={handleSetReminder}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Set Reminder
          </button>
          {message && (
            <p className={`mt-2 text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPlus;