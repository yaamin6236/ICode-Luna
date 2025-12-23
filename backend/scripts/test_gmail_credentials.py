"""
Test script to verify Gmail credentials can be loaded from files.
Run this locally before deploying to Railway.
"""

import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.gmail_service import gmail_service

def test_authentication():
    """Test Gmail API authentication"""
    print("=" * 60)
    print("Testing Gmail API Authentication")
    print("=" * 60)
    print()
    
    try:
        print("[INFO] Attempting to authenticate with Gmail API...")
        service = gmail_service.get_service()
        
        if service:
            print("[OK] Successfully authenticated with Gmail API!")
            print()
            
            # Test listing labels
            print("[INFO] Testing label access...")
            results = service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            
            print(f"[OK] Found {len(labels)} labels in Gmail account")
            print()
            
            # Look for specific label
            target_label = "Leads/Bright Horizons"
            print(f"[INFO] Looking for label: {target_label}")
            
            label_id = gmail_service.get_label_id(target_label)
            if label_id:
                print(f"[OK] Found label! ID: {label_id}")
            else:
                print(f"[WARN] Label '{target_label}' not found. Available labels:")
                for label in labels[:10]:  # Show first 10
                    print(f"  - {label['name']}")
            
            print()
            print("=" * 60)
            print("✅ All tests passed! Gmail authentication is working!")
            print("=" * 60)
            return True
            
    except FileNotFoundError as e:
        print(f"[ERROR] {e}")
        print()
        print("Solution:")
        print("1. Make sure credentials.json and token.json exist in backend/")
        print("2. Or set GMAIL_CREDENTIALS_BASE64 and GMAIL_TOKEN_BASE64 env vars")
        return False
        
    except Exception as e:
        print(f"[ERROR] Authentication failed: {e}")
        print()
        print("Check:")
        print("1. credentials.json is valid")
        print("2. token.json is not expired")
        print("3. Gmail API is enabled in Google Cloud Console")
        return False

if __name__ == "__main__":
    success = test_authentication()
    sys.exit(0 if success else 1)

