"""
Test Gmail authentication using individual OAuth credentials.
This is the cleanest approach for cloud deployment.
"""

import os
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

def test_oauth_env_vars():
    """Test if OAuth environment variables are set"""
    print("=" * 60)
    print("Testing OAuth Environment Variables")
    print("=" * 60)
    print()
    
    from dotenv import load_dotenv
    load_dotenv()
    
    client_id = os.getenv('GMAIL_CLIENT_ID')
    client_secret = os.getenv('GMAIL_CLIENT_SECRET')
    refresh_token = os.getenv('GMAIL_REFRESH_TOKEN')
    user_email = os.getenv('GMAIL_USER_EMAIL')
    
    all_set = True
    
    if client_id:
        print(f"[OK] GMAIL_CLIENT_ID: {client_id[:20]}...")
    else:
        print("[ERROR] GMAIL_CLIENT_ID not set")
        all_set = False
    
    if client_secret:
        print(f"[OK] GMAIL_CLIENT_SECRET: {client_secret[:10]}...")
    else:
        print("[ERROR] GMAIL_CLIENT_SECRET not set")
        all_set = False
    
    if refresh_token:
        print(f"[OK] GMAIL_REFRESH_TOKEN: {refresh_token[:20]}...")
    else:
        print("[ERROR] GMAIL_REFRESH_TOKEN not set")
        all_set = False
    
    if user_email:
        print(f"[OK] GMAIL_USER_EMAIL: {user_email}")
    else:
        print("[ERROR] GMAIL_USER_EMAIL not set")
        all_set = False
    
    print()
    return all_set

def test_gmail_auth():
    """Test Gmail authentication"""
    print("=" * 60)
    print("Testing Gmail Authentication")
    print("=" * 60)
    print()
    
    try:
        from app.services.gmail_service import gmail_service
        from app.config import get_settings
        
        settings = get_settings()
        
        print("[INFO] Attempting to authenticate with Gmail API...")
        service = gmail_service.get_service()
        
        if service:
            print("[OK] Gmail API authentication successful!")
            print()
            
            # Test profile access
            print("[INFO] Testing Gmail profile access...")
            profile = service.users().getProfile(userId='me').execute()
            print(f"[OK] Authenticated as: {profile.get('emailAddress')}")
            print(f"[OK] Messages total: {profile.get('messagesTotal')}")
            print()
            
            # Test listing labels
            print("[INFO] Testing label access...")
            results = service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            print(f"[OK] Found {len(labels)} labels")
            print()
            
            # Look for target label
            target_label = settings.gmail_label_name
            print(f"[INFO] Looking for label: '{target_label}'...")
            label_id = gmail_service.get_label_id(target_label)
            
            if label_id:
                print(f"[OK] Found label! ID: {label_id}")
            else:
                print(f"[WARN] Label '{target_label}' not found")
                print("[INFO] Available labels (first 15):")
                for label in labels[:15]:
                    print(f"  - {label['name']}")
            
            print()
            return True
        else:
            print("[ERROR] Failed to authenticate")
            return False
            
    except Exception as e:
        print(f"[ERROR] Authentication failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 10 + "OAUTH CREDENTIALS TEST" + " " * 23 + "║")
    print("╚" + "═" * 58 + "╝")
    print()
    
    # Test 1: Check env vars
    env_ok = test_oauth_env_vars()
    
    if not env_ok:
        print("\n" + "=" * 60)
        print("❌ OAuth environment variables not set!")
        print("=" * 60)
        print()
        print("Add these to your backend/.env file:")
        print()
        print("GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com")
        print("GMAIL_CLIENT_SECRET=GOCSPX-your-secret")
        print("GMAIL_REFRESH_TOKEN=1//your-refresh-token")
        print("GMAIL_USER_EMAIL=your-email@example.com")
        print("GMAIL_LABEL_NAME=Leads/Bright Horizons")
        print()
        return False
    
    print()
    
    # Test 2: Try authentication
    auth_ok = test_gmail_auth()
    
    # Summary
    print("=" * 60)
    if auth_ok:
        print("✅ ALL TESTS PASSED!")
        print()
        print("OAuth credentials work perfectly!")
        print("Ready to deploy to Railway with these env vars.")
    else:
        print("❌ AUTHENTICATION FAILED")
        print()
        print("Check the errors above.")
    print("=" * 60)
    print()
    
    return auth_ok

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n[INFO] Test interrupted by user")
        sys.exit(1)

