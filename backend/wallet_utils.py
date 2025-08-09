from web3 import Web3
import requests

# Public Ethereum Mainnet endpoint (for testing)
QUICKNODE_URL = "https://eth.llamarpc.com"

# Your QuickNode mainnet endpoint (uncomment when working)
# QUICKNODE_URL = "https://cold-sparkling-sunset.quiknode.pro/4a8ab41a7b661f4427e234d8d18541a848ae3064"

# Polygon network endpoint
POLYGON_URL = "https://polygon-rpc.com"

# BSC network endpoint
BSC_URL = "https://bsc-dataseed1.binance.org"

# Arbitrum network endpoint
ARBITRUM_URL = "https://arb1.arbitrum.io/rpc"

web3 = Web3(Web3.HTTPProvider(QUICKNODE_URL))
polygon_web3 = Web3(Web3.HTTPProvider(POLYGON_URL))
bsc_web3 = Web3(Web3.HTTPProvider(BSC_URL))
arbitrum_web3 = Web3(Web3.HTTPProvider(ARBITRUM_URL))

def get_address_from_private_key(private_key: str) -> str:
    """Derive wallet address from private key"""
    try:
        # Remove 0x prefix if present
        if private_key.startswith('0x'):
            private_key = private_key[2:]
        
        # Validate private key length (should be 64 hex characters)
        if len(private_key) != 64:
            print(f"Invalid private key length: {len(private_key)} characters (should be 64)")
            return ""
            
        # Validate that it's all hex characters
        try:
            int(private_key, 16)
        except ValueError:
            print("Invalid private key: must contain only hexadecimal characters")
            return ""
            
        # Create account from private key
        account = web3.eth.account.from_key(private_key)
        return account.address
    except Exception as e:
        print(f"Error deriving address from private key: {e}")
        return ""

def get_eth_balance(wallet_address: str) -> float:
    try:
        # Check if connected to the network
        if not web3.is_connected():
            print("Failed to connect to Ethereum network")
            return -1
            
        # Validate the address format
        if not web3.is_address(wallet_address):
            print(f"Invalid wallet address format: {wallet_address}")
            print("Ethereum addresses must be 42 characters long (0x + 40 hex chars)")
            return -1
            
        # Convert to checksum address
        checksum_address = web3.to_checksum_address(wallet_address)
        
        # Get balance in Wei
        balance_wei = web3.eth.get_balance(checksum_address)
        
        # Convert to ETH
        balance_eth = web3.from_wei(balance_wei, 'ether')
        return float(balance_eth)
    except Exception as e:
        print(f"Error getting balance: {e}")
        return -1

def get_token_balance(wallet_address: str, token_address: str) -> dict:
    """Get ERC-20 token balance"""
    try:
        # ERC-20 token ABI (just the balanceOf function)
        token_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        # Create contract instance
        token_contract = web3.eth.contract(address=token_address, abi=token_abi)
        
        # Get balance
        balance = token_contract.functions.balanceOf(wallet_address).call()
        
        return {
            "token_address": token_address,
            "balance": balance,
            "success": True
        }
    except Exception as e:
        return {
            "token_address": token_address,
            "error": str(e),
            "success": False
        }

def get_polygon_balance(wallet_address: str) -> float:
    """Get MATIC balance on Polygon network"""
    try:
        # Check if connected to Polygon network
        if not polygon_web3.is_connected():
            print("Failed to connect to Polygon network")
            return -1
            
        # Validate the address format
        if not polygon_web3.is_address(wallet_address):
            print(f"Invalid wallet address format: {wallet_address}")
            return -1
            
        # Convert to checksum address
        checksum_address = polygon_web3.to_checksum_address(wallet_address)
        
        # Get balance in Wei
        balance_wei = polygon_web3.eth.get_balance(checksum_address)
        
        # Convert to MATIC
        balance_matic = polygon_web3.from_wei(balance_wei, 'ether')
        return float(balance_matic)
    except Exception as e:
        print(f"Error getting Polygon balance: {e}")
        return -1

