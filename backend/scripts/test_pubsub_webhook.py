"""
Test script to simulate Pub/Sub notifications locally.
This tests the webhook handler without needing a live server.
"""

import asyncio
import json
import base64

# Simulate a Pub/Sub notification
async def test_pubsub_notification():
    """Test processing a simulated Pub/Sub notification"""
    from app.services.pubsub_handler import pubsub_handler
    
    print("=" * 60)
    print("Testing Pub/Sub Notification Handler")
    print("=" * 60)
    print()
    
    # Create a test notification (what Google Pub/Sub sends)
    test_notification = {
        "message": {
            "data": base64.b64encode(json.dumps({
                "emailAddress": "test@example.com",
                "historyId": "12345"
            }).encode()).decode(),
            "messageId": "test-message-123",
            "publishTime": "2025-12-23T12:00:00Z"
        },
        "subscription": "projects/orbital-avatar-454314-u8/subscriptions/gmail-push-subscription"
    }
    
    print("[INFO] Simulating Pub/Sub notification:")
    print(json.dumps(test_notification, indent=2))
    print()
    
    try:
        print("[INFO] Processing notification...")
        result = await pubsub_handler.process_notification(test_notification)
        
        print("[OK] Notification processed successfully!")
        print(f"Result: {json.dumps(result, indent=2)}")
        print()
        print("=" * 60)
        print("✅ Pub/Sub handler test passed!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to process notification: {e}")
        print()
        print("=" * 60)
        print("❌ Pub/Sub handler test failed!")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = asyncio.run(test_pubsub_notification())
    exit(0 if success else 1)

