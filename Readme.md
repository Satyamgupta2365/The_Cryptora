# 🚀 Cryptona - Multi-Chain AI-Powered Crypto Manager

## 🎯 Project Title
**Cryptona** - Advanced Multi-Chain Cryptocurrency Wallet Management with AI Integration

## 💡 One-Sentence Elevator Pitch
Cryptona is an AI-powered multi-chain cryptocurrency portfolio and Wallet manager that connects to Ethereum, Polygon, BSC, Arbitrum, and Hedera networks, allowing users to manage multiple wallets, analyze tokens for security risks, and receive intelligent investment insights through a Model Context Protocol (MCP) interface.

## 📋 Detailed Project Description

### Overview
Cryptona revolutionizes cryptocurrency portfolio management by providing a unified interface for managing assets across multiple blockchain networks. The project combines traditional wallet functionality with AI-powered analysis and security features, making it easier for users to track, manage, and secure their crypto investments.

<img width="500" height="500" alt="Image" src="https://github.com/user-attachments/assets/31a19e1b-cea2-4275-9a52-81a5fc8f738d" />

### Watch demo 
https://youtu.be/AF6KlyFQb4s

### Key Features

#### 🔗 Multi-Chain Wallet Support
- **Ethereum Mainnet** - Native ETH and ERC-20 token support
- **Polygon Network** - MATIC and Polygon-based tokens
- **BSC (Binance Smart Chain)** - BNB and BEP-20 tokens
- **Arbitrum Network** - Layer 2 scaling for Ethereum
- **Hedera Hashgraph** - HBAR and Hedera ecosystem tokens

#### 🤖 AI-Powered Features
- **Portfolio Analysis** - LLaMA 3.1 powered insights via Groq
- **Token Security Analysis** - AI-driven scam detection
- **Investment Recommendations** - Personalized advice based on portfolio
- **Real-time News Integration** - Latest crypto news and Hedera updates
- **Market Intelligence** - Price tracking and conversion tools

#### 🛡️ Security Features
- **Token Security Analyzer** - Detect honeypots, rug pulls, and suspicious contracts
- **Private Key Management** - Secure local storage and handling
- **Transaction Validation** - Multi-layer verification before sending
- **Risk Assessment** - AI-powered risk scoring for tokens and transactions

#### 🎯 Model Context Protocol (MCP) Integration
- **Multi-Wallet AI Control** - Unique MCP implementation controlling 4+ wallets simultaneously
- **25+ AI Tools** - Comprehensive toolkit for crypto management
- **Natural Language Interface** - Interact with wallets using plain English
- **Cross-Chain Operations** - Seamless management across different networks

### Technology Stack

#### Backend
- **FastAPI** - High-performance Python web framework
- **Web3.py** - Ethereum and EVM chain interactions
- **Groq API** - LLaMA 3.1 model for AI features
- **Hedera SDK** - Hedera network integration
- **SQLite/PostgreSQL** - Data persistence
- **CORS Middleware** - Cross-origin resource sharing

#### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

#### AI & Analytics
- **Groq (LLaMA 3.1-8B)** - Natural language processing
- **Model Context Protocol (MCP)** - AI-blockchain interface
- **CoinGecko API** - Real-time price data
- **Custom Security Algorithms** - Token risk assessment

## 🚀 Installation Steps

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- Git

### Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/cryptona.git
   cd cryptona
   ```

2. **Create Python Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Required Packages**
   ```bash
   pip install fastapi uvicorn python-dotenv groq web3 requests nacl hashlib
   pip install mcp  # For MCP server functionality
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend  # Adjust path as needed
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Additional Packages**
   ```bash
   npm install framer-motion lucide-react recharts
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Hedera Network Configuration
HEDERA_BASE_URL=https://mainnet-public.mirrornode.hedera.com/api/v1
HEDERA_ACCOUNT_ID=0.0.your_account_id
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_PUBLIC_KEY=your_hedera_public_key
HEDERA_API_KEY=your_hedera_api_key_optional

# Ethereum/EVM Networks (Optional - defaults provided)
QUICKNODE_URL=https://your-quicknode-endpoint
POLYGON_URL=https://polygon-rpc.com
BSC_URL=https://bsc-dataseed1.binance.org
ARBITRUM_URL=https://arb1.arbitrum.io/rpc

# Security (for production)
SECRET_KEY=your_secret_key_here
DEBUG=False
```

### Required API Keys

