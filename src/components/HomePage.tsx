
import React from 'react';
import { Wallet, Bot, Shield, Network, Globe, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Wallet,
      title: 'Multi-Chain Wallet',
      description: 'Manage assets across Ethereum, Polygon, BSC, Arbitrum, and Hedera networks.',
      color: 'from-orange-500 to-amber-500',
      action: () => onNavigate('wallet'),
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Get intelligent insights about crypto markets and blockchain technology.',
      color: 'from-purple-500 to-pink-500',
      action: () => onNavigate('ai'),
    },
    {
      icon: Shield,
      title: 'Token Security',
      description: 'Analyze tokens for potential security risks and scam detection.',
      color: 'from-blue-500 to-indigo-500',
      action: () => onNavigate('security'),
    },
    {
      icon: Network,
      title: 'Hedera Network',
      description: 'Transfer HBAR tokens and interact with the Hedera ecosystem.',
      color: 'from-teal-500 to-cyan-500',
      action: () => onNavigate('hedera'),
    },
  ];

  const stats = [
    { label: 'Networks Supported', value: '5+', icon: Globe },
    { label: 'Transaction Speed', value: '<5s', icon: Zap },
    { label: 'Security Checks', value: '24/7', icon: Shield },
    { label: 'AI Powered', value: '100%', icon: Bot },
  ];

  const networks = [
    { name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-600' },
    { name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-600' },
    { name: 'BSC', symbol: 'BNB', color: 'bg-yellow-500' },
    { name: 'Arbitrum', symbol: 'ARB', color: 'bg-indigo-600' },
    { name: 'Hedera', symbol: 'HBAR', color: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Hero Section */}
      <motion.section
        className="relative z-10 pt-32 pb-20 text-center px-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Cryptora
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Empower your crypto journey: manage multi-chain assets, gain AI-driven insights, and secure your investments with ease.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-6">
          <motion.button
            onClick={() => onNavigate('wallet')}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-orange-300"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wallet className="w-6 h-6" />
            <span>Wallet Address is Encrypted</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate('wallet')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-cyan-300"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wallet className="w-6 h-6" />
            <span>Explore Wallet</span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate('ai')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-purple-300"
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-6 h-6" />
            <span>Try AI Assistant</span>
          </motion.button>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 hover:bg-gray-100 transition-all duration-300 shadow-sm"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Icon className="w-10 h-10 text-cyan-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Features Grid */}
      <motion.section
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              onClick={feature.action}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:bg-gray-50 transition-all duration-300 cursor-pointer group shadow-md"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
            >
              <motion.div
                className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}
                whileHover={{ scale: 1.15, rotate: 5 }}
              >
                <Icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              <div className="mt-4 flex items-center text-cyan-600 font-medium group-hover:text-cyan-700 transition-colors duration-200">
                <span>Explore</span>
                <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Network Support Section */}
      <motion.section
        className="relative z-10 bg-gray-50 rounded-3xl p-12 max-w-7xl mx-auto mb-20 px-6 shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center tracking-tight">
          Supported Networks
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto text-center">
          Seamlessly manage your assets across multiple blockchain networks with real-time tracking and secure transfers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {networks.map((network, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-5 hover:bg-gray-100 transition-all duration-300 border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}
            >
              <div className={`w-12 h-12 ${network.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="text-white font-bold text-sm">{network.symbol}</span>
              </div>
              <div className="font-semibold text-gray-900 text-center">{network.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 py-8 text-center text-gray-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p>&copy; {new Date().getFullYear()} Cryptora. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="#" className="hover:text-cyan-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-cyan-600 transition-colors">Contact Us</a>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;
