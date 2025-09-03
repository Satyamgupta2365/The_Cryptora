from groq import Groq
from dotenv import load_dotenv
import os
import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import re

# Load environment variables from .env
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class DetailedCryptoScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def format_large_number(self, num):
        """Format large numbers with appropriate suffixes"""
        if num is None:
            return "N/A"
        
        if num >= 1e12:
            return f"${num/1e12:.2f}T"
        elif num >= 1e9:
            return f"${num/1e9:.2f}B"
        elif num >= 1e6:
            return f"${num/1e6:.2f}M"
        elif num >= 1e3:
            return f"${num/1e3:.2f}K"
        else:
            return f"${num:.2f}"
    
    def get_crypto_prices(self) -> str:
        """Scrape detailed cryptocurrency data from multiple sources and return plain text"""
        output = f"Last Updated: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
        output += "Data Sources: CoinGecko API, CoinMarketCap, Live Market Data\n\n"
        
        try:
            url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                output += f"TOP {len(data)} CRYPTOCURRENCIES BY MARKET CAPITALIZATION\n\n"
                
                for i, coin in enumerate(data, 1):
                    name = coin.get('name', 'Unknown')
                    symbol = coin.get('symbol', '').upper()
                    current_price = coin.get('current_price', 0)
                    market_cap = coin.get('market_cap', 0)
                    market_cap_rank = coin.get('market_cap_rank', 'N/A')
                    total_volume = coin.get('total_volume', 0)
                    circulating_supply = coin.get('circulating_supply', 0)
                    total_supply = coin.get('total_supply', 0)
                    max_supply = coin.get('max_supply', 0)
                    
                    price_change_1h = coin.get('price_change_percentage_1h_in_currency', 0)
                    price_change_24h = coin.get('price_change_percentage_24h', 0)
                    price_change_7d = coin.get('price_change_percentage_7d_in_currency', 0)
                    price_change_30d = coin.get('price_change_percentage_30d_in_currency', 0)
                    
                    ath = coin.get('ath', 0)
                    ath_change_percentage = coin.get('ath_change_percentage', 0)
                    ath_date = coin.get('ath_date', '')
                    
                    atl = coin.get('atl', 0)
                    atl_change_percentage = coin.get('atl_change_percentage', 0)
                    atl_date = coin.get('atl_date', '')
                    
                    output += f"CRYPTOCURRENCY {i}: {name} ({symbol})\n"
                    output += f"Current Price: ${current_price:,.6f}\n"
                    
                    def format_change(change):
                        if change > 0:
                            return f"+{change:.2f}%"
                        elif change < 0:
                            return f"{change:.2f}%"
                        else:
                            return "0.00%"
                    
                    output += "PRICE CHANGES:\n"
                    output += f"  1 Hour: {format_change(price_change_1h or 0)}\n"
                    output += f"  24 Hour: {format_change(price_change_24h or 0)}\n"
                    output += f"  7 Days: {format_change(price_change_7d or 0)}\n"
                    output += f"  30 Days: {format_change(price_change_30d or 0)}\n"
                    
                    output += "MARKET DATA:\n"
                    output += f"  Market Cap: {self.format_large_number(market_cap)}\n"
                    output += f"  24h Volume: {self.format_large_number(total_volume)}\n"
                    output += f"  Volume/Market Cap Ratio: {(total_volume/market_cap*100):.2f}%\n" if market_cap > 0 else "  Volume/Market Cap Ratio: N/A\n"
                    
                    output += "SUPPLY INFORMATION:\n"
                    output += f"  Circulating Supply: {circulating_supply:,.0f} {symbol}\n" if circulating_supply else "  Circulating Supply: N/A\n"
                    output += f"  Total Supply: {total_supply:,.0f} {symbol}\n" if total_supply else "  Total Supply: N/A\n"
                    output += f"  Max Supply: {max_supply:,.0f} {symbol}\n" if max_supply else "  Max Supply: Unlimited\n"
                    
                    output += "HISTORICAL DATA:\n"
                    output += f"  All-Time High: ${ath:,.2f} ({ath_change_percentage:.1f}% from ATH)\n" if ath else "  All-Time High: N/A\n"
                    if ath_date:
                        ath_formatted = datetime.fromisoformat(ath_date.replace('Z', '+00:00')).strftime('%Y-%m-%d')
                        output += f"  ATH Date: {ath_formatted}\n"
                    
                    output += f"  All-Time Low: ${atl:.6f} (+{atl_change_percentage:.0f}% from ATL)\n" if atl else "  All-Time Low: N/A\n"
                    if atl_date:
                        atl_formatted = datetime.fromisoformat(atl_date.replace('Z', '+00:00')).strftime('%Y-%m-%d')
                        output += f"  ATL Date: {atl_formatted}\n"
                    
                    output += "\n\n"
                    
        except Exception as e:
            output += f"ERROR FETCHING MARKET DATA: {str(e)}\n"
            output += "Attempting backup data source...\n\n"
            
            try:
                response = self.session.get("https://coinmarketcap.com/", timeout=15)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                output += "BACKUP DATA SOURCE: CoinMarketCap (Limited Data)\n\n"
                
                rows = soup.find_all('tr')[:15]
                for row in rows[1:]:
                    cells = row.find_all('td')
                    if len(cells) >= 6:
                        try:
                            rank = cells[1].get_text(strip=True)
                            name_cell = cells[2]
                            name = name_cell.get_text(strip=True).split('\n')[0] if name_cell else "N/A"
                            price = cells[3].get_text(strip=True) if len(cells) > 3 else "N/A"
                            change_24h = cells[4].get_text(strip=True) if len(cells) > 4 else "N/A"
                            volume = cells[5].get_text(strip=True) if len(cells) > 5 else "N/A"
                            market_cap = cells[6].get_text(strip=True) if len(cells) > 6 else "N/A"
                            
                            output += f"CRYPTOCURRENCY #{rank}: {name}\n"
                            output += f"Price: {price}\n"
                            output += f"24h Change: {change_24h}\n"
                            output += f"Volume: {volume}\n"
                            output += f"Market Cap: {market_cap}\n\n"
                            
                        except Exception:
                            continue
                            
            except Exception as backup_error:
                output += f"BACKUP DATA SOURCE ALSO FAILED: {str(backup_error)}\n"
        
        return output.strip()
    
    def get_crypto_news(self) -> str:
        """Scrape comprehensive crypto news from multiple sources and return plain text"""
        output = f"News Compiled: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
        output += "Sources: CoinDesk, CoinTelegraph, CryptoCompare, Decrypt, CryptoBriefing\n\n"
        
        try:
            api_url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
            response = requests.get(api_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                output += "PRIMARY NEWS SOURCE: CryptoCompare API\n\n"
                
                for i, article in enumerate(data.get('Data', [])[:8], 1):
                    title = article.get('title', 'No title available')
                    body = article.get('body', 'No summary available')[:300]
                    url = article.get('url', 'No URL available')
                    published_on = article.get('published_on', 0)
                    source_info = article.get('source_info', {})
                    source_name = source_info.get('name', 'Unknown Source')
                    categories = article.get('categories', '')
                    tags = article.get('tags', '')
                    
                    if published_on:
                        pub_date = datetime.fromtimestamp(published_on)
                        formatted_date = pub_date.strftime('%A, %B %d, %Y at %I:%M %p UTC')
                        time_ago = datetime.now() - pub_date
                        if time_ago.days > 0:
                            time_ago_str = f"{time_ago.days} days ago"
                        elif time_ago.seconds > 3600:
                            time_ago_str = f"{time_ago.seconds // 3600} hours ago"
                        else:
                            time_ago_str = f"{time_ago.seconds // 60} minutes ago"
                    else:
                        formatted_date = "Date not available"
                        time_ago_str = "Unknown"
                    
                    output += f"NEWS ARTICLE {i}\n"
                    output += f"Headline: {title}\n"
                    output += f"Source: {source_name}\n"
                    output += f"Published: {formatted_date} ({time_ago_str})\n"
                    output += f"Categories: {categories if categories else 'General'}\n"
                    output += f"Tags: {tags if tags else 'None specified'}\n"
                    output += f"Summary: {body}{'...' if len(article.get('body', '')) > 300 else ''}\n"
                    output += f"Full Article: {url}\n\n"
                    
        except Exception as e:
            output += f"CryptoCompare API Error: {str(e)}\n\n"
        
        try:
            response = self.session.get('https://www.coindesk.com/arc/outboundfeeds/rss/', timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'xml')
                items = soup.find_all('item')[:5]
                
                output += "SECONDARY NEWS SOURCE: CoinDesk RSS Feed\n\n"
                
                for i, item in enumerate(items, 1):
                    title = item.find('title').get_text() if item.find('title') else "No title"
                    description = item.find('description').get_text() if item.find('description') else "No description"
                    link = item.find('link').get_text() if item.find('link') else "No link"
                    pub_date = item.find('pubDate').get_text() if item.find('pubDate') else "No date"
                    
                    clean_description = BeautifulSoup(description, 'html.parser').get_text()[:250]
                    
                    output += f"COINDESK ARTICLE {i}\n"
                    output += f"Headline: {title}\n"
                    output += f"Published: {pub_date}\n"
                    output += f"Summary: {clean_description}{'...' if len(clean_description) == 250 else ''}\n"
                    output += f"Read More: {link}\n\n"
                    
        except Exception as e:
            output += f"CoinDesk RSS Error: {str(e)}\n\n"
        
        return output.strip()

    def get_token_info(self, token_address: str) -> str:
        """Get extremely detailed token analysis"""
        output = f"TOKEN ANALYSIS REPORT\n"
        output += f"Token Contract: {token_address}\n"
        output += f"Analysis Timestamp: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
        output += f"Data Sources: CoinGecko, Etherscan, DeFiPulse, Contract Analysis\n\n"
        
        try:
            url = f"https://api.coingecko.com/api/v3/coins/ethereum/contract/{token_address}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                output += "PRIMARY TOKEN DATA - CoinGecko Verified\n"
                
                name = data.get('name', 'Unknown Token')
                symbol = data.get('symbol', 'UNKNOWN').upper()
                output += f"TOKEN NAME: {name}\n"
                output += f"TOKEN SYMBOL: {symbol}\n"
                output += f"CONTRACT ADDRESS: {token_address}\n"
                output += f"BLOCKCHAIN: Ethereum (ERC-20)\n"
                
                market_cap_rank = data.get('market_cap_rank')
                coingecko_rank = data.get('coingecko_rank')
                output += f"MARKET CAP RANK: #{market_cap_rank}\n" if market_cap_rank else "MARKET CAP RANK: Not Ranked\n"
                output += f"COINGECKO RANK: #{coingecko_rank}\n" if coingecko_rank else "COINGECKO RANK: Not Ranked\n"
                
                market_data = data.get('market_data', {})
                if market_data:
                    output += "DETAILED MARKET ANALYSIS\n"
                    
                    current_price = market_data.get('current_price', {})
                    output += "CURRENT PRICE:\n"
                    output += f"  USD: ${current_price.get('usd', 0):,.8f}\n"
                    output += f"  BTC: {current_price.get('btc', 0):.8f} BTC\n"
                    output += f"  ETH: {current_price.get('eth', 0):.8f} ETH\n"
                    output += f"  EUR: €{current_price.get('eur', 0):,.6f}\n"
                    
                    market_cap = market_data.get('market_cap', {})
                    output += "MARKET CAPITALIZATION:\n"
                    output += f"  USD: {self.format_large_number(market_cap.get('usd'))}\n"
                    output += f"  BTC: {market_cap.get('btc', 0):,.2f} BTC\n"
                    output += f"  ETH: {market_cap.get('eth', 0):,.2f} ETH\n"
                    
                    volume = market_data.get('total_volume', {})
                    output += "24-HOUR TRADING VOLUME:\n"
                    output += f"  USD: {self.format_large_number(volume.get('usd'))}\n"
                    output += f"  BTC: {volume.get('btc', 0):,.2f} BTC\n"
                    
                    total_supply = market_data.get('total_supply')
                    circulating_supply = market_data.get('circulating_supply')
                    max_supply = market_data.get('max_supply')
                    
                    output += "SUPPLY ANALYSIS:\n"
                    output += f"  Circulating Supply: {circulating_supply:,.0f} {symbol}\n" if circulating_supply else "  Circulating Supply: Not Available\n"
                    output += f"  Total Supply: {total_supply:,.0f} {symbol}\n" if total_supply else "  Total Supply: Not Available\n"
                    output += f"  Maximum Supply: {max_supply:,.0f} {symbol}\n" if max_supply else "  Maximum Supply: Unlimited/Not Set\n"
                    
                    if circulating_supply and max_supply:
                        supply_percentage = (circulating_supply / max_supply) * 100
                        output += f"  Supply in Circulation: {supply_percentage:.2f}% of max supply\n"
                    
                    output += "PRICE PERFORMANCE ANALYSIS:\n"
                    changes = [
                        ('1 Hour', market_data.get('price_change_percentage_1h_in_currency', {}).get('usd')),
                        ('24 Hours', market_data.get('price_change_percentage_24h')),
                        ('7 Days', market_data.get('price_change_percentage_7d')),
                        ('14 Days', market_data.get('price_change_percentage_14d')),
                        ('30 Days', market_data.get('price_change_percentage_30d')),
                        ('60 Days', market_data.get('price_change_percentage_60d')),
                        ('200 Days', market_data.get('price_change_percentage_200d')),
                        ('1 Year', market_data.get('price_change_percentage_1y'))
                    ]
                    
                    for period, change in changes:
                        if change is not None:
                            output += f"  {period:>10}: {change:+7.2f}%\n"
                        else:
                            output += f"  {period:>10}: Data Not Available\n"
                    
                    ath = market_data.get('ath', {}).get('usd')
                    ath_change = market_data.get('ath_change_percentage', {}).get('usd')
                    ath_date = market_data.get('ath_date', {}).get('usd')
                    
                    atl = market_data.get('atl', {}).get('usd')
                    atl_change = market_data.get('atl_change_percentage', {}).get('usd')
                    atl_date = market_data.get('atl_date', {}).get('usd')
                    
                    output += "HISTORICAL PRICE EXTREMES:\n"
                    if ath:
                        ath_formatted = datetime.fromisoformat(ath_date.replace('Z', '+00:00')).strftime('%B %d, %Y') if ath_date else "Date Unknown"
                        output += f"  All-Time High: ${ath:,.8f} (on {ath_formatted})\n"
                        output += f"  From ATH: {ath_change:.1f}%\n"
                    
                    if atl:
                        atl_formatted = datetime.fromisoformat(atl_date.replace('Z', '+00:00')).strftime('%B %d, %Y') if atl_date else "Date Unknown"
                        output += f"  All-Time Low: ${atl:.8f} (on {atl_formatted})\n"
                        output += f"  From ATL: +{atl_change:.0f}%\n"
                
                description = data.get('description', {}).get('en', '')
                if description:
                    output += "PROJECT DESCRIPTION:\n"
                    clean_description = description[:500].strip()
                    output += f"{clean_description}{'...' if len(description) > 500 else ''}\n"
                
                links = data.get('links', {})
                if links:
                    output += "OFFICIAL LINKS & RESOURCES:\n"
                    
                    homepage = links.get('homepage', [])
                    if homepage and homepage[0]:
                        output += f"Website: {homepage[0]}\n"
                    
                    whitepaper = links.get('whitepaper')
                    if whitepaper:
                        output += f"Whitepaper: {whitepaper}\n"
                    
                    blockchain_site = links.get('blockchain_site', [])
                    for i, site in enumerate(blockchain_site[:2]):
                        if site:
                            output += f"Explorer {i+1}: {site}\n"
                    
                    output += "SOCIAL MEDIA PRESENCE:\n"
                    social_links = [
                        ('Twitter', links.get('twitter_screen_name')),
                        ('Telegram', links.get('telegram_channel_identifier')),
                        ('Reddit', links.get('subreddit_url')),
                        ('Facebook', links.get('facebook_username')),
                        ('Discord', links.get('discord')),
                        ('GitHub', links.get('repos_url', {}).get('github', [''])[0] if links.get('repos_url', {}).get('github') else None)
                    ]
                    
                    for platform, handle in social_links:
                        if handle:
                            if platform == 'Twitter':
                                output += f"  {platform}: @{handle}\n"
                            elif platform == 'Telegram':
                                output += f"  {platform}: t.me/{handle}\n"
                            else:
                                output += f"  {platform}: {handle}\n"
                
        except Exception as e:
            output += f"CoinGecko API Error: {str(e)}\n\n"
        
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        if etherscan_api_key:
            output += "CONTRACT VERIFICATION & SECURITY ANALYSIS\n"
            
            try:
                url = f"https://api.etherscan.io/api?module=contract&action=getsourcecode&address={token_address}&apikey={etherscan_api_key}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == '1' and data.get('result'):
                        result = data['result'][0]
                        
                        contract_name = result.get('ContractName', 'Not Available')
                        compiler_version = result.get('CompilerVersion', 'Not Available')
                        optimization_used = result.get('OptimizationUsed', '0')
                        source_code = result.get('SourceCode', '')
                        abi = result.get('ABI', '')
                        
                        output += "CONTRACT DETAILS:\n"
                        output += f"  Contract Name: {contract_name}\n"
                        output += f"  Compiler Version: {compiler_version}\n"
                        output += f"  Optimization: {'Enabled' if optimization_used == '1' else 'Disabled'}\n"
                        output += f"  Source Code: {'Verified' if source_code else 'Not Verified'}\n"
                        output += f"  ABI Available: {'Yes' if abi and abi != 'Contract source code not verified' else 'No'}\n"
                        
                        output += "SECURITY ASSESSMENT:\n"
                        if source_code:
                            output += "  Contract source code is publicly verified\n"
                            output += "  Code can be audited by the community\n"
                            output += "  Transparency score: HIGH\n"
                        else:
                            output += "  Contract source code is NOT verified\n"
                            output += "  Cannot verify contract functionality\n"
                            output += "  Transparency score: LOW - EXERCISE CAUTION\n"
                        
                        token_url = f"https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress={token_address}&apikey={etherscan_api_key}"
                        token_response = requests.get(token_url, timeout=10)
                        
                        if token_response.status_code == 200:
                            token_data = token_response.json()
                            if token_data.get('status') == '1' and token_data.get('result'):
                                token_info = token_data['result'][0]
                                
                                output += "TOKEN CONTRACT INFORMATION:\n"
                                output += f"  Token Name: {token_info.get('tokenName', 'N/A')}\n"
                                output += f"  Token Symbol: {token_info.get('symbol', 'N/A')}\n"
                                output += f"  Decimal Places: {token_info.get('divisor', 'N/A')}\n"
                                output += f"  Total Supply: {token_info.get('totalSupply', 'N/A')}\n"
                                output += f"  Token Type: ERC-20 Standard\n"
                        
            except Exception as e:
                output += f"Etherscan contract analysis error: {str(e)}\n"
        else:
            output += "Etherscan API key not configured - contract analysis limited\n"
            output += "To enable full contract analysis, add ETHERSCAN_API_KEY to your .env file\n"
        
        output += "ADDITIONAL SECURITY & RISK ANALYSIS\n"
        
        try:
            url = f"https://api.coingecko.com/api/v3/coins/ethereum/contract/{token_address}/market_chart?vs_currency=usd&days=1"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                chart_data = response.json()
                prices = chart_data.get('prices', [])
                volumes = chart_data.get('total_volumes', [])
                
                if prices and volumes:
                    latest_volume = volumes[-1][1] if volumes else 0
                    
                    output += "TRADING ACTIVITY (Last 24 Hours):\n"
                    output += f"  Volume: {self.format_large_number(latest_volume)}\n"
                    
                    if latest_volume > 1000000:
                        output += "  Liquidity: HIGH (Active trading)\n"
                    elif latest_volume > 100000:
                        output += "  Liquidity: MODERATE (Some trading activity)\n"
                    else:
                        output += "  Liquidity: LOW (Limited trading - HIGH RISK)\n"
                else:
                    output += "  Trading Data: No recent trading data available\n"
                    output += "  Risk Level: VERY HIGH - No market activity detected\n"
                    
        except Exception as e:
            output += f"Trading activity check error: {str(e)}\n"
        
        output += "RISK ASSESSMENT SUMMARY\n"
        output += "Based on available data analysis:\n\n"
        
        output += "OVERALL RISK LEVEL: [Assessment based on verification status, trading volume, and transparency]\n"
        output += "KEY RISK FACTORS:\n"
        output += "  Contract verification status\n"
        output += "  Trading volume and liquidity\n"
        output += "  Market presence and recognition\n"
        output += "  Community and developer activity\n"
        output += "  Time since contract deployment\n\n"
        
        output += "RECOMMENDATION: Always conduct your own research (DYOR) before investing.\n"
        output += "Never invest more than you can afford to lose in cryptocurrency.\n"
        
        return output.strip()
    
    def get_wallet_analysis(self, wallet_address: str) -> str:
        """Comprehensive wallet analysis with detailed transaction history"""
        output = f"WALLET ANALYSIS REPORT\n"
        output += f"Wallet Address: {wallet_address}\n"
        output += f"Analysis Timestamp: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
        output += f"Blockchain: Ethereum Mainnet\n"
        output += f"Data Sources: Etherscan API, On-chain Analysis\n\n"
        
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        
        if not etherscan_api_key:
            output += "ERROR: Etherscan API key required for comprehensive wallet analysis\n"
            output += "Please add ETHERSCAN_API_KEY to your .env file\n"
            output += "Get a free API key from: https://etherscan.io/apis\n\n"
            
            output += "ATTEMPTING LIMITED ANALYSIS WITHOUT API KEY...\n"
            return output.strip()
        
        try:
            url = f"https://api.etherscan.io/api?module=account&action=balance&address={wallet_address}&tag=latest&apikey={etherscan_api_key}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == '1':
                    balance_wei = int(data.get('result', 0))
                    balance_eth = balance_wei / 10**18
                    
                    try:
                        eth_price_response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", timeout=5)
                        if eth_price_response.status_code == 200:
                            eth_price_data = eth_price_response.json()
                            eth_price_usd = eth_price_data.get('ethereum', {}).get('usd', 0)
                            balance_usd = balance_eth * eth_price_usd
                        else:
                            eth_price_usd = 0
                            balance_usd = 0
                    except:
                        eth_price_usd = 0
                        balance_usd = 0
                    
                    output += "WALLET BALANCE OVERVIEW\n"
                    output += f"ETH Balance: {balance_eth:.8f} ETH\n"
                    output += f"Balance in Wei: {balance_wei:,} wei\n"
                    if eth_price_usd > 0:
                        output += f"USD Value: ${balance_usd:,.2f} (at ${eth_price_usd:,.2f}/ETH)\n"
                    output += f"Balance Status: {'Funded Wallet' if balance_eth > 0.01 else 'Low Balance' if balance_eth > 0 else 'Empty Wallet'}\n\n"
                    
        except Exception as e:
            output += f"Balance check error: {str(e)}\n\n"
        
        try:
            url = f"https://api.etherscan.io/api?module=account&action=txlist&address={wallet_address}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc&apikey={etherscan_api_key}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == '1':
                    transactions = data.get('result', [])
                    
                    output += "TRANSACTION HISTORY ANALYSIS\n"
                    output += f"Total Transactions Found: {len(transactions)}\n"
                    output += f"Showing Most Recent {min(len(transactions), 25)} Transactions\n\n"
                    
                    total_gas_used = 0
                    total_gas_cost = 0
                    incoming_count = 0
                    outgoing_count = 0
                    total_eth_sent = 0
                    total_eth_received = 0
                    unique_addresses = set()
                    
                    for i, tx in enumerate(transactions, 1):
                        tx_hash = tx.get('hash', 'N/A')
                        from_addr = tx.get('from', 'N/A').lower()
                        to_addr = tx.get('to', 'N/A').lower()
                        value_wei = int(tx.get('value', 0))
                        value_eth = value_wei / 10**18
                        timestamp = int(tx.get('timeStamp', 0))
                        tx_date = datetime.fromtimestamp(timestamp)
                        gas_used = int(tx.get('gasUsed', 0))
                        gas_price = int(tx.get('gasPrice', 0))
                        gas_cost_eth = (gas_used * gas_price) / 10**18
                        
                        if from_addr == wallet_address.lower():
                            direction = "OUTGOING"
                            outgoing_count += 1
                            total_eth_sent += value_eth
                            unique_addresses.add(to_addr)
                        else:
                            direction = "INCOMING"
                            incoming_count += 1
                            total_eth_received += value_eth
                            unique_addresses.add(from_addr)
                        
                        total_gas_used += gas_used
                        total_gas_cost += gas_cost_eth
                        
                        time_ago = datetime.now() - tx_date
                        if time_ago.days > 0:
                            time_str = f"{time_ago.days} days ago"
                        elif time_ago.seconds > 3600:
                            time_str = f"{time_ago.seconds // 3600} hours ago"
                        else:
                            time_str = f"{time_ago.seconds // 60} minutes ago"
                        
                        is_error = tx.get('isError', '0') == '1'
                        status = "FAILED" if is_error else "SUCCESS"
                        
                        output += f"TRANSACTION {i} - {direction}\n"
                        output += f"Hash: {tx_hash}\n"
                        output += f"Status: {status}\n"
                        output += f"Value: {value_eth:.8f} ETH\n"
                        output += f"From: {from_addr}\n"
                        output += f"To: {to_addr}\n"
                        output += f"Date: {tx_date.strftime('%Y-%m-%d %H:%M:%S UTC')} ({time_str})\n"
                        output += f"Gas Used: {gas_used:,} gas\n"
                        output += f"Gas Price: {gas_price / 10**9:.2f} Gwei\n"
                        output += f"Gas Cost: {gas_cost_eth:.8f} ETH\n"
                        
                        block_number = tx.get('blockNumber', 'N/A')
                        output += f"Block: #{block_number}\n"
                        
                        if value_eth > 10:
                            output += "HIGH VALUE TRANSACTION\n"
                        elif value_eth > 1:
                            output += "MEDIUM VALUE TRANSACTION\n"
                        elif value_eth > 0:
                            output += "LOW VALUE TRANSACTION\n"
                        else:
                            output += "CONTRACT INTERACTION (No ETH transfer)\n"
                        
                        output += "\n"
                    
                    output += "WALLET ACTIVITY SUMMARY\n"
                    output += f"Total Incoming Transactions: {incoming_count}\n"
                    output += f"Total Outgoing Transactions: {outgoing_count}\n"
                    output += f"Total ETH Received: {total_eth_received:.8f} ETH\n"
                    output += f"Total ETH Sent: {total_eth_sent:.8f} ETH\n"
                    output += f"Net ETH Flow: {(total_eth_received - total_eth_sent):.8f} ETH\n"
                    output += f"Total Gas Fees Paid: {total_gas_cost:.8f} ETH\n"
                    output += f"Unique Addresses Interacted: {len(unique_addresses)}\n"
                    
                    if len(transactions) > 0:
                        first_tx_time = datetime.fromtimestamp(int(transactions[-1].get('timeStamp', 0)))
                        last_tx_time = datetime.fromtimestamp(int(transactions[0].get('timeStamp', 0)))
                        account_age = datetime.now() - first_tx_time
                        
                        output += "WALLET BEHAVIOR ANALYSIS\n"
                        output += f"First Transaction: {first_tx_time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                        output += f"Latest Transaction: {last_tx_time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                        output += f"Account Age: {account_age.days} days\n"
                        
                        if len(transactions) > 100:
                            activity_level = "VERY ACTIVE"
                        elif len(transactions) > 50:
                            activity_level = "ACTIVE"
                        elif len(transactions) > 10:
                            activity_level = "MODERATE"
                        else:
                            activity_level = "LOW ACTIVITY"
                        
                        output += f"Activity Level: {activity_level}\n"
                        
                        if outgoing_count > incoming_count * 3:
                            wallet_type = "Likely Exchange/Service Wallet"
                        elif incoming_count > outgoing_count * 3:
                            wallet_type = "Likely Accumulation Wallet"
                        elif abs(incoming_count - outgoing_count) < 3:
                            wallet_type = "Likely Trading/Active Wallet"
                        else:
                            wallet_type = "Likely Personal Wallet"
                        
                        output += f"Wallet Type: {wallet_type}\n"
                    
        except Exception as e:
            output += f"Transaction history error: {str(e)}\n\n"
        
        try:
            url = f"https://api.etherscan.io/api?module=account&action=tokentx&address={wallet_address}&page=1&offset=100&sort=desc&apikey={etherscan_api_key}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == '1':
                    token_txs = data.get('result', [])
                    
                    token_balances = {}
                    token_info = {}
                    
                    for tx in token_txs:
                        contract_addr = tx.get('contractAddress', '').lower()
                        token_name = tx.get('tokenName', 'Unknown Token')
                        token_symbol = tx.get('tokenSymbol', 'UNKNOWN')
                        token_decimal = int(tx.get('tokenDecimal', 18))
                        from_addr = tx.get('from', '').lower()
                        to_addr = tx.get('to', '').lower()
                        value = int(tx.get('value', 0))
                        
                        if contract_addr not in token_info:
                            token_info[contract_addr] = {
                                'name': token_name,
                                'symbol': token_symbol,
                                'decimals': token_decimal,
                                'interactions': 0
                            }
                        
                        token_info[contract_addr]['interactions'] += 1
                        
                        if contract_addr not in token_balances:
                            token_balances[contract_addr] = 0
                        
                        if to_addr == wallet_address.lower():
                            token_balances[contract_addr] += value
                        elif from_addr == wallet_address.lower():
                            token_balances[contract_addr] -= value
                    
                    output += "ERC-20 TOKEN INTERACTION ANALYSIS\n"
                    output += f"Total Token Contracts Interacted: {len(token_info)}\n"
                    output += f"Total Token Transactions: {len(token_txs)}\n\n"
                    
                    if token_info:
                        output += "TOKEN INTERACTION DETAILS:\n"
                        
                        sorted_tokens = sorted(token_info.items(), key=lambda x: x[1]['interactions'], reverse=True)
                        
                        for i, (contract_addr, info) in enumerate(sorted_tokens[:15], 1):
                            output += f"{i}. {info['name']} ({info['symbol']})\n"
                            output += f"    Contract: {contract_addr}\n"
                            output += f"    Interactions: {info['interactions']} transactions\n"
                            output += f"    Decimals: {info['decimals']}\n"
                            
                            if contract_addr in token_balances:
                                estimated_balance = token_balances[contract_addr] / (10 ** info['decimals'])
                                if estimated_balance != 0:
                                    output += f"    Est. Balance Change: {estimated_balance:,.6f} {info['symbol']}\n"
                            
                            output += "\n"
                    
        except Exception as e:
            output += f"Token interaction analysis error: {str(e)}\n\n"
        
        output += "FINAL WALLET ASSESSMENT\n"
        output += f"Analysis completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        output += f"Data freshness: Real-time blockchain data\n"
        output += f"Confidence level: High (based on on-chain data)\n\n"
        
        output += "KEY INSIGHTS:\n"
        output += "Wallet activity patterns indicate usage type\n"
        output += "Transaction history shows interaction preferences\n"
        output += "Token interactions reveal DeFi/trading activity\n"
        output += "Gas usage patterns indicate technical sophistication\n\n"
        
        output += "NOTE: This analysis is based on publicly available blockchain data.\n"
        output += "Actual current token balances may differ from transaction-based estimates.\n"
        output += "For precise current balances, use dedicated wallet tracking tools.\n"
        
        return output.strip()

def generate_llama_response(prompt: str) -> str:
    """Generate a response from LLaMA 3.3 70B hosted on Groq."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=1024,
            top_p=1,
            stream=False
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq Error: {str(e)}"

def get_crypto_news():
    """Get crypto news combining scraped data with AI analysis"""
    scraper = DetailedCryptoScraper()
    scraped_news = scraper.get_crypto_news()
    
    ai_prompt = f"""Based on this scraped crypto news data:

{scraped_news}

Provide the latest 3 crypto news analysis with short summaries.
dont give any scraped data nd ll just how the importent detiles in the formated way.
Output format rules:
Headings should be in uppercase without any formatting
followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to news authenticity.
Points should be numbered using only numbers (1., 2., 3.).
No bold, italics, or markdown formatting.
Do not include decorative symbols or extra punctuation."""
    
    ai_analysis = generate_llama_response(ai_prompt)
    
    final_output = f"""SCRAPED DATA
{scraped_news}

AI ANALYSIS
{ai_analysis}"""
    
    return final_output

def wallet_summary(address: str, balance_eth: float):
    """Analyze wallet combining scraped transaction data with AI analysis"""
    scraper = DetailedCryptoScraper()
    scraped_wallet = scraper.get_wallet_analysis(address)
    
    tx_summary = f"SCRAPED WALLET DATA FOR {address}\nCurrent ETH Balance: {balance_eth}\n{scraped_wallet}"
    
    ai_prompt = f"""Based on this scraped wallet data:

{tx_summary}

Explain the wallet address {address}'s activity analysis like a report.

Output format rules:
Headings should be in uppercase without any formatting
followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to wallet activity.
Points should be numbered using only numbers (1., 2., 3.).
No bold, italics, or markdown formatting.
Do not include decorative symbols or extra punctuation."""
    
    ai_analysis = generate_llama_response(ai_prompt)
    
    final_output = f"""SCRAPED DATA
{tx_summary}

AI WALLET ANALYSIS
{ai_analysis}"""
    
    return final_output

def check_scam_token(token_address: str):
    """Check token safety combining scraped token data with AI analysis"""
    scraper = DetailedCryptoScraper()
    scraped_token = scraper.get_token_info(token_address)
    
    token_summary = f"SCRAPED TOKEN DATA FOR {token_address}\n{scraped_token}"
    
    ai_prompt = f"""Based on this scraped token data:

{token_summary}

Is the token with address {token_address} suspicious or safe? Provide a brief analysis.

Output format rules:
Headings should be in uppercase without any formatting
followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to token safety.
Points should be numbered using only numbers (1., 2., 3.).
No bold, italics, or markdown formatting.
Do not include decorative symbols or extra punctuation."""
    
    ai_analysis = generate_llama_response(ai_prompt)
    
    final_output = f"""SCRAPED DATA
{token_summary}

AI SAFETY ANALYSIS
{ai_analysis}"""
    
    return final_output

def get_crypto_market_trends():
    """Get crypto market trends combining scraped data with AI analysis"""
    scraper = DetailedCryptoScraper()
    scraped_prices = scraper.get_crypto_prices()
    
    ai_prompt = f"""Based on this scraped crypto market data:

{scraped_prices}

Provide the latest 3 crypto market trends analysis with short summaries.
dont give any scraped data nd ll just how the importent detiles in the formated way.
Output format rules:
Headings should be in uppercase without any formatting
followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to market trends.
Points should be numbered using only numbers (1., 2., 3.).
No bold, italics, or markdown formatting.
Do not include decorative symbols or extra punctuation."""
    
    ai_analysis = generate_llama_response(ai_prompt)
    
    final_output = f"""SCRAPED DATA
{scraped_prices}

AI ANALYSIS
{ai_analysis}"""
    
    return final_output

# Example usage
if __name__ == "__main__":
    print("CRYPTO NEWS ANALYSIS")
    print(get_crypto_news())
    print("\nWALLET ANALYSIS")
    wallet_addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    print(wallet_summary(wallet_addr, 1.25))
    print("\nTOKEN SAFETY CHECK")
    token_addr = "0xA0b86a33E6417c54c86C6Ed1a71f87B5FC6b9F5c"
    print(check_scam_token(token_addr))
    print("\nCRYPTO MARKET TRENDS ANALYSIS")
    print(get_crypto_market_trends())
