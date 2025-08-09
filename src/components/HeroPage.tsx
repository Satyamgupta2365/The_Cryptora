import React, { useState } from 'react';
import { User, Lock, Wallet, Shield, Zap, Brain, Network, ChevronDown, ArrowRight, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroPageProps {
  onLogin: (email: string) => void;
}

const HeroPage: React.FC<HeroPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');
      onLogin(email);
      alert('Login successful! Wallets Connected');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Network,
      title: "Multi-Chain Support",
      description: "Manage assets across Ethereum, Polygon, BSC, Arbitrum, and Hedera networks seamlessly.",
      gradient: "from-blue-700 to-indigo-800"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get intelligent portfolio insights and investment recommendations powered by LLaMA 3.1.",
      gradient: "from-orange-400 to-amber-500"
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Built-in token security analyzer detects scams, honeypots, and suspicious contracts.",
      gradient: "from-purple-700 to-indigo-800"
    },
    {
      icon: Bot,
      title: "MCP Integration",
      description: "Control multiple wallets simultaneously with our unique Model Context Protocol implementation.",
      gradient: "from-blue-700 to-orange-400"
    }
  ];

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Particle Effects */}
        <div className="absolute inset-0 particles-bg" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent mb-4">
              Welcome Back
            </h1>
            <p className="text-gray-700">
              Log in to access your Web3 wallet and explore Cryptora's features.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleLogin}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 rounded-2xl p-8 border border-gray-200 shadow-lg backdrop-blur-sm"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2">Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-orange-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user1@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-900 font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-orange-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="pass123"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-orange-50 to-amber-100 text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-100 hover:to-amber-200 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wallet className="w-6 h-6 text-orange-600" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet & Login'}</span>
              </motion.button>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 text-center text-sm"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>

          <motion.button
            onClick={() => setShowLogin(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 w-full text-gray-700 hover:text-gray-900 transition-colors text-sm"
          >
            ← Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 overflow-hidden">
      {/* Background Particle Effects */}
      <div className="fixed inset-0 particles-bg pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-8"
            >
              <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                Cryptora
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12"
            >
              Revolutionize your cryptocurrency portfolio management with AI-powered analysis, 
              multi-chain support, and advanced security features.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-gradient-to-r from-orange-50 to-amber-100 text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-100 hover:to-amber-200 transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-orange-400 text-orange-400 rounded-xl font-semibold text-lg hover:bg-orange-400 hover:text-gray-900 transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Learn More</span>
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-orange-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-orange-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experience the next generation of cryptocurrency management with cutting-edge 
              technology and unparalleled security.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/80 rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => setShowLogin(true)}
              className="px-12 py-4 bg-gradient-to-r from-orange-50 to-amber-100 text-gray-900 rounded-xl font-semibold text-xl shadow-lg hover:shadow-xl hover:from-orange-100 hover:to-amber-200 transition-all duration-300 flex items-center space-x-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet className="w-6 h-6 text-orange-600" />
              <span>Start Your Journey</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { number: "5+", label: "Blockchain Networks" },
              { number: "25+", label: "AI-Powered Tools" },
              { number: "100%", label: "Security Focus" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white/80 rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-gray-700 text-lg">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        .particles-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          overflow: hidden;
        }
        .particles-bg::before,
        .particles-bg::after,
        .particles-bg > .particle-1,
        .particles-bg > .particle-2,
        .particles-bg > .particle-3 {
          content: '';
          position: absolute;
          border-radius: 50%;
          animation: float 12s linear infinite;
        }
        .particles-bg::before {
          width: 60px;
          height: 60px;
          top: 10%;
          left: 15%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 10%, transparent 50%);
          animation-delay: -2s;
        }
        .particles-bg::after {
          width: 80px;
          height: 80px;
          top: 70%;
          left: 80%;
          background: radial-gradient(circle, rgba(251, 146, 60, 0.3) 10%, transparent 50%);
          animation-delay: -6s;
        }
        .particles-bg > .particle-1 {
          width: 50px;
          height: 50px;
          top: 30%;
          left: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 10%, transparent 50%);
          animation-delay: -4s;
        }
        .particles-bg > .particle-2 {
          width: 70px;
          height: 70px;
          top: 50%;
          left: 30%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 10%, transparent 50%);
          animation-delay: -8s;
        }
        .particles-bg > .particle-3 {
          width: 40px;
          height: 40px;
          top: 20%;
          left: 70%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 10%, transparent 50%);
          animation-delay: -10s;
        }
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(100px, -100px) scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: translate(200px, -200px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroPage;