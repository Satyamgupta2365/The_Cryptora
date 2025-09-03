# from fastapi import FastAPI, Query, HTTPException, Request, APIRouter
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import RedirectResponse
# from pydantic import BaseModel
# from typing import Optional, Dict, List
# from web3 import Web3
# from groq import Groq
# from supabase import create_client, Client
# import smtplib
# import os
# import json
# import base64
# import requests
# import hashlib
# import time
# import random
# import re
# import asyncio
# from datetime import date, datetime, timedelta
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from bs4 import BeautifulSoup
# from nacl.signing import SigningKey
# from nacl.encoding import HexEncoder
# from dotenv import load_dotenv

# load_dotenv()

# app = FastAPI()
# router = APIRouter()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# QUICKNODE_URL = "https://eth.llamarpc.com"
# POLYGON_URL = "https://polygon-rpc.com"
# BSC_URL = "https://bsc-dataseed1.binance.org"
# ARBITRUM_URL = "https://arb1.arbitrum.io/rpc"

# web3 = Web3(Web3.HTTPProvider(QUICKNODE_URL))
# polygon_web3 = Web3(Web3.HTTPProvider(POLYGON_URL))
# bsc_web3 = Web3(Web3.HTTPProvider(BSC_URL))
# arbitrum_web3 = Web3(Web3.HTTPProvider(ARBITRUM_URL))

# HEDERA_BASE_URL = os.getenv("HEDERA_BASE_URL", "https://mainnet-public.mirrornode.hedera.com/api/v1")
# HEDERA_ACCOUNT_ID = os.getenv("HEDERA_ACCOUNT_ID")
# HEDERA_API_KEY = os.getenv("HEDERA_API_KEY")
# HEDERA_PRIVATE_KEY = os.getenv("HEDERA_PRIVATE_KEY", "")
# HEDERA_PUBLIC_KEY = os.getenv("HEDERA_PUBLIC_KEY", "")

# SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://dysaqwpotjmebytbfooe.supabase.co")
# SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5c2Fxd3BvdGptZWJ5dGJmb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjEyMDksImV4cCI6MjA3MjQ5NzIwOX0.XhxaghbAiR_PvGyQOhriPEPhMrFJIhSGfcRblNheNR4")
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# SMTP_USER = os.getenv("SMTP_USER")
# SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# class LoginRequest(BaseModel):
#     email: str
#     password: str

# class EmailReminder(BaseModel):
#     email: str
#     condition: str
#     threshold: Optional[float] = None
#     currentBalances: Dict

# class AIInput(BaseModel):
#     input: str

# reminders: Dict[str, list] = {
#     "total_above_51": [],
#     "hydra_increase": [],
#     "coinbase_increase": [],
#     "total_below_51": [],
#     "custom": []
# }

# previous_balances = {
#     "total_usd_value": 51.50,
#     "hydra": 50.00,
#     "coinbase": 2.50,
#     "metamask": 0.00
# }

# expenses = []

# class EmailService:
#     def __init__(self):
#         self.smtp_server = "smtp.gmail.com"
#         self.smtp_port = 587
#         self.smtp_user = SMTP_USER
#         self.smtp_password = SMTP_PASSWORD
#         self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

#     def generate_email_content(self, condition: str, balance: float, threshold: float = None) -> str:
#         prompt = f"""
#         Generate a professional email notifying the user about a crypto wallet balance update.
#         Condition: {condition}
#         Current Balance: ${balance:.2f}
#         {f'Threshold: ${threshold:.2f}' if threshold else ''}
#         The email should be concise, polite, and include a clear call-to-action to check the wallet.
#         """
#         response = self.groq_client.chat.completions.create(
#             messages=[{"role": "user", "content": prompt}],
#             model="llama-3.3-70b-versatile"
#         )
#         return response.choices[0].message.content

#     def send_email(self, to_email: str, subject: str, body: str) -> None:
#         if not self.smtp_user or not self.smtp_password:
#             raise ValueError("SMTP credentials not configured")

#         msg = MIMEText(body)
#         msg['Subject'] = subject
#         msg['From'] = self.smtp_user
#         msg['To'] = to_email

#         try:
#             with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
#                 server.starttls()
#                 server.login(self.smtp_user, self.smtp_password)
#                 server.send_message(msg)
#         except Exception as e:
#         print(f"Error deriving address from private key: {e}")
#         return ""

# def get_eth_balance(wallet_address: str) -> float:
#     try:
#         if not web3.is_connected():
#             print("Failed to connect to Ethereum network")
#             return -1
            
#         if not web3.is_address(wallet_address):
#             print(f"Invalid wallet address format: {wallet_address}")
#             print("Ethereum addresses must be 42 characters long (0x + 40 hex chars)")
#             return -1
            
#         checksum_address = web3.to_checksum_address(wallet_address)
#         balance_wei = web3.eth.get_balance(checksum_address)
#         balance_eth = web3.from_wei(balance_wei, 'ether')
#         return float(balance_eth)
#     except Exception as e:
#         print(f"Error getting balance: {e}")
#         return -1

# def get_token_balance(wallet_address: str, token_address: str) -> dict:
#     try:
#         token_abi = [
#             {
#                 "constant": True,
#                 "inputs": [{"name": "_owner", "type": "address"}],
#                 "name": "balanceOf",
#                 "outputs": [{"name": "balance", "type": "uint256"}],
#                 "type": "function"
#             }
#         ]
        
#         token_contract = web3.eth.contract(address=token_address, abi=token_abi)
#         balance = token_contract.functions.balanceOf(wallet_address).call()
        
