import os
from supabase import create_client, Client

# Use environment variables with fallback for development
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://dysaqwpotjmebytbfooe.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5c2Fxd3BvdGptZWJ5dGJmb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjEyMDksImV4cCI6MjA3MjQ5NzIwOX0.XhxaghbAiR_PvGyQOhriPEPhMrFJIhSGfcRblNheNR4")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def login_user(email: str, password: str):
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return {"session": response.session, "user": response.user}
    except Exception as e:
        print(f"Error logging in user: {e}")
        return None

def signup_user(email: str, password: str):
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        return {"user": response.user}
    except Exception as e:
        print(f"Error signing up user: {e}")
        return None

def get_google_oauth_url(redirect_url: str = "http://localhost:5173/wallet"):
    # Generate Google OAuth URL with redirect URL
    params = {
        "provider": "google",
        "redirect_to": redirect_url,
    }
    return f"{SUPABASE_URL}/auth/v1/authorize?{('&'.join([f'{k}={v}' for k, v in params.items()]))}"