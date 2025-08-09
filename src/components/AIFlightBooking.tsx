import React, { useState } from 'react';
import { Plane, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIFlightBookingProps {
  onNavigate: (tab: string) => void;
}

const AIFlightBooking: React.FC<AIFlightBookingProps> = ({ onNavigate }) => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/book-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_city: fromCity, to_city: toCity, date: travelDate }),
      });
      if (!response.ok) throw new Error('Failed to start booking process');
      alert('Flight booking process started! Check the browser window.');
    } catch (err) {
      setError('Error starting booking process. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-sans overflow-hidden">
      {/* Background Wave Animation */}
      <div className="absolute inset-0 z-0">
        <div className="wave-bg"></div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 pt-24 pb-16 max-w-3xl mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent mb-8 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          AI Flight Booking
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Book flights with crypto on Travala.com, powered by AI automation.
        </motion.p>

        {/* Flight Booking Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gradient-to-r from-orange-50 to-amber-100 rounded-2xl p-8 border border-orange-300 shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">From</label>
              <div className="relative">
                <Plane className="absolute left-3 top-3 w-5 h-5 text-orange-600" />
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="e.g., Bangalore"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">To</label>
              <div className="relative">
                <Plane className="absolute left-3 top-3 w-5 h-5 text-orange-600" />
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="e.g., Mumbai"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-orange-600" />
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:outline-none"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-orange-50 to-amber-100 text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-100 hover:to-amber-200 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-6 h-6 text-orange-600" />
            <span>{isLoading ? 'Processing...' : 'Book Flight'}</span>
          </motion.button>
          {error && (
            <motion.p
              className="mt-4 text-red-600 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
        </motion.form>
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

export default AIFlightBooking;