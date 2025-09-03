import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://dysaqwpotjmebytbfooe.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5c2Fxd3BvdGptZWJ5dGJmb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjEyMDksImV4cCI6MjA3MjQ5NzIwOX0.XhxaghbAiR_PvGyQOhriPEPhMrFJIhSGfcRblNheNR4")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def google_login():
    try:
        # Use options to specify redirect URL
        user = supabase.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {
                "redirect_to": "http://localhost:5173/wallet"
            }
        })
        print(f"Google OAuth initiated, redirecting to: http://localhost:5173/wallet")
        return user
    except Exception as e:
        print(f"Error logging in user with Google: {e}")
        return None