#         return {
#             "token_address": token_address,
#             "balance": balance,
#             "success": True
#         }
#     except Exception as e:
#         return {
#             "token_address": token_address,
#             "error": str(e),
#             "success": False
#         }

# def get_polygon_balance(wallet_address: str) -> float:
#     try:
#         if not polygon_web3.is_connected():
#             print("Failed to connect to Polygon network")
#             return -1
            
#         if not polygon_web3.is_address(wallet_address):
#             print(f"Invalid wallet address format: {wallet_address}")
#             return -1
            
#         checksum_address = polygon_web3.to_checksum_address(wallet_address)
#         balance_wei = polygon_web3.eth.get_balance(checksum_address)
#         balance_matic = polygon_web3.from_wei(balance_wei, 'ether')
#         return float(balance_matic)
#     except Exception as e:
#         print(f"Error getting Polygon balance: {e}")
#         return -1

# def get_token_price(token_symbol: str) -> float:
#     try:
#         url = f"https://api.coingecko.com/api/v3/simple/price?ids={token_symbol}&vs_currencies=usd"
#         response = requests.get(url, timeout=10)
        
#         if response.status_code == 200:
#             data = response.json()
#             if token_symbol in data and 'usd' in data[token_symbol]:
#                 return data[token_symbol]['usd']
#         return 0
#     except Exception as e:
#         print(f"Error getting {token_symbol} price: {e}")
#         return 0

# def get_balance_from_private_key(private_key: str) -> dict:
#     try:
#         if not private_key or len(private_key) < 64:
#             return {
#                 "error": f"Invalid private key length: {len(private_key)} characters (should be 64 or 66 with 0x prefix)",
#                 "balance_eth": -1
#             }
        
#         address = get_address_from_private_key(private_key)
#         if not address:
#             return {
#                 "error": "Failed to derive address from private key. Please check the private key format.",
#                 "balance_eth": -1
#             }
        
#         eth_balance = get_eth_balance(address)
#         matic_balance = get_polygon_balance(address)
        
#         polygon_tokens = {
#             "USDC": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
#             "USDT": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
#             "DAI": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
#             "WETH": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
#             "WBTC": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
#         }
        
#         return {
#             "address": address,
#             "ethereum": {
#                 "balance_eth": eth_balance,
#                 "network": "Ethereum Mainnet"
#             },
#             "polygon": {
#                 "balance_matic": matic_balance,
#                 "network": "Polygon Mainnet"
#             },
#             "private_key_provided": True
#         }
#     except Exception as e:
#         return {
#             "error": str(e),
#             "balance_eth": -1
#         }

# def send_eth(from_key: str, to_address: str, amount_eth: float) -> str:
#     try:
#         acct = web3.eth.account.from_key(from_key)
#         nonce = web3.eth.get_transaction_count(acct.address)
#         tx = {
#             'nonce': nonce,
#             'to': to_address,
#             'value': web3.to_wei(amount_eth, 'ether'),
#             'gas': 21000,
#             'gasPrice': web3.to_wei('50', 'gwei')
#         }
#         signed_tx = acct.sign_transaction(tx)
#         tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
#         return web3.to_hex(tx_hash)
#     except Exception as e:
#         return str(e)

# def generate_llama_response(prompt: str) -> str:
#     try:
#         response = client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.8,
#             max_tokens=1024,
#             top_p=1,
#             stream=False
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         return f"Groq Error: {str(e)}"

# def get_crypto_news():
#     scraper = DetailedCryptoScraper()
#     scraped_news = scraper.get_crypto_news()
    
#     ai_prompt = f"""Based on this scraped crypto news data:

# {scraped_news}

# Provide the latest 3 crypto news analysis with short summaries.
# dont give any scraped data nd ll just how the importent detiles in the formated way.
# Output format rules:
# Headings should be in uppercase without any formatting
# followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to news authenticity.
# Points should be numbered using only numbers (1., 2., 3.).
# No bold, italics, or markdown formatting.
# Do not include decorative symbols or extra punctuation."""
    
#     ai_analysis = generate_llama_response(ai_prompt)
    
#     final_output = f"""SCRAPED DATA
# {scraped_news}

# AI ANALYSIS
# {ai_analysis}"""
    
#     return final_output

# def wallet_summary(address: str, balance_eth: float):
#     scraper = DetailedCryptoScraper()
#     scraped_wallet = scraper.get_wallet_analysis(address)
    
#     tx_summary = f"SCRAPED WALLET DATA FOR {address}\nCurrent ETH Balance: {balance_eth}\n{scraped_wallet}"
    
#     ai_prompt = f"""Based on this scraped wallet data:

# {tx_summary}

# Explain the wallet address {address}'s activity analysis like a report.

# Output format rules:
# Headings should be in uppercase without any formatting
# followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to wallet activity.
# Points should be numbered using only numbers (1., 2., 3.).
# No bold, italics, or markdown formatting.
# Do not include decorative symbols or extra punctuation."""
    
#     ai_analysis = generate_llama_response(ai_prompt)
    
#     final_output = f"""SCRAPED DATA
# {tx_summary}

# AI WALLET ANALYSIS
# {ai_analysis}"""
    
#     return final_output

# def check_scam_token(token_address: str):
#     scraper = DetailedCryptoScraper()
#     scraped_token = scraper.get_token_info(token_address)
    
#     token_summary = f"SCRAPED TOKEN DATA FOR {token_address}\n{scraped_token}"
    
#     ai_prompt = f"""Based on this scraped token data:

# {token_summary}

# Is the token with address {token_address} suspicious or safe? Provide a brief analysis.

# Output format rules:
# Headings should be in uppercase without any formatting
# followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to token safety.
# Points should be numbered using only numbers (1., 2., 3.).
# No bold, italics, or markdown formatting.
# Do not include decorative symbols or extra punctuation."""
    
