from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import os
import json
from datetime import date
from api_routes import router as api_router
import asyncio
from email_service import EmailService
from llm_utils import generate_llama_response, get_crypto_news, wallet_summary, check_scam_token
from wallet_utils import get_balance_from_private_key, send_eth, web3
from hedera_utils import send_hbar
from dotenv import load_dotenv
import requests
import random
import re
from supabase_client import login_user, signup_user, get_google_oauth_url, supabase

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

# Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

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
    "coinbase": 2.50,
    "metamask": 0.00
}

# In-memory storage for expenses
expenses = []

class EmailReminder(BaseModel):
    email: str
    condition: str
    threshold: Optional[float] = None
    currentBalances: Dict

class AIInput(BaseModel):
    input: str

@app.post("/login")
async def login(request: LoginRequest):
    # Hardcoded user check
    if request.email == "issatyamgupta@gmail.com" and request.password == "Reva@2365":
        return {
            "msg": "Login successful (hardcoded user)",
            "user": {
                "email": "issatyamgupta@gmail.com",
                "name": "Satyam Gupta"
            },
            "session": "hardcoded-session-token"
        }
    # Supabase login fallback
    user = login_user(request.email, request.password)
    if user and user.get("session"):
        return {"msg": "Login successful", "user": user["user"], "session": user["session"]}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials or user not found")

@app.get("/login/google")
async def login_google():
    # Returns the Google OAuth URL
    # Use /auth/callback with a query param for target page
    redirect_url = "http://localhost:5173/wallet"
    return {"url": get_google_oauth_url(redirect_url)}

@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    try:
        if not supabase:
            raise Exception("Supabase client not initialized")
        response = supabase.auth.exchange_code_for_session(code)
        user = response.user
        session = response.session
        print(f"Auth callback successful for user: {user.email}, redirecting to wallet")
        return RedirectResponse(url="http://localhost:5173/wallet")
    except Exception as e:
        print(f"Error exchanging code for session: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete Google login")

@app.get("/ai/balances")
async def get_ai_balances():
    new_balances = {
        "total_usd_value": previous_balances["total_usd_value"] + random.uniform(-0.5, 0.5),
        "hydra": {"balance_hbar": (previous_balances["hydra"] / 0.05) + random.uniform(-10, 10), "usd_value": previous_balances["hydra"] + random.uniform(-0.5, 0.5)},
        "coinbase": {"balance_usd": previous_balances["coinbase"] + random.uniform(-0.1, 0.1)},
        "metamask": {"balance_eth": previous_balances["metamask"] / 2500, "usd_value": previous_balances["metamask"] + random.uniform(-0.1, 0.1)}
    }
    new_balances["total_usd_value"] = new_balances["hydra"]["usd_value"] + new_balances["coinbase"]["balance_usd"] + new_balances["metamask"]["usd_value"]
    
    previous_balances["total_usd_value"] = new_balances["total_usd_value"]
    previous_balances["hydra"] = new_balances["hydra"]["usd_value"]
    previous_balances["coinbase"] = new_balances["coinbase"]["balance_usd"]
    previous_balances["metamask"] = new_balances["metamask"]["usd_value"]
    
    return new_balances

@app.post("/ai/reminders")
async def set_email_reminder(reminder: EmailReminder):
    reminders[reminder.condition].append({
        "email": reminder.email,
        "threshold": reminder.threshold,
        "last_balance": reminder.currentBalances
    })
    # Send a simple email immediately after setting the reminder
    try:
        subject = "Cryptora Reminder Set"
        body = f"Your reminder for '{reminder.condition}' has been set successfully.\nCurrent balance: ${reminder.currentBalances.get('total_usd_value', 0):.2f}"
        if reminder.threshold is not None:
            body += f"\nThreshold: ${reminder.threshold:.2f}"
        email_service.send_email(reminder.email, subject, body)
    except Exception as e:
        print(f"Failed to send immediate reminder email to {reminder.email}: {str(e)}")
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

@app.get("/get-expenses")
async def get_expenses():
    return {"expenses": expenses}

def clean_insights_text(text: str) -> str:
    """
    Remove markdown code blocks and unnecessary formatting from LLM response.
    """
    import re
    # Remove code blocks (```...```
    text = re.sub(r"```[\s\S]*?```", "", text)
    # Remove markdown headers and excess whitespace
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*.*?\*\*", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

