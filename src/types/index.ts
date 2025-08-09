export interface WalletBalance {
  address: string;
  ethereum: {
    balance_eth: number;
    network: string;
  };
  polygon: {
    balance_matic: number;
    network: string;
    token_balances: Record<string, number>;
  };
  arbitrum: {
    balance_eth: number;
    network: string;
    token_balances: Record<string, number>;
  };
  bsc: {
    balance_bnb: number;
    network: string;
    token_balances: Record<string, number>;
  };
  total_usd_value: number;
  private_key_provided: boolean;
}

export interface HederaBalance {
  account_id: string;
  balance: number;
}

export interface TransferResult {
  status: string;
  transaction_id?: string;
  error?: string;
}

export interface AIResponse {
  response: string;
}

export interface TokenSecurity {
  security_analysis: string;
}