#     ai_analysis = generate_llama_response(ai_prompt)
    
#     final_output = f"""SCRAPED DATA
# {token_summary}

# AI SAFETY ANALYSIS
# {ai_analysis}"""
    
#     return final_output

# def get_crypto_market_trends():
#     scraper = DetailedCryptoScraper()
#     scraped_prices = scraper.get_crypto_prices()
    
#     ai_prompt = f"""Based on this scraped crypto market data:

# {scraped_prices}

# Provide the latest 3 crypto market trends analysis with short summaries.
# dont give any scraped data nd ll just how the importent detiles in the formated way.
# Output format rules:
# Headings should be in uppercase without any formatting
# followed by a BRIEF REASONING section with numbered points (1., 2., 3., etc.) providing brief reasons. Use only plain text with no stars, bold, italics, markdown, or decorative symbols. Ensure each point starts with a number followed by a period and a space (e.g., 1. ), and keep the reasoning concise and directly related to market trends.
# Points should be numbered using only numbers (1., 2., 3.).
# No bold, italics, or markdown formatting.
# Do not include decorative symbols or extra punctuation."""
    
#     ai_analysis = generate_llama_response(ai_prompt)
    
#     final_output = f"""SCRAPED DATA
# {scraped_prices}

# AI ANALYSIS
# {ai_analysis}"""
    
#     return final_output

# @app.post("/login")
# async def login(request: LoginRequest):
#     if request.email == "issatyamgupta@gmail.com" and request.password == "Reva@2365":
#         return {
#             "msg": "Login successful (hardcoded user)",
#             "user": {
#                 "email": "issatyamgupta@gmail.com",
#                 "name": "Satyam Gupta"
#             },
#             "session": "hardcoded-session-token"
#         }
#     user = login_user(request.email, request.password)
#     if user and user.get("session"):
#         return {"msg": "Login successful", "user": user["user"], "session": user["session"]}
#     else:
#         raise HTTPException(status_code=401, detail="Invalid credentials or user not found")

# @app.get("/login/google")
# async def login_google():
#     redirect_url = "http://localhost:5173/wallet"
#     return {"url": get_google_oauth_url(redirect_url)}

# @app.get("/auth/callback")
# async def auth_callback(request: Request):
#     code = request.query_params.get("code")
#     if not code:
#         raise HTTPException(status_code=400, detail="Authorization code not found")

#     try:
#         if not supabase:
#             raise Exception("Supabase client not initialized")
#         response = supabase.auth.exchange_code_for_session(code)
#         user = response.user
#         session = response.session
#         print(f"Auth callback successful for user: {user.email}, redirecting to wallet")
#         return RedirectResponse(url="http://localhost:5173/wallet")
#     except Exception as e:
#         print(f"Error exchanging code for session: {e}")
#         raise HTTPException(status_code=500, detail="Failed to complete Google login")

# @app.get("/ai/balances")
# async def get_ai_balances():
#     new_balances = {
#         "total_usd_value": previous_balances["total_usd_value"] + random.uniform(-0.5, 0.5),
#         "hydra": {"balance_hbar": (previous_balances["hydra"] / 0.05) + random.uniform(-10, 10), "usd_value": previous_balances["hydra"] + random.uniform(-0.5, 0.5)},
#         "coinbase": {"balance_usd": previous_balances["coinbase"] + random.uniform(-0.1, 0.1)},
#         "metamask": {"balance_eth": previous_balances["metamask"] / 2500, "usd_value": previous_balances["metamask"] + random.uniform(-0.1, 0.1)}
#     }
#     new_balances["total_usd_value"] = new_balances["hydra"]["usd_value"] + new_balances["coinbase"]["balance_usd"] + new_balances["metamask"]["usd_value"]
    
#     previous_balances["total_usd_value"] = new_balances["total_usd_value"]
#     previous_balances["hydra"] = new_balances["hydra"]["usd_value"]
#     previous_balances["coinbase"] = new_balances["coinbase"]["balance_usd"]
#     previous_balances["metamask"] = new_balances["metamask"]["usd_value"]
    
#     return new_balances

# @app.post("/ai/reminders")
# async def set_email_reminder(reminder: EmailReminder):
#     reminders[reminder.condition].append({
#         "email": reminder.email,
#         "threshold": reminder.threshold,
#         "last_balance": reminder.currentBalances
#     })
#     try:
#         subject = "Cryptora Reminder Set"
#         body = f"Your reminder for '{reminder.condition}' has been set successfully.\nCurrent balance: ${reminder.currentBalances.get('total_usd_value', 0):.2f}"
#         if reminder.threshold is not None:
#             body += f"\nThreshold: ${reminder.threshold:.2f}"
#         email_service.send_email(reminder.email, subject, body)
#     except Exception as e:
#         print(f"Failed to send immediate reminder email to {reminder.email}: {str(e)}")
#     return {"message": "Reminder set successfully"}

# async def check_reminders():
#     while True:
#         current_balances = await get_ai_balances()
#         for condition, reminder_list in reminders.items():
#             for reminder in reminder_list:
#                 email = reminder["email"]
#                 threshold = reminder.get("threshold")
#                 last_balance = reminder["last_balance"]
                
#                 should_send = False
#                 subject = ""
#                 balance = 0.0
                
