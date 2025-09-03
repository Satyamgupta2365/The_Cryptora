import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

// Define the structure of a reminder
interface Reminder {
  id: number;
  email: string;
  condition: string;
  threshold?: number;
}

const AIPlus: React.FC = () => {
  // State to manage reminders, loading status, errors, and user inputs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [customThreshold, setCustomThreshold] = useState('');
  const [message, setMessage] = useState('');
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // List of available reminder conditions
  const conditions = [
    { label: 'Total Balance Crosses $51', value: 'total_above_51' },
    { label: 'Hydra Balance Increases', value: 'hydra_increase' },
    { label: 'Coinbase Balance Increases', value: 'coinbase_increase' },
    { label: 'Total Balance Drops Below $51', value: 'total_below_51' },
    { label: 'Custom', value: 'custom' },
  ];

  // Function to set a reminder
  const handleSetReminder = async () => {
    if (!email) {
      setMessage('Please enter an email address.');
      return;
    }
    if (!selectedCondition) {
      setMessage('Please select a condition.');
      return;
    }
    if (selectedCondition === 'custom' && !customThreshold) {
      setMessage('Please enter a custom threshold.');
      return;
    }
    setMessage('Setting reminder in progress...');
    setLoading(true);
    try {
      // Add currentBalances to match backend schema (dummy values if not available)
      await api.setEmailReminder({
        email,
        condition: selectedCondition,
        threshold: selectedCondition === 'custom' ? parseFloat(customThreshold) : undefined,
        currentBalances: {
          total_usd_value: 0,
          hydra: { balance_hbar: 0, usd_value: 0 },
          coinbase: { balance_usd: 0 },
          metamask: { balance_eth: 0, usd_value: 0 }
        }
      });
      // Add the new reminder to the list
      const newReminder: Reminder = {
        id: reminders.length + 1,
        email,
        condition: selectedCondition,
        threshold: selectedCondition === 'custom' ? parseFloat(customThreshold) : undefined,
      };
      setReminders([...reminders, newReminder]);
      setMessage(`Reminder set successfully! Email will be sent to ${email}.`);
      setEmail('');
      setSelectedCondition('');
      setCustomThreshold('');
    } catch (err: any) {
      setError((prev) => [...prev, `Failed to set reminder: ${err.message}`]);
      setMessage('Failed to set reminder.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get the label for a condition
  const getConditionLabel = (value: string) => {
    const cond = conditions.find((c) => c.value === value);
    return cond ? cond.label : value;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-blue-700">AI+ Dashboard</h1>
          <p className="text-gray-600 text-lg mt-2">Manage your crypto portfolio.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-md"
        >
          <Bell className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium">Notifications</span>
        </motion.button>
      </motion.div>

      {/* Reminder Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsReminderOpen(!isReminderOpen)}
        >
          <h2 className="text-xl font-bold text-gray-800">Set Balance Reminders</h2>
          <motion.div animate={{ rotate: isReminderOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
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
                Get email alerts for portfolio changes sent to your email.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
              >
                <option value="" className="text-gray-500">
                  Select condition
                </option>
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value} className="text-gray-900">
                    {cond.label}
                  </option>
                ))}
              </select>
              {selectedCondition === 'custom' && (
                <input
                  type="number"
                  value={customThreshold}
                  onChange={(e) => setCustomThreshold(e.target.value)}
                  placeholder="Custom threshold ($)"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-300"
                />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSetReminder}
                className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg"
              >
                Set Reminder
              </motion.button>
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Current Reminders</h3>
                {reminders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reminders set yet.</p>
                ) : (
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {reminders.map((reminder) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
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

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <AnimatePresence>
          {error.length > 0 &&
            error.map((err, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-red-100 text-red-700 rounded-xl shadow-lg"
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
              className="p-4 bg-green-100 text-green-700 rounded-xl shadow-lg"
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
              className="p-4 bg-yellow-100 text-yellow-700 rounded-xl shadow-lg"
            >
              <span className="text-lg animate-spin">🔄</span>
              <span className="ml-2 font-medium text-sm">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPlus;

// This error is from your backend or LLM provider, not frontend code.
// To fix: 
// - Check your backend .env and llm_utils.py for the correct model name.
// - Use a valid model name you have access to (e.g., "llama-3-8b-instruct" or another supported by your provider).