1. **Groq API Key**
   - Sign up at [console.groq.com](https://console.groq.com)
   - Create a new API key
   - Add to `GROQ_API_KEY`

2. **Hedera Account**
   - Create account on Hedera network
   - Get account ID and private key
   - Add to respective environment variables

3. **QuickNode (Optional)**
   - Sign up for Ethereum node access
   - Add endpoint to `QUICKNODE_URL`

## 💻 Usage Examples

### 1. Running the Application

#### Start Backend Server
```bash
# Activate virtual environment
source venv/bin/activate

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Development Server
```bash
# In frontend directory
npm start
# or
yarn start
```

#### Start MCP Server
```bash
# Run the MCP server for AI integration
python mcp.py
```

### 2. API Usage Examples

#### Get Wallet Balance
```bash
curl "http://localhost:8000/wallet/balance?private_key=your_private_key"
```

#### Check Token Security
```bash
curl "http://localhost:8000/llm/checktoken?token_address=0x..."
```

#### Get Hedera Balance
```bash
curl "http://localhost:8000/hedera/account/balance"
```

#### AI Query Example
```bash
curl "http://localhost:8000/llm/query?q=What are the best DeFi strategies for 2024?"
```

### 3. Frontend Features

#### Portfolio Overview
- View all wallet balances across networks
- Real-time USD value calculations
- Token holdings breakdown
- Copy addresses with one click

#### Hedera Integration
- Check HBAR balance
- Send HBAR transactions
- View transaction history
- Get Hedera-specific tips and news

#### Token Security Analyzer
- Paste token contract address
- Get AI-powered security analysis
- View known risky tokens
- Security best practices

### 4. MCP Integration

#### Connect AI Assistant
```python
# Example MCP tool usage
await mcp_server.call_tool("add_wallet", {
    "wallet_name": "main_wallet",
    "private_key": "your_private_key",
    "wallet_type": "ethereum"
})

await mcp_server.call_tool("get_portfolio_overview", {})

await mcp_server.call_tool("analyze_wallet", {
    "wallet_name": "main_wallet"
})
```

## 🐛 Known Issues

### Current Limitations

1. **Hedera SDK Integration**
   - Currently using placeholder implementation
   - Real Hedera transactions need full SDK integration
   - Transaction signing needs proper implementation

2. **MetaMask Integration**
   - Frontend shows MetaMask wallet but backend integration pending
   - Direct MetaMask connection not implemented
   - Cross-chain transfers are simulated

3. **Price Data Accuracy**
   - CoinGecko API has rate limits
   - Some token prices may not be available
   - USD calculations are estimates

4. **Transaction History**
   - Currently stored in localStorage (frontend only)
   - No persistent backend storage implemented
   - Limited to browser session

5. **Error Handling**
   - Network timeouts not fully handled
   - Some API errors need better user feedback
   - Recovery mechanisms need improvement

### Security Considerations

1. **Private Key Storage**
   - Currently handled in memory only
   - Production needs secure key management
   - Consider hardware wallet integration

2. **API Key Exposure**
   - Ensure `.env` is in `.gitignore`
   - Use environment-specific configurations
   - Rotate keys regularly

### Performance Issues

1. **Multi-Chain Queries**
   - Parallel API calls can be slow
   - Consider implementing caching
   - Rate limiting on external APIs

2. **Frontend Loading**
   - Initial portfolio load can be slow
   - Need loading states for better UX
   - Consider lazy loading components

### Planned Improvements

1. **Database Integration**
   - Persistent transaction history
   - User preferences storage
   - Portfolio analytics over time

2. **Enhanced Security**
   - Multi-factor authentication
   - Hardware wallet support
   - Advanced scam detection algorithms

3. **Mobile Responsiveness**
   - Optimize for mobile devices
   - Touch-friendly interactions
   - Progressive Web App (PWA) features

4. **Additional Networks**
   - Solana integration
   - Avalanche support
   - Cosmos ecosystem

## 📈 Future Roadmap

- [ ] Full Hedera SDK integration
- [ ] Real-time WebSocket price feeds
- [ ] Advanced portfolio analytics
- [ ] Mobile application
- [ ] Hardware wallet support
- [ ] DeFi protocol integrations
- [ ] Social trading features
- [ ] Advanced AI trading strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq** for LLaMA 3.1 API access
- **Hedera Hashgraph** for innovative consensus technology
- **Web3.py** community for blockchain integration tools
- **React** team for the amazing frontend framework
- **FastAPI** for the high-performance backend framework
