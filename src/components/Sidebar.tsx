import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Wallet, Bot, Shield, Network, Brain, LogOut, User, Menu, ChevronLeft } from 'lucide-react';

import Logo from '../assets/cryptora-logo.svg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
}

const tabs = [
  { name: 'Home', icon: Home, gradient: 'from-blue-600 to-indigo-600' },
  { name: 'Wallet', icon: Wallet, gradient: 'from-orange-500 to-yellow-500' },
  { name: 'AI', icon: Bot, gradient: 'from-purple-600 to-pink-600' },
  { name: 'AI+', icon: Brain, gradient: 'from-red-500 to-orange-500' },
  { name: 'Security', icon: Shield, gradient: 'from-green-500 to-teal-500' },
  { name: 'Hedera', icon: Network, gradient: 'from-cyan-500 to-blue-500' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userEmail, onLogout, isMinimized, setIsMinimized }) => {
  return (
    <motion.div
      className={`h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white flex flex-col justify-between fixed overflow-y-auto transition-all duration-300 ${isMinimized ? 'w-16' : 'w-64'}`}
      animate={{ width: isMinimized ? 64 : 256 }}
    >
      <div>
        <div className="p-4 flex items-center justify-between">
          {!isMinimized && (
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              <img src={Logo} alt="" />
            </span>
          )}
          <motion.button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-full hover:bg-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMinimized ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </motion.button>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <motion.div
              key={tab.name}
              className={`flex items-center p-4 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${activeTab === tab.name ? `bg-gradient-to-r ${tab.gradient} shadow-lg` : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab(tab.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="w-6 h-6 mr-3 flex-shrink-0" />
              {!isMinimized && <span className="text-lg">{tab.name}</span>}
            </motion.div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className={`flex items-center p-4 mx-2 rounded-xl bg-gray-800 ${isMinimized ? 'justify-center' : ''}`}>
          <User className="w-6 h-6 mr-3 text-gray-300 flex-shrink-0" />
          {!isMinimized && <span className="text-sm truncate">{userEmail}</span>}
        </div>
        <motion.div
          className={`flex items-center p-4 mx-2 mt-2 rounded-xl cursor-pointer hover:bg-gray-700 transition-all duration-300 ${isMinimized ? 'justify-center' : ''}`}
          onClick={onLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-6 h-6 mr-3 text-gray-300 flex-shrink-0" />
          {!isMinimized && <span className="text-lg">Sign Out</span>}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;