#                 if condition == "total_above_51" and current_balances["total_usd_value"] > 51:
#                     should_send = True
#                     subject = "Total Balance Exceeded $51"
#                     balance = current_balances["total_usd_value"]
#                 elif condition == "hydra_increase" and current_balances["hydra"]["usd_value"] > last_balance["hydra"]["usd_value"]:
#                     should_send = True
#                     subject = "Hydra Balance Increased"
#                     balance = current_balances["hydra"]["usd_value"]
#                 elif condition == "coinbase_increase" and current_balances["coinbase"]["balance_usd"] > last_balance["coinbase"]["balance_usd"]:
#                     should_send = True
#                     subject = "Coinbase Balance Increased"
#                     balance = current_balances["coinbase"]["balance_usd"]
#                 elif condition == "total_below_51" and current_balances["total_usd_value"] < 51:
#                     should_send = True
#                     subject = "Total Balance Dropped Below $51"
#                     balance = current_balances["total_usd_value"]
#                 elif condition == "custom" and threshold and current_balances["total_usd_value"] > threshold:
#                     should_send = True
#                     subject = f"Total Balance Exceeded Custom Threshold ${threshold}"
#                     balance = current_balances["total_usd_value"]
                
#                 if should_send:
#                     try:
#                         body = email_service.generate_email_content(condition, balance, threshold)
#                         email_service.send_email(email, subject, body)
#                         reminder["last_balance"] = current_balances
#                     except Exception as e:
#                         print(f"Failed to send email to {email}: {str(e)}")
        
#         await asyncio.sleep(30)

# @app.on_event("startup")
# async def startup_event():
#     asyncio.create_task(check_reminders())

# @app.get("/get-expenses")
# async def get_expenses():
#     return {"expenses": expenses}

# def clean_insights_text(text: str) -> str:
#     import re
#     text = re.sub(r"```[\s\S]*?```", "", text)
#     text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
#     text = re.sub(r"\*\*.*?\*\*", "", text)
#     text = re.sub(r"\n{2,}", "\n", text)
#     return text.strip()

# @app.get("/get-insights")
# async def get_insights():
#     prompt = f"Analyze these expenses and provide insights: {json.dumps(expenses)}"
#     raw = generate_llama_response(prompt)
#     insights = clean_insights_text(raw)
#     return {"insights": insights}

# @app.post("/process-ai-input")
# async def process_ai_input(input_data: AIInput):
#     text = input_data.input.lower()
#     current_balances = await get_ai_balances()

#     if 'transfer' in text and 'hydra' in text and 'metamask' in text:
#         try:
#             amount_match = re.search(r'\$([\d.]+)', text)
#             amount = float(amount_match.group(1)) if amount_match else 1.0
#             if amount > current_balances["hydra"]["usd_value"]:
#                 return {"message": "Insufficient Hydra balance for transfer"}
            
#             to_account_id = os.getenv("METAMASK_ACCOUNT_ID", "0.0.123456")
#             result = send_hbar(to_account_id, amount / 0.05)
            
#             if "error" in result:
#                 return {"message": f"Transfer failed: {result['error']}"}
            
#             updated_balances = {**current_balances}
#             updated_balances["hydra"]["usd_value"] -= amount
#             updated_balances["hydra"]["balance_hbar"] -= amount / 0.05
#             updated_balances["metamask"]["usd_value"] += amount
#             updated_balances["metamask"]["balance_eth"] += amount / 2500
#             updated_balances["total_usd_value"] = (
#                 updated_balances["hydra"]["usd_value"] +
#                 updated_balances["coinbase"]["balance_usd"] +
#                 updated_balances["metamask"]["usd_value"]
#             )
            
#             previous_balances["hydra"] = updated_balances["hydra"]["usd_value"]
#             previous_balances["metamask"] = updated_balances["metamask"]["usd_value"]
#             previous_balances["total_usd_value"] = updated_balances["total_usd_value"]
            
#             return {
#                 "action": "transfer",
#                 "details": f"${amount} transferred from Hydra to MetaMask",
#                 "updatedBalances": updated_balances
#             }
#         except Exception as e:
#             return {"message": f"Transfer failed: {str(e)}"}
    
#     elif 'expense' in text:
#         try:
#             amount_match = re.search(r'\$([\d.]+)', text)
#             amount = float(amount_match.group(1)) if amount_match else 10.0
#             category = re.search(r'(food|travel|other)', text) or 'other'
#             category = category.group(1) if category else 'Other'
#             description_match = re.search(r'for\s+([a-zA-Z\s]+)', text)
#             description = description_match.group(1).strip() if description_match else 'General expense'
            
#             expense = {
#                 "id": len(expenses) + 1,
#                 "amount": amount,
#                 "category": category.capitalize(),
#                 "description": description,
#                 "date": date.today().isoformat()
#             }
#             expenses.append(expense)
#             return {"action": "expense", "expense": expense}
#         except Exception as e:
#             return {"message": f"Failed to log expense: {str(e)}"}
    
#     elif 'insights' in text:
#         prompt = f"Analyze these expenses and provide insights: {json.dumps(expenses)}"
#         raw = generate_llama_response(prompt)
#         insights = clean_insights_text(raw)
#         return {"action": "insights", "insights": insights}
    
#     else:
#         return {"message": "Command not recognized. Try 'transfer $1 from Hydra to MetaMask', 'log $10 food expense for lunch', or 'generate insights'."}

# @app.get("/wallet/balance")
# def get_wallet_balance_from_private_key(private_key: str = Query(..., description="Private key")):
#     if not web3.is_connected():
#         return {"error": "Failed to connect to Ethereum node"}
#     return get_balance_from_private_key(private_key)

# @app.post("/wallet/send")
# def wallet_send(from_key: str, to: str, amount: float):
#     tx = send_eth(from_key, to, amount)
#     return {"tx_hash_or_error": tx}

# @app.get("/llm/query")
# def ask_llm(q: str = Query(..., description="Ask anything about crypto")):
#     return {"response": generate_llama_response(q)}

