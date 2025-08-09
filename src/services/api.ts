const API_BASE_URL = 'http://localhost:8000';

export const api = {
  async getWalletBalance(privateKey: string) {
    const response = await fetch(`${API_BASE_URL}/wallet/balance?private_key=${encodeURIComponent(privateKey)}`);
    return response.json();
  },

  async sendEth(fromKey: string, to: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/wallet/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_key: fromKey, to, amount })
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
      body: JSON.stringify({ from_private_key: fromPrivateKey, to_account_id: toAccountId, amount })
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

  async setEmailReminder(data: { email: string; condition: string; threshold?: number; currentBalances: any }) {
    const response = await fetch(`${API_BASE_URL}/ai/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};