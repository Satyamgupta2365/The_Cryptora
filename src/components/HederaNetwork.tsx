import React, { useState, useEffect } from 'react';
import { Network, Send, RefreshCw, CheckCircle, AlertCircle, Loader2, History } from 'lucide-react';
import { api } from '../services/api';
import { HederaBalance, TransferResult } from '../types';

const HederaNetwork: React.FC = () => {
  const [hederaBalance, setHederaBalance] = useState<HederaBalance | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [hederaTips, setHederaTips] = useState<string[]>([]);
  const [hederaNews, setHederaNews] = useState<string[]>([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState<
    Array<{
      id: string;
      timestamp: string;
      recipient: string;
      amount: string;
      status: string;
      transactionId?: string;
    }>
  >([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load transaction history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hederaTransactionHistory');
    if (savedHistory) {
      setTransactionHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save transaction history to localStorage whenever it changes
  useEffect(() => {
    if (transactionHistory.length > 0) {
      localStorage.setItem('hederaTransactionHistory', JSON.stringify(transactionHistory));
    }
  }, [transactionHistory]);

  const fetchHederaBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getHederaBalance();
      if (response.error) {
        setError(response.error);
      } else {
        setHederaBalance(response);
      }
    } catch (err) {
      setError('Failed to fetch Hedera balance. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const transferHbar = async () => {
    if (!recipientAddress.trim()) {
      setError('Please enter a recipient address');
      return;
    }
    if (!transferAmount.trim() || parseFloat(transferAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setTransferLoading(true);
    setError('');
    setTransferResult(null);

    const transactionData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleString(),
      recipient: recipientAddress,
      amount: transferAmount,
      status: 'PENDING',
    };

    setTransactionHistory((prev) => [transactionData, ...prev]);

    try {
      const response = await api.transferHbar(
        '0xa4b59ac541bc5eada6cfb1a16afd569e65186ddd4cf6bee7f948528432029777',
        recipientAddress,
        parseFloat(transferAmount)
      );
      setTransferResult(response);

      // Update transaction history with result
      setTransactionHistory((prev) =>
        prev.map((tx) =>
          tx.id === transactionData.id
            ? {
                ...tx,
                status: response.status,
                transactionId: response.transaction_id,
              }
            : tx
        )
      );

      if (response.status === 'SUCCESS') {
        await fetchHederaBalance();
      }
    } catch (err) {
      setError('Failed to transfer HBAR. Check inputs or backend.');
      setTransactionHistory((prev) =>
        prev.map((tx) =>
          tx.id === transactionData.id
            ? { ...tx, status: 'FAILED', transactionId: undefined }
            : tx
        )
      );
    } finally {
      setTransferLoading(false);
    }
  };

  useEffect(() => {
    fetchHederaBalance();
    // Fetch Hedera tips
    setTipsLoading(true);
    fetch('http://localhost:8000/hedera/tips', { mode: 'cors' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log('Full tips response:', data);
        if (data.tips && typeof data.tips === 'string') {
          const tips = data.tips.split('\n').map((tip: string) => tip.trim()).filter((tip: string) => tip.length > 0);
          setHederaTips(tips.length > 0 ? tips : ['No tips available.']);
        } else {
          console.error('Invalid tips format:', data);
          setHederaTips(['Invalid tips data.']);
        }
      })
      .catch((error) => {
        console.error('Tips fetch error:', error.message);
        setHederaTips(['Failed to load tips. Check console.']);
      })
      .finally(() => setTipsLoading(false));
    // Fetch Hedera news
    setNewsLoading(true);
    fetch('http://localhost:8000/hedera/news', { mode: 'cors' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log('Full news response:', data);
        if (data.news && typeof data.news === 'string') {
          const news = data.news.split('\n').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
          setHederaNews(news.length > 0 ? news : ['No news available.']);
        } else {
          console.error('Invalid news format:', data);
          setHederaNews(['Invalid news data.']);
        }
      })
      .catch((error) => {
        console.error('News fetch error:', error.message);
        setHederaNews(['Failed to load news. Check console.']);
      })
      .finally(() => setNewsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Hedera Network</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your HBAR tokens and stay updated</p>
          </div>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
            title="Transaction History"
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction History Modal */}
        {isHistoryOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <History className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                  <span>Transaction History</span>
                </h2>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
              {transactionHistory.length === 0 ? (
                <p className="text-sm sm:text-base text-gray-600">No transactions yet.</p>
              ) : (
                <div className="space-y-4">
                  {transactionHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-lg border flex items-center space-x-2 text-sm ${
                        tx.status === 'SUCCESS'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : tx.status === 'FAILED'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}
                    >
                      {tx.status === 'SUCCESS' ? (
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                      ) : tx.status === 'FAILED' ? (
                        <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                      ) : (
                        <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                      )}
                      <div>
                        <p className="text-xs sm:text-sm">Time: {tx.timestamp}</p>
                        <p className="text-xs sm:text-sm">Recipient: {tx.recipient}</p>
                        <p className="text-xs sm:text-sm">Amount: {tx.amount} ℏ</p>
                        <p className="text-xs sm:text-sm">Status: {tx.status}</p>
                        {tx.transactionId && (
                          <p className="text-xs sm:text-sm">TX ID: {tx.transactionId}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Balance Check (Left Column) */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Network className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
                <span>Account Balance</span>
              </h2>
              <button
                onClick={fetchHederaBalance}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {error && !hederaBalance && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {hederaBalance && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl">ℏ</span>
                    </div>
                    <div>
                      <h3 className="text-md sm:text-lg font-semibold text-gray-900">HBAR Balance</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Account: {hederaBalance.account_id}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Balance (HBAR):</span>
                      <span className="text-xl sm:text-2xl font-bold text-purple-800">
                        {(hederaBalance.balance * 0.00000001).toFixed(8)} ℏ
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Balance (Tinybars):</span>
                      <span className="text-xs sm:text-sm text-gray-700">
                        {hederaBalance.balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Est. USD Value:</span>
                      <span className="text-md sm:text-lg font-semibold text-green-600">
                        ${((hederaBalance.balance * 0.00000001) * 0.05).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 text-sm sm:text-base mb-2">Network Info</h4>
                  <div className="space-y-1 text-xs sm:text-sm text-blue-700">
                    <p>• Network: Hedera Mainnet</p>
                    <p>• Consensus: Hashgraph</p>
                    <p>• Transaction Fee: ~$0.0001</p>
                    <p>• Finality: 3-5 seconds</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transfer HBAR (Right Column) */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Send className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              <span>Transfer HBAR</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0.0.123456 or 0x... (MetaMask)"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Amount (HBAR)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <button
                onClick={transferHbar}
                disabled={transferLoading}
                className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50"
              >
                {transferLoading ? (
                  <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 sm:w-5 h-4 sm:h-5" />
                )}
                <span>{transferLoading ? 'Transferring...' : 'Transfer HBAR'}</span>
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2 text-sm">
                  <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span>{error}</span>
                </div>
              )}

              {transferResult && (
                <div className={`p-3 rounded-lg border flex items-center space-x-2 text-sm ${
                  transferResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  {transferResult.error ? (
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                  ) : (
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                  )}
                  <div>
                    {transferResult.error ? (
                      <p>{transferResult.error}</p>
                    ) : (
                      <div>
                        <p className="font-medium">Transfer Successful!</p>
                        <p className="text-xs sm:text-sm">Status: {transferResult.status}</p>
                        {transferResult.transaction_id && (
                          <p className="text-xs sm:text-sm">TX ID: {transferResult.transaction_id}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 text-sm sm:text-base mb-2">Important Notes</h4>
              <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                <li>• Transfers to MetaMask are simulated</li>
                <li>• Verify recipient addresses</li>
                <li>• Fees are auto-deducted</li>
                <li>• Transfers are irreversible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips and News */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tips on Hedera */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Network className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
              <span>Tips on Hedera</span>
            </h2>
            <div className="space-y-2 text-gray-700">
              {tipsLoading ? (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  <span>Loading tips...</span>
                </div>
              ) : hederaTips.length > 0 ? (
                hederaTips.map((tip, index) => (
                  <p key={index} className="text-sm sm:text-base">{tip}</p>
                ))
              ) : (
                <p className="text-sm sm:text-base text-red-500">{hederaTips[0]}</p>
              )}
            </div>
          </div>

          {/* News on Hedera */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Network className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
              <span>News on Hedera</span>
            </h2>
            <div className="space-y-2 text-gray-700">
              {newsLoading ? (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  <span>Loading news...</span>
                </div>
              ) : hederaNews.length > 0 ? (
                hederaNews.map((news, index) => (
                  <p key={index} className="text-sm sm:text-base">{news}</p>
                ))
              ) : (
                <p className="text-sm sm:text-base text-red-500">{hederaNews[0]}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HederaNetwork;