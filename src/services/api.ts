const API_BASE_URL = 'http://localhost:8000';

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

interface APIService {
  getWalletBalance: (privateKey: string) => Promise<any>;
  sendEth: (fromKey: string, to: string, amount: number) => Promise<any>;
  getHederaBalance: () => Promise<any>;
  transferHbar: (fromPrivateKey: string, toAccountId: string, amount: number) => Promise<any>;
  queryAI: (question: string) => Promise<any>;
  getCryptoNews: () => Promise<any>;
  checkTokenSecurity: (tokenAddress: string) => Promise<any>;
  getWalletSummary: (address: string, balance: number) => Promise<any>;
  getAIBalances: () => Promise<WalletBalance>;
  setEmailReminder: (data: {
    email: string;
    condition: string;
    threshold?: number;
    currentBalances: WalletBalance;
  }) => Promise<void>;
  processAIInput: (data: { input: string }) => Promise<{
    action: string;
    details?: string;
    updatedBalances?: WalletBalance;
    expense?: Expense;
    insights?: string;
    message?: string;
  }>;
  getExpenses: () => Promise<{ expenses: Expense[] }>;
  getInsights: () => Promise<{ insights: string }>;
  login: (data: { email: string; password: string }) => Promise<any>;
  getHederaTransactions: () => Promise<any>;
  getHederaTips: () => Promise<any>;
  getHederaNews: () => Promise<any>;
}

export const api: APIService = {
  async getWalletBalance(privateKey: string) {
    const response = await fetch(`${API_BASE_URL}/wallet/balance?private_key=${encodeURIComponent(privateKey)}`);
    return response.json();
  },

  async sendEth(fromKey: string, to: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/wallet/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_key: fromKey, to, amount }),
    });
    return response.json();
  },

  async getHederaBalance() {
    const response = await fetch(`${API_BASE_URL}/hedera/account/balance`);
    return response.json();
  },

  async transferHbar(fromPrivateKey: string, toAccountId: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/hedera/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_private_key: fromPrivateKey, to_account_id: toAccountId, amount }),
    });
    return response.json();
  },

  async queryAI(question: string) {
    const response = await fetch(`${API_BASE_URL}/llm/query?q=${encodeURIComponent(question)}`);
    return response.json();
  },

  async getCryptoNews() {
    const response = await fetch(`${API_BASE_URL}/llm/news`);
    return response.json();
  },

  async checkTokenSecurity(tokenAddress: string) {
    const response = await fetch(`${API_BASE_URL}/llm/checktoken?token_address=${encodeURIComponent(tokenAddress)}`);
    return response.json();
  },

  async getWalletSummary(address: string, balance: number) {
    const response = await fetch(`${API_BASE_URL}/llm/wallet-summary?address=${encodeURIComponent(address)}&balance=${balance}`);
    return response.json();
  },

  async getAIBalances() {
    const response = await fetch(`${API_BASE_URL}/ai/balances`);
    return response.json();
  },

  async setEmailReminder(data) {
    const response = await fetch(`${API_BASE_URL}/ai/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async processAIInput(data) {
    const response = await fetch(`${API_BASE_URL}/process-ai-input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getExpenses() {
    const response = await fetch(`${API_BASE_URL}/get-expenses`);
    return response.json();
  },

  async getInsights() {
    const response = await fetch(`${API_BASE_URL}/get-insights`);
    return response.json();
  },

  async login(data) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getHederaTransactions() {
    const response = await fetch(`${API_BASE_URL}/hedera/transactions`);
    return response.json();
  },

  async getHederaTips() {
    const response = await fetch(`${API_BASE_URL}/hedera/tips`);
    return response.json();
  },

  async getHederaNews() {
    const response = await fetch(`${API_BASE_URL}/hedera/news`);
    return response.json();
  },
};