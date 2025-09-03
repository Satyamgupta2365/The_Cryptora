import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Newspaper, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div
      className={`flex items-start space-x-3 ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">
          {message.content.split('\n').map((line, index) => (
            <p key={index} className="mb-1">
              {line}
            </p>
          ))}
        </div>
        <p
          className={`text-xs mt-2 ${
            isUser ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<'news' | 'chat' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: 'Hello! I\'m your Web3 AI assistant. I can help you with crypto news analysis, wallet summaries, token safety checks, and answer blockchain-related questions. How can I assist you today?',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.queryAI(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response || 'Sorry, I couldn\'t process your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I\'m having trouble connecting to the AI service. Please make sure the backend is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCryptoNews = async () => {
    setLoading(true);
    setCurrentAction('news');
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: 'Fetch me the latest crypto news.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.getCryptoNews();
      
      const newsMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.news || 'Unable to fetch crypto news at the moment.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newsMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I couldn\'t fetch the latest crypto news. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Assistant</h1>
        <p className="text-gray-600">Get intelligent insights about crypto and blockchain</p>
      </div>

      <div className="mb-6 flex space-x-4">
        <button
          onClick={handleGetCryptoNews}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
            currentAction === 'news'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Latest Crypto News</span>
        </button>
        <button
          onClick={() => setCurrentAction('chat')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
            currentAction === 'chat'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Chatbot</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about crypto, DeFi, or blockchain..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