# @app.get("/llm/news")
# def get_crypto_news_endpoint():
#     return {"news": get_crypto_news()}

# @app.get("/llm/checktoken")
# def check_token_safety(token_address: str):
#     result = check_scam_token(token_address)
#     return {"security_analysis": result}

# @app.get("/llm/wallet-summary")
# def get_wallet_summary(address: str, balance: float):
#     return {"summary": wallet_summary(address, balance)}

# @app.get("/hedera/account/balance")
# def get_hedera_balance():
#     if not HEDERA_ACCOUNT_ID:
#         return {"error": "HEDERA_ACCOUNT_ID not set in .env"}

#     url = f"{HEDERA_BASE_URL}/accounts/{HEDERA_ACCOUNT_ID}"
#     headers = {"Authorization": f"Bearer {HEDERA_API_KEY}"} if HEDERA_API_KEY else {}

#     response = requests.get(url, headers=headers)

#     if response.status_code != 200:
#         return {"error": "Failed to fetch balance", "details": response.text}

#     account_data = response.json()
#     balance = account_data.get("balance", {}).get("balance", 0)
#     return {"account_id": HEDERA_ACCOUNT_ID, "balance": balance}

# @app.get("/hedera/transactions")
# def get_hedera_transactions():
#     if not HEDERA_ACCOUNT_ID:
#         return {"error": "HEDERA_ACCOUNT_ID not set in .env"}

#     url = f"{HEDERA_BASE_URL}/accounts/{HEDERA_ACCOUNT_ID}/transactions"
#     headers = {"Authorization": f"Bearer {HEDERA_API_KEY}"} if HEDERA_API_KEY else {}

#     response = requests.get(url, headers=headers)

#     if response.status_code != 200:
#         return {"error": "Failed to fetch transactions", "details": response.text}

#     tx_data = response.json()
#     return {"transactions": tx_data.get("transactions", [])}

# @app.post("/hedera/transfer")
# def transfer_hbar(from_private_key: str, to_account_id: str, amount: float):
#     return send_hbar(to_account_id, amount)

# @app.get("/hedera/tips")
# def get_hedera_tips():
#     prompt = "Give me practical tips for investing or using Hedera (HBAR) cryptocurrency."
#     return {"tips": generate_llama_response(prompt)}

# @app.get("/hedera/news")
# def get_hedera_news():
#     prompt = "Give me the latest Hedera (HBAR) related crypto news headlines with short summaries."
#     return {"news": generate_llama_response(prompt)}

# app.include_router(router)

# @app.get("/")
# async def root():
#     return {"msg": "Web3 + Groq (LLaMA) + Hedera Backend Running"} Exception as e:
#             raise Exception(f"Failed to send email: {str(e)}")

# email_service = EmailService()

# def login_user(email: str, password: str):
#     try:
#         response = supabase.auth.sign_in_with_password({"email": email, "password": password})
#         return {"session": response.session, "user": response.user}
#     except Exception as e:
#         print(f"Error logging in user: {e}")
#         return None

# def signup_user(email: str, password: str):
#     try:
#         response = supabase.auth.sign_up({"email": email, "password": password})
#         return {"user": response.user}
#     except Exception as e:
#         print(f"Error signing up user: {e}")
#         return None

# def get_google_oauth_url(redirect_url: str = "http://localhost:5173/wallet"):
#     params = {
#         "provider": "google",
#         "redirect_to": redirect_url,
#     }
#     return f"{SUPABASE_URL}/auth/v1/authorize?{('&'.join([f'{k}={v}' for k, v in params.items()]))}"

# def sha384(data: bytes) -> str:
#     return hashlib.sha384(data).hexdigest()

# def sign_message(message: bytes) -> str:
#     signing_key = SigningKey(HEDERA_PRIVATE_KEY.encode(), encoder=HexEncoder)
#     signed = signing_key.sign(message)
#     return signed.signature.hex()

# def send_hbar(receiver_account_id: str, amount: float) -> dict:
#     return {
#         "status": "success",
#         "sender": HEDERA_ACCOUNT_ID,
#         "receiver": receiver_account_id,
#         "amount": amount,
#         "tx_hash": "dummy_tx_hash_123456"
#     }

# def send_email(to_email: str, subject: str, body: str):
#     msg = MIMEMultipart()
#     msg['From'] = SMTP_USER
#     msg['To'] = to_email
#     msg['Subject'] = subject
#     msg.attach(MIMEText(body, 'plain'))

#     try:
#         with smtplib.SMTP('smtp.gmail.com', 587) as server:
#             server.starttls()
#             server.login(SMTP_USER, SMTP_PASSWORD)
#             server.sendmail(SMTP_USER, to_email, msg.as_string())
#         return True
#     except Exception as e:
#         print(f"Failed to send email to {to_email}: {e}")
#         return False

# def generate_email_content(condition: str, balance: float, threshold: float = None) -> str:
#     content = f"Your reminder for condition '{condition}' has been triggered.\nCurrent balance: ${balance:.2f}"
#     if threshold is not None:
#         content += f"\nThreshold: ${threshold:.2f}"
#     return content

# class DetailedCryptoScraper:
#     def __init__(self):
#         self.headers = {
#             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
#             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
#             'Accept-Language': 'en-US,en;q=0.5',
#             'Accept-Encoding': 'gzip, deflate, br',
#             'Connection': 'keep-alive',
#             'Upgrade-Insecure-Requests': '1'
#         }
#         self.session = requests.Session()
#         self.session.headers.update(self.headers)
    
#     def format_large_number(self, num):
#         if num is None:
#             return "N/A"
        
#         if num >= 1e12:
#             return f"${num/1e12:.2f}T"
#         elif num >= 1e9:
#             return f"${num/1e9:.2f}B"
#         elif num >= 1e6:
#             return f"${num/1e6:.2f}M"
#         elif num >= 1e3:
#             return f"${num/1e3:.2f}K"
#         else:
#             return f"${num:.2f}"
    
#     def get_crypto_prices(self) -> str:
#         output = f"Last Updated: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
#         output += "Data Sources: CoinGecko API, CoinMarketCap, Live Market Data\n\n"
        
#         try:
#             url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d"
#             response = requests.get(url, timeout=15)
            
#             if response.status_code == 200:
#                 data = response.json()
                
#                 output += f"TOP {len(data)} CRYPTOCURRENCIES BY MARKET CAPITALIZATION\n\n"
                
#                 for i, coin in enumerate(data, 1):
#                     name = coin.get('name', 'Unknown')
#                     symbol = coin.get('symbol', '').upper()
#                     current_price = coin.get('current_price', 0)
#                     market_cap = coin.get('market_cap', 0)
#                     market_cap_rank = coin.get('market_cap_rank', 'N/A')
#                     total_volume = coin.get('total_volume', 0)
#                     circulating_supply = coin.get('circulating_supply', 0)
#                     total_supply = coin.get('total_supply', 0)
#                     max_supply = coin.get('max_supply', 0)
                    
#                     price_change_1h = coin.get('price_change_percentage_1h_in_currency', 0)
#                     price_change_24h = coin.get('price_change_percentage_24h', 0)
#                     price_change_7d = coin.get('price_change_percentage_7d_in_currency', 0)
#                     price_change_30d = coin.get('price_change_percentage_30d_in_currency', 0)
                    
#                     ath = coin.get('ath', 0)
#                     ath_change_percentage = coin.get('ath_change_percentage', 0)
#                     ath_date = coin.get('ath_date', '')
                    
#                     atl = coin.get('atl', 0)
#                     atl_change_percentage = coin.get('atl_change_percentage', 0)
#                     atl_date = coin.get('atl_date', '')
                    
#                     output += f"CRYPTOCURRENCY {i}: {name} ({symbol})\n"
#                     output += f"Current Price: ${current_price:,.6f}\n"
                    
#                     def format_change(change):
#                         if change > 0:
#                             return f"+{change:.2f}%"
#                         elif change < 0:
#                             return f"{change:.2f}%"
#                         else:
#                             return "0.00%"
                    
#                     output += "PRICE CHANGES:\n"
#                     output += f"  1 Hour: {format_change(price_change_1h or 0)}\n"
#                     output += f"  24 Hour: {format_change(price_change_24h or 0)}\n"
#                     output += f"  7 Days: {format_change(price_change_7d or 0)}\n"
#                     output += f"  30 Days: {format_change(price_change_30d or 0)}\n"
                    
#                     output += "MARKET DATA:\n"
#                     output += f"  Market Cap: {self.format_large_number(market_cap)}\n"
#                     output += f"  24h Volume: {self.format_large_number(total_volume)}\n"
#                     output += f"  Volume/Market Cap Ratio: {(total_volume/market_cap*100):.2f}%\n" if market_cap > 0 else "  Volume/Market Cap Ratio: N/A\n"
                    
#                     output += "SUPPLY INFORMATION:\n"
#                     output += f"  Circulating Supply: {circulating_supply:,.0f} {symbol}\n" if circulating_supply else "  Circulating Supply: N/A\n"
#                     output += f"  Total Supply: {total_supply:,.0f} {symbol}\n" if total_supply else "  Total Supply: N/A\n"
#                     output += f"  Max Supply: {max_supply:,.0f} {symbol}\n" if max_supply else "  Max Supply: Unlimited\n"
                    
#                     output += "HISTORICAL DATA:\n"
#                     output += f"  All-Time High: ${ath:,.2f} ({ath_change_percentage:.1f}% from ATH)\n" if ath else "  All-Time High: N/A\n"
#                     if ath_date:
#                         ath_formatted = datetime.fromisoformat(ath_date.replace('Z', '+00:00')).strftime('%Y-%m-%d')
#                         output += f"  ATH Date: {ath_formatted}\n"
                    
#                     output += f"  All-Time Low: ${atl:.6f} (+{atl_change_percentage:.0f}% from ATL)\n" if atl else "  All-Time Low: N/A\n"
#                     if atl_date:
#                         atl_formatted = datetime.fromisoformat(atl_date.replace('Z', '+00:00')).strftime('%Y-%m-%d')
#                         output += f"  ATL Date: {atl_formatted}\n"
                    
#                     output += "\n\n"
                    
#         except Exception as e:
#             output += f"ERROR FETCHING MARKET DATA: {str(e)}\n"
#             output += "Attempting backup data source...\n\n"
            
#             try:
#                 response = self.session.get("https://coinmarketcap.com/", timeout=15)
#                 soup = BeautifulSoup(response.content, 'html.parser')
                
#                 output += "BACKUP DATA SOURCE: CoinMarketCap (Limited Data)\n\n"
                
#                 rows = soup.find_all('tr')[:15]
#                 for row in rows[1:]:
#                     cells = row.find_all('td')
#                     if len(cells) >= 6:
#                         try:
#                             rank = cells[1].get_text(strip=True)
#                             name_cell = cells[2]
#                             name = name_cell.get_text(strip=True).split('\n')[0] if name_cell else "N/A"
#                             price = cells[3].get_text(strip=True) if len(cells) > 3 else "N/A"
#                             change_24h = cells[4].get_text(strip=True) if len(cells) > 4 else "N/A"
#                             volume = cells[5].get_text(strip=True) if len(cells) > 5 else "N/A"
#                             market_cap = cells[6].get_text(strip=True) if len(cells) > 6 else "N/A"
                            
