import supabase
def google_login():
    try:
        user = supabase.auth.sign_in_with_oauth({
            "provider": "google",
            "redirect_to": "http://localhost:5173/wallet"  # Redirect to wallet page after login
        })
        return user
    except Exception as e:
        print(f"Error logging in user with Google: {e}")
        return None
    
    # TO DO:  replace the url and key variables with your actual Supabase project URL and anon key.