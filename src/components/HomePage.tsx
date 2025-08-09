import React from 'react';
import { Wallet, Bot, Shield, Network, TrendingUp, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Wallet,
      title: 'Multi-Chain Wallet',
      description: 'Manage assets across Ethereum, Polygon, BSC, Arbitrum, and Hedera networks',
      color: 'from-orange-600 to-amber-600',
      action: () => onNavigate('wallet'),
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Get intelligent insights about crypto markets and blockchain technology',
      color: 'from-purple-600 to-pink-600',
      action: () => onNavigate('ai'),
    },
    {
      icon: Shield,
      title: 'Token Security',
      description: 'Analyze tokens for potential security risks and scam detection',
      color: 'from-blue-600 to-indigo-600',
      action: () => onNavigate('security'),
    },
    {
      icon: Network,
      title: 'Hedera Network',
      description: 'Transfer HBAR tokens and interact with the Hedera ecosystem',
      color: 'from-purple-600 to-pink-600',
      action: () => onNavigate('hedera'),
    },
  ];

  const stats = [
    { label: 'Networks Supported', value: '5+', icon: Globe },
    { label: 'Transaction Speed', value: '<5s', icon: Zap },
    { label: 'Security Checks', value: '24/7', icon: Shield },
    { label: 'AI Powered', value: '100%', icon: Bot },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-sans overflow-hidden">
      {/* Background Wave Animation */}
      <div className="absolute inset-0 z-0">
        <div className="wave-bg"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        className="relative z-10 pt-24 pb-16 text-center"
        initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-7xl lg:text-9xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent mb-8 tracking-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Cryptora
        </motion.h1>
        <motion.p
          className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your gateway to Web3: manage multi-chain assets, leverage AI insights, and secure your crypto journey.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-6">
          <motion.button
            onClick={() => onNavigate('wallet')}
            className="px-8 py-4 bg-gradient-to-r from-orange-50 to-amber-100 text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-100 hover:to-amber-200 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-orange-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wallet className="w-6 h-6 text-orange-600" />
            <span>Connect Wallet</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate('ai')}
            className="px-8 py-4 bg-gradient-to-r from-purple-50 to-pink-100 text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-purple-100 hover:to-pink-200 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-6 h-6 text-purple-600" />
            <span>Try AI Assistant</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 text-center border border-green-300 hover:bg-emerald-200 transition-all duration-300"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Icon className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              onClick={feature.action}
              className="bg-gradient-to-r from-orange-50 to-amber-100 rounded-2xl p-8 border border-orange-300 hover:bg-amber-200 transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              <div className="mt-6 flex items-center text-orange-600 font-medium group-hover:text-orange-700 transition-colors duration-200">
                <span>Explore feature</span>
                <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Network Support Section */}
      <motion.div
        className="relative z-10 bg-gradient-to-r from-purple-50 to-pink-100 rounded-3xl p-12 max-w-7xl mx-auto text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Supported Networks</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Seamlessly manage your assets across multiple blockchain networks with real-time balance tracking and secure transfers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Ethereum', symbol: 'ETH', color: 'bg-gray-800' },
            { name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-600' },
            { name: 'BSC', symbol: 'BNB', color: 'bg-yellow-500' },
            { name: 'Arbitrum', symbol: 'ARB', color: 'bg-blue-600' },
            { name: 'Hedera', symbol: 'HBAR', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
          ].map((network, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 hover:bg-gray-50 transition-all duration-200 border border-purple-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`w-12 h-12 ${network.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="text-white font-bold text-sm">{network.symbol}</span>
              </div>
              <div className="font-semibold text-gray-900">{network.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        .wave-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
          overflow: hidden;
        }
        .wave-bg::before,
        .wave-bg::after {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 10%, transparent 40%);
          animation: wave 15s linear infinite;
        }
        .wave-bg::after {
          animation-delay: -7.5s;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 10%, transparent 40%);
        }
        @keyframes wave {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;