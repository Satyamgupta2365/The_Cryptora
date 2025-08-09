import React, { useState } from 'react';
import HeroPage from './components/HeroPage';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import WalletPage from './components/walletpage';
import AIAssistant from './components/AIAssistant';
import TokenSecurity from './components/TokenSecurity';
import HederaNetwork from './components/HederaNetwork';
import AIPlus from './components/AIPlus';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [userEmail, setUserEmail] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setActiveTab('Home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setActiveTab('Home');
    setIsMinimized(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomePage />;
      case 'Wallet':
        return <WalletPage />;
      case 'AI':
        return <AIAssistant />;
      case 'Security':
        return <TokenSecurity />;
      case 'Hedera':
        return <HederaNetwork />;
      case 'AI+':
        return <AIPlus />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn ? (
        <div className="flex">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userEmail={userEmail}
            onLogout={handleLogout}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
          />
          <main className={`flex-1 p-8 transition-all duration-300 ${isMinimized ? 'ml-16' : 'ml-64'}`}>
            {renderContent()}
          </main>
        </div>
      ) : (
        <HeroPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;