@app.get("/get-insights")
async def get_insights():
    prompt = f"Analyze these expenses and provide insights: {json.dumps(expenses)}"
    raw = generate_llama_response(prompt)
    insights = clean_insights_text(raw)
    return {"insights": insights}

@app.post("/process-ai-input")
async def process_ai_input(input_data: AIInput):
    text = input_data.input.lower()
    current_balances = await get_ai_balances()

    if 'transfer' in text and 'hydra' in text and 'metamask' in text:
        try:
            amount_match = re.search(r'\$([\d.]+)', text)
            amount = float(amount_match.group(1)) if amount_match else 1.0
            if amount > current_balances["hydra"]["usd_value"]:
                return {"message": "Insufficient Hydra balance for transfer"}
            
            # Simulate Hedera transfer (replace with actual send_hbar call)
            to_account_id = os.getenv("METAMASK_ACCOUNT_ID", "0.0.123456")  # Dummy MetaMask account ID
            result = send_hbar(os.getenv("HEDERA_PRIVATE_KEY", ""), to_account_id, amount / 0.05)  # Convert USD to HBAR
            
            if "error" in result:
                return {"message": f"Transfer failed: {result['error']}"}
            
            updated_balances = {**current_balances}
            updated_balances["hydra"]["usd_value"] -= amount
            updated_balances["hydra"]["balance_hbar"] -= amount / 0.05
            updated_balances["metamask"]["usd_value"] += amount
            updated_balances["metamask"]["balance_eth"] += amount / 2500  # Assume $2500/ETH
            updated_balances["total_usd_value"] = (
                updated_balances["hydra"]["usd_value"] +
                updated_balances["coinbase"]["balance_usd"] +
                updated_balances["metamask"]["usd_value"]
            )
            
            previous_balances["hydra"] = updated_balances["hydra"]["usd_value"]
            previous_balances["metamask"] = updated_balances["metamask"]["usd_value"]
            previous_balances["total_usd_value"] = updated_balances["total_usd_value"]
            
            return {
                "action": "transfer",
                "details": f"${amount} transferred from Hydra to MetaMask",
                "updatedBalances": updated_balances
            }
        except Exception as e:
            return {"message": f"Transfer failed: {str(e)}"}
    
    elif 'expense' in text:
        try:
            amount_match = re.search(r'\$([\d.]+)', text)
            amount = float(amount_match.group(1)) if amount_match else 10.0
            category = re.search(r'(food|travel|other)', text) or 'other'
            category = category.group(1) if category else 'Other'
            description_match = re.search(r'for\s+([a-zA-Z\s]+)', text)
            description = description_match.group(1).strip() if description_match else 'General expense'
            
            expense = {
                "id": len(expenses) + 1,
                "amount": amount,
                "category": category.capitalize(),
                "description": description,
                "date": date.today().isoformat()
            }
            expenses.append(expense)
            return {"action": "expense", "expense": expense}
        except Exception as e:
            return {"message": f"Failed to log expense: {str(e)}"}
    
    elif 'insights' in text:
        prompt = f"Analyze these expenses and provide insights: {json.dumps(expenses)}"
        raw = generate_llama_response(prompt)
        insights = clean_insights_text(raw)
        return {"action": "insights", "insights": insights}
    
    else:
        return {"message": "Command not recognized. Try 'transfer $1 from Hydra to MetaMask', 'log $10 food expense for lunch', or 'generate insights'."}

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
    prompt = "Give me practical tips for investing or using Hedera (HBAR) cryptocurrency."
    return {"tips": generate_llama_response(prompt)}

@app.get("/hedera/news")
def get_hedera_news():
    prompt = "Give me the latest Hedera (HBAR) related crypto news headlines with short summaries."
    return {"news": generate_llama_response(prompt)}

app.include_router(api_router)

@app.get("/")
async def root():
    return {"msg": "Web3 + Groq (LLaMA) + Hedera Backend Running"}
@app.get("/")
async def root():
    return {"msg": "Web3 + Groq (LLaMA) + Hedera Backend Running"}
    return {"msg": "Web3 + Groq (LLaMA) + Hedera Backend Running"}