def get_polygon_token_balance(wallet_address: str, token_address: str) -> dict:
    """Get ERC-20 token balance on Polygon"""
    try:
        # ERC-20 token ABI (just the balanceOf function)
        token_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        # Create contract instance
        token_contract = polygon_web3.eth.contract(address=token_address, abi=token_abi)
        
        # Get balance
        balance = token_contract.functions.balanceOf(wallet_address).call()
        
        return {
            "token_address": token_address,
            "balance": balance,
            "success": True
        }
    except Exception as e:
        return {
            "token_address": token_address,
            "error": str(e),
            "success": False
        }

def get_bsc_balance(wallet_address: str) -> float:
    """Get BNB balance on BSC network"""
    try:
        # Check if connected to BSC network
        if not bsc_web3.is_connected():
            print("Failed to connect to BSC network")
            return -1
            
        # Validate the address format
        if not bsc_web3.is_address(wallet_address):
            print(f"Invalid wallet address format: {wallet_address}")
            return -1
            
        # Convert to checksum address
        checksum_address = bsc_web3.to_checksum_address(wallet_address)
        
        # Get balance in Wei
        balance_wei = bsc_web3.eth.get_balance(checksum_address)
        
        # Convert to BNB
        balance_bnb = bsc_web3.from_wei(balance_wei, 'ether')
        return float(balance_bnb)
    except Exception as e:
        print(f"Error getting BSC balance: {e}")
        return -1

def get_bsc_token_balance(wallet_address: str, token_address: str) -> dict:
    """Get BEP-20 token balance on BSC"""
    try:
        # BEP-20 token ABI (same as ERC-20)
        token_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        # Create contract instance
        token_contract = bsc_web3.eth.contract(address=token_address, abi=token_abi)
        
        # Get balance
        balance = token_contract.functions.balanceOf(wallet_address).call()
        
        return {
            "token_address": token_address,
            "balance": balance,
            "success": True
        }
    except Exception as e:
        return {
            "token_address": token_address,
            "error": str(e),
            "success": False
        }

def get_arbitrum_balance(wallet_address: str) -> float:
    """Get ETH balance on Arbitrum network"""
    try:
        # Check if connected to Arbitrum network
        if not arbitrum_web3.is_connected():
            print("Failed to connect to Arbitrum network")
            return -1
            
        # Validate the address format
        if not arbitrum_web3.is_address(wallet_address):
            print(f"Invalid wallet address format: {wallet_address}")
            return -1
            
        # Convert to checksum address
        checksum_address = arbitrum_web3.to_checksum_address(wallet_address)
        
        # Get balance in Wei
        balance_wei = arbitrum_web3.eth.get_balance(checksum_address)
        
        # Convert to ETH
        balance_eth = arbitrum_web3.from_wei(balance_wei, 'ether')
        return float(balance_eth)
    except Exception as e:
        print(f"Error getting Arbitrum balance: {e}")
        return -1

def get_arbitrum_token_balance(wallet_address: str, token_address: str) -> dict:
    """Get ERC-20 token balance on Arbitrum"""
    try:
        # ERC-20 token ABI (same as Ethereum)
        token_abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        # Create contract instance
        token_contract = arbitrum_web3.eth.contract(address=token_address, abi=token_abi)
        
        # Get balance
        balance = token_contract.functions.balanceOf(wallet_address).call()
        
        return {
            "token_address": token_address,
            "balance": balance,
            "success": True
        }
    except Exception as e:
        return {
            "token_address": token_address,
            "error": str(e),
            "success": False
        }

def get_token_price(token_symbol: str) -> float:
    """Get token price in USD from CoinGecko API"""
    try:
        # CoinGecko API endpoint
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={token_symbol}&vs_currencies=usd"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if token_symbol in data and 'usd' in data[token_symbol]:
                return data[token_symbol]['usd']
        return 0
    except Exception as e:
        print(f"Error getting {token_symbol} price: {e}")
        return 0

