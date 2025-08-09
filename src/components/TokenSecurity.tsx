import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

const TokenSecurity: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [securityAnalysis, setSecurityAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeToken = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    setLoading(true);
    setError('');
    setSecurityAnalysis('');

    try {
      const response = await api.checkTokenSecurity(tokenAddress);
      setSecurityAnalysis(response.security_analysis);
    } catch (err) {
      setError('Failed to analyze token. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const commonScamTokens = [
    {
      name: 'SafeMoon V2',
      address: '0x42981d0bfbAf196529376EE702F2a9Eb9092fcB5',
      risk: 'high',
      reason: 'High sell tax, liquidity concerns'
    },
    {
      name: 'Example Scam Token',
      address: '0x1234567890123456789012345678901234567890',
      risk: 'high',
      reason: 'Honeypot contract, cannot sell'
    },
    {
      name: 'Suspicious Token',
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      risk: 'medium',
      reason: 'Unverified contract, low liquidity'
    }
  ];

  const securityTips = [
    {
      title: 'Check Contract Verification',
      description: 'Always verify that the token contract is verified on Etherscan or similar block explorers.',
      icon: CheckCircle
    },
    {
      title: 'Analyze Liquidity',
      description: 'Ensure the token has sufficient liquidity and the liquidity is locked.',
      icon: Shield
    },
    {
      title: 'Review Token Holders',
      description: 'Check if the token distribution is fair and not concentrated in few wallets.',
      icon: AlertTriangle
    },
    {
      title: 'Test Small Amounts',
      description: 'Always test with small amounts before making large investments.',
      icon: CheckCircle
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Token Security Analyzer</h1>
        <p className="text-gray-600">Analyze tokens for potential security risks and scams</p>
      </div>

      {/* Token Analysis Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span>Analyze Token</span>
        </h2>
        
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter token contract address (0x...)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={analyzeToken}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <Search className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {securityAnalysis && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Security Analysis</span>
            </h3>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{securityAnalysis}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Known Risky Tokens */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span>Known Risky Tokens</span>
          </h2>
          
          <div className="space-y-4">
            {commonScamTokens.map((token, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{token.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    token.risk === 'high' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {token.risk.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{token.reason}</p>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {token.address}
                  </code>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Security Best Practices</span>
          </h2>
          
          <div className="space-y-4">
            {securityTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">Remember</h3>
            <p className="text-sm text-green-700">
              Always do your own research (DYOR) and never invest more than you can afford to lose. 
              If something seems too good to be true, it probably is.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSecurity;