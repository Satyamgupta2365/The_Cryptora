from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import os
from api_routes import router as api_router
import asyncio
from email_service import EmailService
from llm_utils import generate_llama_response, get_crypto_news, wallet_summary, check_scam_token
from wallet_utils import get_balance_from_private_key, send_eth, web3
from hedera_utils import send_hbar
from dotenv import load_dotenv
import requests
import json

app = FastAPI()
email_service = EmailService()

# Load environment variables
load_dotenv()

# Environment variables
HEDERA_BASE_URL = os.getenv("HEDERA_BASE_URL", "https://mainnet-public.mirrornode.hedera.com/api/v1")
HEDERA_ACCOUNT_ID = os.getenv("HEDERA_ACCOUNT_ID")
HEDERA_API_KEY = os.getenv("HEDERA_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded credentials
CREDENTIALS = {
    "user1@example.com": "pass123",
    "user2@example.com": "pass456",
    "user3@example.com": "pass789",
}

# Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(request: LoginRequest):
    if request.email in CREDENTIALS and CREDENTIALS[request.email] == request.password:
        return {"msg": "Login successful, MetaMask wallet connected (dummy)"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# In-memory storage for reminders
reminders: Dict[str, list] = {
    "total_above_51": [],
    "hydra_increase": [],
    "coinbase_increase": [],
    "total_below_51": [],
    "custom": []
}

# In-memory storage for previous balances
previous_balances = {
    "total_usd_value": 51.50,
    "hydra": 50.00,
    "coinbase": 2.50
}

class EmailReminder(BaseModel):
    email: str
    condition: str
    threshold: Optional[float] = None
    currentBalances: Dict

@app.post("/login")
async def login(request: LoginRequest):
    if request.email in CREDENTIALS and CREDENTIALS[request.email] == request.password:
        return {"msg": "Login successful, MetaMask wallet connected (dummy)"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
@app.get("/ai/balances")
async def get_ai_balances():
    import random
    new_balances = {
        "total_usd_value": previous_balances["total_usd_value"] + random.uniform(-0.5, 0.5),
        "hydra": {"balance_hbar": (previous_balances["hydra"] / 0.05) + random.uniform(-10, 10), "usd_value": previous_balances["hydra"] + random.uniform(-0.5, 0.5)},
        "coinbase": {"balance_usd": previous_balances["coinbase"] + random.uniform(-0.1, 0.1)}
    }
    new_balances["total_usd_value"] = new_balances["hydra"]["usd_value"] + new_balances["coinbase"]["balance_usd"]
    
    previous_balances["total_usd_value"] = new_balances["total_usd_value"]
    previous_balances["hydra"] = new_balances["hydra"]["usd_value"]
    previous_balances["coinbase"] = new_balances["coinbase"]["balance_usd"]
    
    return new_balances

@app.post("/ai/reminders")
async def set_email_reminder(reminder: EmailReminder):
    reminders[reminder.condition].append({
        "email": reminder.email,
        "threshold": reminder.threshold,
        "last_balance": reminder.currentBalances
    })
    return {"message": "Reminder set successfully"}

async def check_reminders():
    while True:
        current_balances = await get_ai_balances()
        for condition, reminder_list in reminders.items():
            for reminder in reminder_list:
                email = reminder["email"]
                threshold = reminder.get("threshold")
                last_balance = reminder["last_balance"]
                
                should_send = False
                subject = ""
                balance = 0.0
                
                if condition == "total_above_51" and current_balances["total_usd_value"] > 51:
                    should_send = True
                    subject = "Total Balance Exceeded $51"
                    balance = current_balances["total_usd_value"]
                elif condition == "hydra_increase" and current_balances["hydra"]["usd_value"] > last_balance["hydra"]["usd_value"]:
                    should_send = True
                    subject = "Hydra Balance Increased"
                    balance = current_balances["hydra"]["usd_value"]
                elif condition == "coinbase_increase" and current_balances["coinbase"]["balance_usd"] > last_balance["coinbase"]["balance_usd"]:
                    should_send = True
                    subject = "Coinbase Balance Increased"
                    balance = current_balances["coinbase"]["balance_usd"]
                elif condition == "total_below_51" and current_balances["total_usd_value"] < 51:
                    should_send = True
                    subject = "Total Balance Dropped Below $51"
                    balance = current_balances["total_usd_value"]
                elif condition == "custom" and threshold and current_balances["total_usd_value"] > threshold:
                    should_send = True
                    subject = f"Total Balance Exceeded Custom Threshold ${threshold}"
                    balance = current_balances["total_usd_value"]
                
                if should_send:
                    try:
                        body = email_service.generate_email_content(condition, balance, threshold)
                        email_service.send_email(email, subject, body)
                        reminder["last_balance"] = current_balances
                    except Exception as e:
                        print(f"Failed to send email to {email}: {str(e)}")
        
        await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_reminders())

app.include_router(api_router)

@app.get("/")
def root():
    return {"msg": "Web3 + Groq (LLaMA) + Hedera Backend Running"}

@app.get("/wallet/balance")
def get_wallet_balance_from_private_key(private_key: str = Query(..., description="Private key")):
    if not web3.is_connected():
        return {"error": "Failed to connect to Ethereum node"}
    return get_balance_from_private_key(private_key)

@app.post("/wallet/send")
def wallet_send(from_key: str, to: str, amount: float):
    tx = send_eth(from_key, to, amount)
    return {"tx_hash_or_error": tx}

@app.get("/llm/query")
def ask_llm(q: str = Query(..., description="Ask anything about crypto")):
    return {"response": generate_llama_response(q)}

@app.get("/llm/news")
def get_crypto_news_endpoint():
    return {"news": get_crypto_news()}

@app.get("/llm/checktoken")
def check_token_safety(token_address: str):
    result = check_scam_token(token_address)
    return {"security_analysis": result}

@app.get("/llm/wallet-summary")
def get_wallet_summary(address: str, balance: float):
    return {"summary": wallet_summary(address, balance)}

@app.get("/hedera/account/balance")
def get_hedera_balance():
    if not HEDERA_ACCOUNT_ID:
        return {"error": "HEDERA_ACCOUNT_ID not set in .env"}

    url = f"{HEDERA_BASE_URL}/accounts/{HEDERA_ACCOUNT_ID}"
    headers = {"Authorization": f"Bearer {HEDERA_API_KEY}"} if HEDERA_API_KEY else {}

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch balance", "details": response.text}

    account_data = response.json()
    balance = account_data.get("balance", {}).get("balance", 0)
    return {"account_id": HEDERA_ACCOUNT_ID, "balance": balance}

@app.get("/hedera/transactions")
def get_hedera_transactions():
    if not HEDERA_ACCOUNT_ID:
        return {"error": "HEDERA_ACCOUNT_ID not set in .env"}

    url = f"{HEDERA_BASE_URL}/accounts/{HEDERA_ACCOUNT_ID}/transactions"
    headers = {"Authorization": f"Bearer {HEDERA_API_KEY}"} if HEDERA_API_KEY else {}

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch transactions", "details": response.text}

    tx_data = response.json()
    return {"transactions": tx_data.get("transactions", [])}

@app.post("/hedera/transfer")
def transfer_hbar(from_private_key: str, to_account_id: str, amount: float):
    return send_hbar(from_private_key, to_account_id, amount)

@app.get("/hedera/tips")
def get_hedera_tips():
    prompt = "Give me practical tips for investing or using Hedera (HBAR) cryptocurrency.Output format rules: Headings should be in uppercase without any formatting.Points should be numbered using only numbers (1., 2., 3.).No bold, italics, or markdown formatting.Do not include decorative symbols or extra punctuation."
    return {"tips": generate_llama_response(prompt)}

@app.get("/hedera/news")
def get_hedera_news():
    prompt = "Give me the latest Hedera (HBAR) related crypto news headlines with short summaries.Output format rules: Headings should be in uppercase without any formatting.Points should be numbered using only numbers (1., 2., 3.).No bold, italics, or markdown formatting.Do not include decorative symbols or extra punctuation."
    return {"news": generate_llama_response(prompt)}

app.include_router(api_router)

class FlightRequest(BaseModel):
    from_city: str
    to_city: str
    date: str

@app.get("/")
async def root():
    return {"msg": "Web3 + Groq (LLaMA) + Hedera Backend Running"}

@app.post("/book-flight")
async def book_flight_endpoint(request: FlightRequest):
    try:
        # Run Selenium script in a separate thread to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, book_flight, request.from_city, request.to_city, request.date)
        return {"msg": "Flight booking process started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting booking process: {str(e)}")