def get_balance_from_private_key(private_key: str) -> dict:
    """Get wallet balance using private key"""
    try:
        # Validate private key format
        if not private_key or len(private_key) < 64:
            return {
                "error": f"Invalid private key length: {len(private_key)} characters (should be 64 or 66 with 0x prefix)",
                "balance_eth": -1
            }
        
        # Derive address from private key
        address = get_address_from_private_key(private_key)
        if not address:
            return {
                "error": "Failed to derive address from private key. Please check the private key format.",
                "balance_eth": -1
            }
        
        # Get ETH balance on Ethereum mainnet
        eth_balance = get_eth_balance(address)
        
        # Get MATIC balance on Polygon
        matic_balance = get_polygon_balance(address)
        
        # Get BSC balance on BSC
        bsc_balance = get_bsc_balance(address)
        
        # Get Arbitrum balance
        arbitrum_balance = get_arbitrum_balance(address)
        
        # Check for common Polygon tokens (expanded list)
        polygon_tokens = {
            "USDC": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC on Polygon
            "USDT": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",  # USDT on Polygon
            "DAI": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",   # DAI on Polygon
            "WETH": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",  # Wrapped ETH on Polygon
            "WBTC": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",  # Wrapped Bitcoin on Polygon
            "AAVE": "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",  # AAVE on Polygon
            "CRV": "0x172370d5Cd63279eFa6d502DAB29171933a610AF",   # CRV on Polygon
            "LINK": "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",  # LINK on Polygon
            "UNI": "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",   # UNI on Polygon
            "SUSHI": "0x0b3F868E0BE5597D5DB7fEBbE9e4c5e4440C5b7a",  # SUSHI on Polygon
            "COMP": "0x8505b9d2254A7Ae468c0E9dd10Cea3A837aef5dc",  # COMP on Polygon
            "YFI": "0xDA537104D6A5edd53c6fBba9A898708E465260b6",   # YFI on Polygon
            "SNX": "0x50B728D8D964fd00C2d0AAD81718b71311feF68a",   # SNX on Polygon
            "BAL": "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3",   # BAL on Polygon
            "REN": "0x0A3A18Fc912882E0B8c353db795F37f0B3943Fc3"   # REN on Polygon
        }
        
        # Check for common Arbitrum tokens
        arbitrum_tokens = {
            "USDC": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",  # USDC on Arbitrum
            "USDT": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",  # USDT on Arbitrum
            "DAI": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",   # DAI on Arbitrum
            "WETH": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",  # WETH on Arbitrum
            "WBTC": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",  # WBTC on Arbitrum
            "LINK": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",  # LINK on Arbitrum
            "UNI": "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",   # UNI on Arbitrum
            "AAVE": "0xba5DdD1F9d7F570dc94a51479a000E3BCE967196",  # AAVE on Arbitrum
            "CRV": "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",   # CRV on Arbitrum
            "SUSHI": "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A"  # SUSHI on Arbitrum
        }
        
        polygon_token_balances = {}
        arbitrum_token_balances = {}
        total_usd_value = 0
        
        # Check Polygon tokens
        for token_name, token_address in polygon_tokens.items():
            token_result = get_polygon_token_balance(address, token_address)
            if token_result["success"] and token_result["balance"] > 0:
                # Convert from wei to token units
                if token_name in ["USDC", "USDT"]:
                    decimals = 6
                elif token_name == "WBTC":
                    decimals = 8
                else:
                    decimals = 18
                    
                token_balance = token_result["balance"] / (10 ** decimals)
                polygon_token_balances[token_name] = token_balance
                
                # Calculate USD value
                if token_name in ["USDC", "USDT", "DAI"]:
                    usd_value = token_balance  # 1:1 with USD
                else:
                    # Get price from CoinGecko
                    price = get_token_price(token_name.lower())
                    usd_value = token_balance * price
                
                total_usd_value += usd_value
        
        # Check Arbitrum tokens
        for token_name, token_address in arbitrum_tokens.items():
            token_result = get_arbitrum_token_balance(address, token_address)
            if token_result["success"] and token_result["balance"] > 0:
                # Convert from wei to token units
                if token_name in ["USDC", "USDT"]:
                    decimals = 6
                elif token_name == "WBTC":
                    decimals = 8
                else:
                    decimals = 18
                    
                token_balance = token_result["balance"] / (10 ** decimals)
                arbitrum_token_balances[token_name] = token_balance
                
                # Calculate USD value
                if token_name in ["USDC", "USDT", "DAI"]:
                    usd_value = token_balance  # 1:1 with USD
                else:
                    # Get price from CoinGecko
                    price = get_token_price(token_name.lower())
                    usd_value = token_balance * price
                
                total_usd_value += usd_value
        
        # Add MATIC value if any
        if matic_balance > 0:
            matic_price = get_token_price("matic-network")
            total_usd_value += matic_balance * matic_price
        
        # Add Arbitrum ETH value if any
        if arbitrum_balance > 0:
            eth_price = get_token_price("ethereum")
            total_usd_value += arbitrum_balance * eth_price
        
        # Check for common BSC tokens
        bsc_tokens = {
            "USDC": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",  # USDC on BSC
            "USDT": "0x55d398326f99059fF775485246999027B3197955",  # USDT on BSC
            "BUSD": "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",  # BUSD on BSC
            "CAKE": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",  # CAKE on BSC
            "WBNB": "0xbb4CdB9CBd36B01bD1cBaEF60aF814a3f6F0Ee75"   # Wrapped BNB on BSC
        }
        
        bsc_token_balances = {}
        for token_name, token_address in bsc_tokens.items():
            token_result = get_bsc_token_balance(address, token_address)
            if token_result["success"] and token_result["balance"] > 0:
                # Convert from wei to token units
                if token_name in ["USDC", "USDT", "BUSD"]:
                    decimals = 18  # BSC tokens use 18 decimals
                else:
                    decimals = 18
                    
                token_balance = token_result["balance"] / (10 ** decimals)
                bsc_token_balances[token_name] = token_balance
                
                # Calculate USD value
                if token_name in ["USDC", "USDT", "BUSD"]:
                    usd_value = token_balance  # 1:1 with USD
                else:
                    # Get price from CoinGecko
                    price = get_token_price(token_name.lower())
                    usd_value = token_balance * price
                
                total_usd_value += usd_value
        
        # Add BNB value if any
        if bsc_balance > 0:
            bnb_price = get_token_price("binancecoin")
            total_usd_value += bsc_balance * bnb_price
        
        return {
            "address": address,
            "ethereum": {
                "balance_eth": eth_balance,
                "network": "Ethereum Mainnet"
            },
            "polygon": {
                "balance_matic": matic_balance,
                "network": "Polygon Mainnet",
                "token_balances": polygon_token_balances
            },
            "arbitrum": {
                "balance_eth": arbitrum_balance,
                "network": "Arbitrum One",
                "token_balances": arbitrum_token_balances
            },
            "bsc": {
                "balance_bnb": bsc_balance,
                "network": "BSC Mainnet",
                "token_balances": bsc_token_balances
            },
            "total_usd_value": round(total_usd_value, 2),
            "private_key_provided": True
        }
    except Exception as e:
        return {
            "error": str(e),
            "balance_eth": -1
        }

def send_eth(from_key: str, to_address: str, amount_eth: float) -> str:
    try:
        acct = web3.eth.account.from_key(from_key)
        nonce = web3.eth.get_transaction_count(acct.address)
        tx = {
            'nonce': nonce,
            'to': to_address,
            'value': web3.to_wei(amount_eth, 'ether'),
            'gas': 21000,
            'gasPrice': web3.to_wei('50', 'gwei')
        }
        signed_tx = acct.sign_transaction(tx)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return web3.to_hex(tx_hash)
    except Exception as e:
        return str(e)