#                             output += f"CRYPTOCURRENCY #{rank}: {name}\n"
#                             output += f"Price: {price}\n"
#                             output += f"24h Change: {change_24h}\n"
#                             output += f"Volume: {volume}\n"
#                             output += f"Market Cap: {market_cap}\n\n"
                            
#                         except Exception:
#                             continue
                            
#             except Exception as backup_error:
#                 output += f"BACKUP DATA SOURCE ALSO FAILED: {str(backup_error)}\n"
        
#         return output.strip()
    
#     def get_crypto_news(self) -> str:
#         output = f"News Compiled: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
#         output += "Sources: CoinDesk, CoinTelegraph, CryptoCompare, Decrypt, CryptoBriefing\n\n"
        
#         try:
#             api_url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
#             response = requests.get(api_url, timeout=10)
            
#             if response.status_code == 200:
#                 data = response.json()
                
#                 output += "PRIMARY NEWS SOURCE: CryptoCompare API\n\n"
                
#                 for i, article in enumerate(data.get('Data', [])[:8], 1):
#                     title = article.get('title', 'No title available')
#                     body = article.get('body', 'No summary available')[:300]
#                     url = article.get('url', 'No URL available')
#                     published_on = article.get('published_on', 0)
#                     source_info = article.get('source_info', {})
#                     source_name = source_info.get('name', 'Unknown Source')
#                     categories = article.get('categories', '')
#                     tags = article.get('tags', '')
                    
#                     if published_on:
#                         pub_date = datetime.fromtimestamp(published_on)
#                         formatted_date = pub_date.strftime('%A, %B %d, %Y at %I:%M %p UTC')
#                         time_ago = datetime.now() - pub_date
#                         if time_ago.days > 0:
#                             time_ago_str = f"{time_ago.days} days ago"
#                         elif time_ago.seconds > 3600:
#                             time_ago_str = f"{time_ago.seconds // 3600} hours ago"
#                         else:
#                             time_ago_str = f"{time_ago.seconds // 60} minutes ago"
#                     else:
#                         formatted_date = "Date not available"
#                         time_ago_str = "Unknown"
                    
#                     output += f"NEWS ARTICLE {i}\n"
#                     output += f"Headline: {title}\n"
#                     output += f"Source: {source_name}\n"
#                     output += f"Published: {formatted_date} ({time_ago_str})\n"
#                     output += f"Categories: {categories if categories else 'General'}\n"
#                     output += f"Tags: {tags if tags else 'None specified'}\n"
#                     output += f"Summary: {body}{'...' if len(article.get('body', '')) > 300 else ''}\n"
#                     output += f"Full Article: {url}\n\n"
                    
#         except Exception as e:
#             output += f"CryptoCompare API Error: {str(e)}\n\n"
        
#         try:
#             response = self.session.get('https://www.coindesk.com/arc/outboundfeeds/rss/', timeout=15)
            
#             if response.status_code == 200:
#                 soup = BeautifulSoup(response.content, 'xml')
#                 items = soup.find_all('item')[:5]
                
#                 output += "SECONDARY NEWS SOURCE: CoinDesk RSS Feed\n\n"
                
#                 for i, item in enumerate(items, 1):
#                     title = item.find('title').get_text() if item.find('title') else "No title"
#                     description = item.find('description').get_text() if item.find('description') else "No description"
#                     link = item.find('link').get_text() if item.find('link') else "No link"
#                     pub_date = item.find('pubDate').get_text() if item.find('pubDate') else "No date"
                    
#                     clean_description = BeautifulSoup(description, 'html.parser').get_text()[:250]
                    
#                     output += f"COINDESK ARTICLE {i}\n"
#                     output += f"Headline: {title}\n"
#                     output += f"Published: {pub_date}\n"
#                     output += f"Summary: {clean_description}{'...' if len(clean_description) == 250 else ''}\n"
#                     output += f"Read More: {link}\n\n"
                    
#         except Exception as e:
#             output += f"CoinDesk RSS Error: {str(e)}\n\n"
        
#         return output.strip()

#     def get_token_info(self, token_address: str) -> str:
#         output = f"TOKEN ANALYSIS REPORT\n"
#         output += f"Token Contract: {token_address}\n"
#         output += f"Analysis Timestamp: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
#         output += f"Data Sources: CoinGecko, Etherscan, DeFiPulse, Contract Analysis\n\n"
        
#         try:
#             url = f"https://api.coingecko.com/api/v3/coins/ethereum/contract/{token_address}"
#             response = requests.get(url, timeout=15)
            
#             if response.status_code == 200:
#                 data = response.json()
                
#                 output += "PRIMARY TOKEN DATA - CoinGecko Verified\n"
                
#                 name = data.get('name', 'Unknown Token')
#                 symbol = data.get('symbol', 'UNKNOWN').upper()
#                 output += f"TOKEN NAME: {name}\n"
#                 output += f"TOKEN SYMBOL: {symbol}\n"
#                 output += f"CONTRACT ADDRESS: {token_address}\n"
#                 output += f"BLOCKCHAIN: Ethereum (ERC-20)\n"
                
#                 market_cap_rank = data.get('market_cap_rank')
#                 coingecko_rank = data.get('coingecko_rank')
#                 output += f"MARKET CAP RANK: #{market_cap_rank}\n" if market_cap_rank else "MARKET CAP RANK: Not Ranked\n"
#                 output += f"COINGECKO RANK: #{coingecko_rank}\n" if coingecko_rank else "COINGECKO RANK: Not Ranked\n"
                
