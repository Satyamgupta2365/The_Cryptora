import React, { useState, useEffect } from 'react';
import { TrendingUp, Mic, Send, BarChart, Bell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface WalletBalance {
  total_usd_value: number;
  hydra: { balance_hbar: number; usd_value: number };
  coinbase: { balance_usd: number };
  metamask: { balance_eth: number; usd_value: number };
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Reminder {
  id: number;
  email: string;
  condition: string;
  threshold?: number;
}

const AIPlus: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    total_usd_value: 53.21,
    hydra: { balance_hbar: 1034.98, usd_value: 51 },
    coinbase: { balance_usd: 2.93 },
    metamask: { balance_eth: 0.0003, usd_value: 0.28 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [customThreshold, setCustomThreshold] = useState('');
  const [message, setMessage] = useState('');
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [insights, setInsights] = useState('');
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

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

    const fetchExpenses = async () => {
      try {
        const response = await api.getExpenses();
        setExpenses(response.expenses);
      } catch (err) {
        setError((prev) => [
          ...prev,
          `Failed to fetch expenses: ${err instanceof Error ? err.message : String(err)}`,
        ]);
      }
    };

    fetchBalances();
    fetchExpenses();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSetReminder = async () => {
    if (!email || !selectedCondition) {
      setMessage('Please enter an email and select a condition.');
      return;
    }
    if (selectedCondition === 'custom' && !customThreshold) {
      setMessage('Please enter a custom threshold.');
      return;
    }
    setMessage('Setting reminder in progress...');
    try {
      await api.setEmailReminder({
        email,
        condition: selectedCondition,
        threshold: selectedCondition === 'custom' ? parseFloat(customThreshold) : undefined,
        currentBalances: walletBalance,
      });
      const newReminder: Reminder = {
        id: reminders.length + 1,
        email,
        condition: selectedCondition,
        threshold: selectedCondition === 'custom' ? parseFloat(customThreshold) : undefined,
      };
      setReminders([...reminders, newReminder]);
      setMessage('Reminder set successfully!');
      setEmail('');
      setSelectedCondition('');
      setCustomThreshold('');
    } catch (err: any) {
      setMessage(`Failed to set reminder: ${err.message}`);
    }
  };

  const parseAndHandleInput = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    // Handle transfer
    const transferMatch = userInput.match(/transfer \$(\d+(?:\.\d+)?) from (\w+) to (\w+)/i);
    if (transferMatch) {
      const amount = parseFloat(transferMatch[1]);
      const fromWallet = transferMatch[2].toLowerCase();
      const toWallet = transferMatch[3].toLowerCase();
      
      if (isNaN(amount) || amount <= 0) {
        setMessage('Invalid transfer amount.');
        return;
      }
      
      const newBalance = { ...walletBalance };
      let success = false;
      
      if (fromWallet === 'hydra' && toWallet === 'metamask' && newBalance.hydra.usd_value >= amount) {
        newBalance.hydra.usd_value -= amount;
        newBalance.hydra.balance_hbar -= amount / (newBalance.hydra.usd_value / newBalance.hydra.balance_hbar || 1);
        newBalance.metamask.usd_value += amount;
        newBalance.metamask.balance_eth += amount / (newBalance.metamask.usd_value / newBalance.metamask.balance_eth || 1);
        success = true;
      } else if (fromWallet === 'coinbase' && toWallet === 'metamask' && newBalance.coinbase.balance_usd >= amount) {
        newBalance.coinbase.balance_usd -= amount;
        newBalance.metamask.usd_value += amount;
        newBalance.metamask.balance_eth += amount / (newBalance.metamask.usd_value / newBalance.metamask.balance_eth || 1);
        success = true;
      }
      
      if (success) {
        newBalance.total_usd_value = newBalance.hydra.usd_value + newBalance.coinbase.balance_usd + newBalance.metamask.usd_value;
        setWalletBalance(newBalance);
        setMessage(`Transfer successful: $${amount} from ${fromWallet} to ${toWallet}`);
        return;
      } else {
        setMessage('Invalid transfer: insufficient funds or unsupported wallets.');
        return;
      }
    }
    
    // Handle log expense
    const expenseMatch = userInput.match(/log \$(\d+(?:\.\d+)?) (\w+) expense for (.+)/i);
    if (expenseMatch) {
      const amount = parseFloat(expenseMatch[1]);
      const category = expenseMatch[2];
      const description = expenseMatch[3];
      
      if (isNaN(amount) || amount <= 0) {
        setMessage('Invalid expense amount.');
        return;
      }
      
      const newExpense: Expense = {
        id: expenses.length + 1,
        amount,
        category,
        description,
        date: new Date().toISOString().split('T')[0],
      };
      setExpenses([...expenses, newExpense]);
      setMessage('Expense tracked successfully!');
      return;
    }
    
    // Handle generate insights
    if (lowerInput.includes('generate insights')) {
      const walletDetails = `Current wallet details:\n- Total: $${walletBalance.total_usd_value.toFixed(2)}\n- Hydra: ${walletBalance.hydra.balance_hbar.toFixed(2)} ℏ ($${walletBalance.hydra.usd_value.toFixed(2)})\n- Coinbase: $${walletBalance.coinbase.balance_usd.toFixed(2)}\n- MetaMask: ${walletBalance.metamask.balance_eth.toFixed(4)} Ξ ($${walletBalance.metamask.usd_value.toFixed(2)})`;
      const expenseSummary = expenses.length > 0 ? `You have ${expenses.length} expenses logged, totaling $${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}.` : 'No expenses logged yet.';
      setInsights(`${walletDetails}\n\n${expenseSummary}\n\nKeep an eye on your spending!`);
      setMessage('Insights generated successfully!');
      return;
    }
    
    setMessage("In process...");
  };

  const handleInput = async (userInput: string) => {
    if (!userInput.trim()) {
      setMessage('Please enter a valid command.');
      return;
    }
    setInput('');
    setMessage('Processing AI request in progress...');
    try {
      // Try API first
      const response = await api.processAIInput({ input: userInput });
      if (response.action === 'transfer') {
        setMessage(`Transfer successful: ${response.details}`);
        if (response.updatedBalances) {
          setWalletBalance(response.updatedBalances);
        }
      } else if (response.action === 'expense') {
        if (response.expense) {
          setExpenses([...expenses, response.expense]);
        }
        setMessage('Expense tracked successfully!');
      } else if (response.action === 'insights') {
        const walletDetails = `Current wallet details:\n- Total: $${walletBalance.total_usd_value.toFixed(2)}\n- Hydra: ${walletBalance.hydra.balance_hbar.toFixed(2)} ℏ ($${walletBalance.hydra.usd_value.toFixed(2)})\n- Coinbase: $${walletBalance.coinbase.balance_usd.toFixed(2)}\n- MetaMask: ${walletBalance.metamask.balance_eth.toFixed(4)} Ξ ($${walletBalance.metamask.usd_value.toFixed(2)})`;
        setInsights(`${walletDetails}\n\n${response.insights}`);
        setMessage('Insights generated successfully!');
      } else {
        setMessage(response.message ?? '');
      }
    } catch (err: any) {
      // Fallback to local handling if API fails
      parseAndHandleInput(userInput);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessage('Voice input not supported in this browser.');
      return;
    }
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setMessage('Error with voice input.');
      setIsListening(false);
    };
    recognition.start();
  };

  const generateInsights = async () => {
    setMessage('Processing AI request in progress...');
    try {
      const response = await api.getInsights();
      const walletDetails = `Current wallet details:\n- Total: $${walletBalance.total_usd_value.toFixed(2)}\n- Hydra: ${walletBalance.hydra.balance_hbar.toFixed(2)} ℏ ($${walletBalance.hydra.usd_value.toFixed(2)})\n- Coinbase: $${walletBalance.coinbase.balance_usd.toFixed(2)}\n- MetaMask: ${walletBalance.metamask.balance_eth.toFixed(4)} Ξ ($${walletBalance.metamask.usd_value.toFixed(2)})`;
      setInsights(`${walletDetails}\n\n${response.insights}`);
      setMessage('Insights generated successfully!');
    } catch (err: any) {
      const walletDetails = `Current wallet details:\n- Total: $${walletBalance.total_usd_value.toFixed(2)}\n- Hydra: ${walletBalance.hydra.balance_hbar.toFixed(2)} ℏ ($${walletBalance.hydra.usd_value.toFixed(2)})\n- Coinbase: $${walletBalance.coinbase.balance_usd.toFixed(2)}\n- MetaMask: ${walletBalance.metamask.balance_eth.toFixed(4)} Ξ ($${walletBalance.metamask.usd_value.toFixed(2)})`;
      const expenseSummary = expenses.length > 0 ? `You have ${expenses.length} expenses logged, totaling $${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}.` : 'No expenses logged yet.';
      setInsights(`${walletDetails}\n\n${expenseSummary}\n\nKeep an eye on your spending!`);
      setMessage('Insights generated successfully! (Local)');
    }
  };

  const getConditionLabel = (value: string) => {
    const cond = conditions.find(c => c.value === value);
    return cond ? cond.label : value;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent tracking-tight">
            AI+ Dashboard
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mt-2">
            Empower your crypto portfolio with AI-driven insights and tools.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex items-center space-x-2 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <Bell className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-gray-800">Notifications</span>
        </motion.button>
      </motion.div>

      {/* Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Total Portfolio Value</h2>
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
          </div>
          <div className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-2 tracking-tight">
            ${walletBalance.total_usd_value.toFixed(2)}
          </div>
          <p className="text-gray-500 text-sm md:text-base">Across all connected wallets</p>
        </div>
      </motion.div>

      {/* Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Hydra */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg hover:border-purple-300 transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">ℏ</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Hydra Network</p>
              <p className="text-sm text-gray-500">Hedera</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {walletBalance.hydra.balance_hbar.toFixed(2)} ℏ
          </p>
          <p className="text-sm text-gray-500">${walletBalance.hydra.usd_value.toFixed(2)}</p>
        </motion.div>

        {/* Coinbase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Coinbase</p>
              <p className="text-sm text-gray-500">USD</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ${walletBalance.coinbase.balance_usd.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Available Funds</p>
        </motion.div>

        {/* MetaMask */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg hover:border-orange-300 transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ξ</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">MetaMask</p>
              <p className="text-sm text-gray-500">Ethereum</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {walletBalance.metamask.balance_eth.toFixed(4)} Ξ
          </p>
          <p className="text-sm text-gray-500">${walletBalance.metamask.usd_value.toFixed(2)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* AI Assistant Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Assistant</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Manage your finances with ease. Try: "Transfer $10 from Coinbase to MetaMask" or "Log $10 food expense for lunch" or "generate insights".
            </p>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-2 shadow-sm">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to your assistant..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none px-4 py-2 focus:ring-2 focus:ring-blue-300 rounded-full"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startListening}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <Mic className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (input.trim()) handleInput(input);
                  else setMessage('Please enter a valid command.');
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-300"
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            </div>
            {isListening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-gray-500 text-sm animate-pulse"
              >
                Listening...
              </motion.p>
            )}
          </motion.div>

          {/* Expense Tracker Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Expense Tracker</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateInsights}
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition-all duration-300 text-sm font-medium"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Generate AI Insights
              </motion.button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-sm">No expenses recorded yet. Use the AI assistant to log one!</p>
              ) : (
                expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800 font-medium">
                        ${expense.amount.toFixed(2)} <span className="text-gray-500 text-sm">({expense.category})</span>
                      </p>
                      <p className="text-gray-500 text-sm">{expense.date}</p>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{expense.description}</p>
                  </motion.div>
                ))
              )}
            </div>
            {insights && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <h3 className="text-md font-semibold text-blue-600 mb-2">AI Insights</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{insights}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Reminder Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsReminderOpen(!isReminderOpen)}
            >
              <h2 className="text-xl font-bold text-gray-800">Set Balance Reminders</h2>
              <motion.div
                animate={{ rotate: isReminderOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </motion.div>
            </div>
            <AnimatePresence>
              {isReminderOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-4"
                >
                  <p className="text-gray-600 text-sm">
                    Receive email alerts when your portfolio hits a certain value or changes.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                  />
                  <div className="relative">
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 appearance-none focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                    >
                      <option value="" className="text-gray-500">Select condition</option>
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value} className="text-gray-900">
                          {cond.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                  {selectedCondition === 'custom' && (
                    <input
                      type="number"
                      value={customThreshold}
                      onChange={(e) => setCustomThreshold(e.target.value)}
                      placeholder="Custom threshold ($)"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200"
                    />
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetReminder}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                  >
                    Set Reminder
                  </motion.button>
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Current Reminders</h3>
                    {reminders.length === 0 ? (
                      <p className="text-gray-500 text-sm">No reminders set yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {reminders.map((reminder) => (
                          <motion.div
                            key={reminder.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                          >
                            <p className="text-gray-800 font-medium">
                              {getConditionLabel(reminder.condition)}
                              {reminder.threshold ? ` (Threshold: $${reminder.threshold.toFixed(2)})` : ''}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">Email: {reminder.email}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        <AnimatePresence>
          {error.length > 0 &&
            error.map((err, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center p-4 bg-red-100 text-red-700 rounded-xl shadow-lg border border-red-200"
              >
                <span className="text-lg">❌</span>
                <span className="ml-2 font-medium text-sm">{err}</span>
              </motion.div>
            ))}
          {message && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center p-4 bg-green-100 text-green-700 rounded-xl shadow-lg border border-green-200"
            >
              <span className="text-lg">✅</span>
              <span className="ml-2 font-medium text-sm">{message}</span>
            </motion.div>
          )}
          {loading && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center p-4 bg-yellow-100 text-yellow-700 rounded-xl shadow-lg border border-yellow-200"
            >
              <span className="text-lg animate-spin">🔄</span>
              <span className="ml-2 font-medium text-sm">Loading balances...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPlus;