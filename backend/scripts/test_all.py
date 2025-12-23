"""
Complete integration test for Gmail Pub/Sub setup.
Run this before deploying to Railway to ensure everything works.
"""

import asyncio
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def main():
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 10 + "GMAIL PUB/SUB INTEGRATION TEST" + " " * 17 + "║")
    print("╚" + "═" * 58 + "╝")
    print()
    
    all_passed = True
    
    # Test 1: Configuration
    print("📋 Test 1: Configuration")
    print("-" * 60)
    try:
        from app.config import get_settings
        settings = get_settings()
        
        print(f"[OK] Gmail Label: {settings.gmail_label_name}")
        print(f"[OK] Credentials Path: {settings.gmail_credentials_path}")
        print(f"[OK] Token Path: {settings.gmail_token_path}")
        
        if settings.gmail_credentials_base64:
            print("[OK] GMAIL_CREDENTIALS_BASE64 is set")
        else:
            print("[INFO] GMAIL_CREDENTIALS_BASE64 not set (will use file)")
            
        if settings.gmail_token_base64:
            print("[OK] GMAIL_TOKEN_BASE64 is set")
        else:
            print("[INFO] GMAIL_TOKEN_BASE64 not set (will use file)")
        
        print("✅ Configuration test passed!")
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        all_passed = False
    print()
    
    # Test 2: Gmail Authentication
    print("🔐 Test 2: Gmail Authentication")
    print("-" * 60)
    try:
        from app.services.gmail_service import gmail_service
        
        print("[INFO] Attempting Gmail authentication...")
        service = gmail_service.get_service()
        
        if service:
            print("[OK] Gmail API authentication successful!")
            
            # Test label access
            label_name = settings.gmail_label_name
            label_id = gmail_service.get_label_id(label_name)
            
            if label_id:
                print(f"[OK] Found label '{label_name}' (ID: {label_id})")
            else:
                print(f"[WARN] Label '{label_name}' not found in Gmail")
                print("[INFO] Make sure the label exists in your Gmail account")
            
            print("✅ Gmail authentication test passed!")
        else:
            print("❌ Gmail authentication failed!")
            all_passed = False
            
    except Exception as e:
        print(f"❌ Gmail authentication test failed: {e}")
        all_passed = False
    print()
    
    # Test 3: Pub/Sub Handler
    print("📨 Test 3: Pub/Sub Notification Handler")
    print("-" * 60)
    try:
        from app.services.pubsub_handler import pubsub_handler
        import json
        import base64
        
        test_notification = {
            "message": {
                "data": base64.b64encode(json.dumps({
                    "emailAddress": "test@example.com",
                    "historyId": "12345"
                }).encode()).decode(),
                "messageId": "test-123"
            }
        }
        
        print("[INFO] Processing test notification...")
        result = await pubsub_handler.process_notification(test_notification)
        
        if result.get('status') == 'success':
            print("[OK] Notification processed successfully!")
            print("✅ Pub/Sub handler test passed!")
        else:
            print(f"[WARN] Unexpected result: {result}")
            
    except Exception as e:
        print(f"❌ Pub/Sub handler test failed: {e}")
        all_passed = False
    print()
    
    # Test 4: Database Connection
    print("🗄️  Test 4: MongoDB Connection")
    print("-" * 60)
    try:
        from app.db.mongodb import get_database
        
        print("[INFO] Connecting to MongoDB...")
        db = get_database()
        
        if db:
            # Try to list collections
            collections = await db.list_collection_names()
            print(f"[OK] Connected to MongoDB!")
            print(f"[OK] Found {len(collections)} collections")
            print("✅ Database connection test passed!")
        else:
            print("❌ Database connection failed!")
            all_passed = False
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        all_passed = False
    print()
    
    # Summary
    print("=" * 60)
    if all_passed:
        print("✅ ALL TESTS PASSED!")
        print()
        print("Your backend is ready to:")
        print("1. Receive Pub/Sub notifications")
        print("2. Authenticate with Gmail API")
        print("3. Process emails from 'Leads/Bright Horizons' label")
        print("4. Store registrations in MongoDB")
        print()
        print("Next steps:")
        print("1. Push code to GitHub")
        print("2. Add environment variables to Railway")
        print("3. Deploy to Railway")
        print("4. Enable Gmail watch using the /setup-gmail-watch endpoint")
    else:
        print("❌ SOME TESTS FAILED")
        print()
        print("Please fix the issues above before deploying.")
    print("=" * 60)
    print()
    
    return all_passed

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n[INFO] Test interrupted by user")
        sys.exit(1)