#                 market_data = data.get('market_data', {})
#                 if market_data:
#                     output += "DETAILED MARKET ANALYSIS\n"
                    
#                     current_price = market_data.get('current_price', {})
#                     output += "CURRENT PRICE:\n"
#                     output += f"  USD: ${current_price.get('usd', 0):,.8f}\n"
#                     output += f"  BTC: {current_price.get('btc', 0):.8f} BTC\n"
#                     output += f"  ETH: {current_price.get('eth', 0):.8f} ETH\n"
#                     output += f"  EUR: €{current_price.get('eur', 0):,.6f}\n"
                    
#                     market_cap = market_data.get('market_cap', {})
#                     output += "MARKET CAPITALIZATION:\n"
#                     output += f"  USD: {self.format_large_number(market_cap.get('usd'))}\n"
#                     output += f"  BTC: {market_cap.get('btc', 0):,.2f} BTC\n"
#                     output += f"  ETH: {market_cap.get('eth', 0):,.2f} ETH\n"
                    
#                     volume = market_data.get('total_volume', {})
#                     output += "24-HOUR TRADING VOLUME:\n"
#                     output += f"  USD: {self.format_large_number(volume.get('usd'))}\n"
#                     output += f"  BTC: {volume.get('btc', 0):,.2f} BTC\n"
                    
#                     total_supply = market_data.get('total_supply')
#                     circulating_supply = market_data.get('circulating_supply')
#                     max_supply = market_data.get('max_supply')
                    
#                     output += "SUPPLY ANALYSIS:\n"
#                     output += f"  Circulating Supply: {circulating_supply:,.0f} {symbol}\n" if circulating_supply else "  Circulating Supply: Not Available\n"
#                     output += f"  Total Supply: {total_supply:,.0f} {symbol}\n" if total_supply else "  Total Supply: Not Available\n"
#                     output += f"  Maximum Supply: {max_supply:,.0f} {symbol}\n" if max_supply else "  Maximum Supply: Unlimited/Not Set\n"
                    
#                     if circulating_supply and max_supply:
#                         supply_percentage = (circulating_supply / max_supply) * 100
#                         output += f"  Supply in Circulation: {supply_percentage:.2f}% of max supply\n"
                
#                 description = data.get('description', {}).get('en', '')
#                 if description:
#                     output += "PROJECT DESCRIPTION:\n"
#                     clean_description = description[:500].strip()
#                     output += f"{clean_description}{'...' if len(description) > 500 else ''}\n"
                
#         except Exception as e:
#             output += f"CoinGecko API Error: {str(e)}\n\n"
        
#         return output.strip()
    
#     def get_wallet_analysis(self, wallet_address: str) -> str:
#         output = f"WALLET ANALYSIS REPORT\n"
#         output += f"Wallet Address: {wallet_address}\n"
#         output += f"Analysis Timestamp: {datetime.now().strftime('%A, %B %d, %Y at %H:%M:%S UTC')}\n"
#         output += f"Blockchain: Ethereum Mainnet\n"
#         output += f"Data Sources: Etherscan API, On-chain Analysis\n\n"
        
#         etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        
#         if not etherscan_api_key:
#             output += "ERROR: Etherscan API key required for comprehensive wallet analysis\n"
#             output += "Please add ETHERSCAN_API_KEY to your .env file\n"
#             output += "Get a free API key from: https://etherscan.io/apis\n\n"
            
#             output += "ATTEMPTING LIMITED ANALYSIS WITHOUT API KEY...\n"
#             return output.strip()
        
#         try:
#             url = f"https://api.etherscan.io/api?module=account&action=balance&address={wallet_address}&tag=latest&apikey={etherscan_api_key}"
#             response = requests.get(url, timeout=10)
            
#             if response.status_code == 200:
#                 data = response.json()
#                 if data.get('status') == '1':
#                     balance_wei = int(data.get('result', 0))
#                     balance_eth = balance_wei / 10**18
                    
#                     try:
#                         eth_price_response = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", timeout=5)
#                         if eth_price_response.status_code == 200:
#                             eth_price_data = eth_price_response.json()
#                             eth_price_usd = eth_price_data.get('ethereum', {}).get('usd', 0)
#                             balance_usd = balance_eth * eth_price_usd
#                         else:
#                             eth_price_usd = 0
#                             balance_usd = 0
#                     except:
#                         eth_price_usd = 0
#                         balance_usd = 0
                    
#                     output += "WALLET BALANCE OVERVIEW\n"
#                     output += f"ETH Balance: {balance_eth:.8f} ETH\n"
#                     output += f"Balance in Wei: {balance_wei:,} wei\n"
#                     if eth_price_usd > 0:
#                         output += f"USD Value: ${balance_usd:,.2f} (at ${eth_price_usd:,.2f}/ETH)\n"
#                     output += f"Balance Status: {'Funded Wallet' if balance_eth > 0.01 else 'Low Balance' if balance_eth > 0 else 'Empty Wallet'}\n\n"
                    
#         except Exception as e:
#             output += f"Balance check error: {str(e)}\n\n"
        
#         return output.strip()

# def get_address_from_private_key(private_key: str) -> str:
#     try:
#         if private_key.startswith('0x'):
#             private_key = private_key[2:]
        
#         if len(private_key) != 64:
#             print(f"Invalid private key length: {len(private_key)} characters (should be 64)")
#             return ""
            
#         try:
#             int(private_key, 16)
#         except ValueError:
#             print("Invalid private key: must contain only hexadecimal characters")
#             return ""
            
#         account = web3.eth.account.from_key(private_key)
#         return account.address
#     except
