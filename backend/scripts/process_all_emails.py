"""
Script to bulk process all existing emails from Gmail label.
"""

import asyncio
from app.services.gmail_service import gmail_service
from app.services.pubsub_handler import pubsub_handler
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection
from app.config import get_settings

settings = get_settings()


async def process_all_emails():
    """Process all emails from the configured Gmail label"""
    await connect_to_mongodb()
    
    print(f"\n=== EMAIL IMPORT CONFIGURATION ===")
    print(f"Gmail Label: {settings.gmail_label_name}")
    print(f"MongoDB Database: {settings.mongodb_db_name}")
    print(f"Max Results: 10000 (will paginate)")
    print(f"==================================\n")
    
    print(f"[INFO] Fetching emails from label: {settings.gmail_label_name}")
    
    # Get all message IDs from the label
    message_ids = gmail_service.list_messages(
        label_name=settings.gmail_label_name,
        max_results=10000  # Process all emails
    )
    
    print(f"[INFO] Found {len(message_ids)} emails to process\n")
    
    processed = 0
    total_children = 0
    failed = 0
    skipped = 0
    
    for i, message_id in enumerate(message_ids, 1):
        print(f"Processing {i}/{len(message_ids)}: {message_id}")
        
        try:
            result = await pubsub_handler.process_email(message_id)
            if result:
                processed += 1
                num_children = len(result.get('children', []))
                total_children += num_children
                print(f"  [OK] Processed ({num_children} {'child' if num_children == 1 else 'children'})")
            else:
                skipped += 1
                print(f"  [SKIP] Skipped (already processed or failed parsing)")
        except Exception as e:
            failed += 1
            print(f"  [ERROR] Error: {e}")
    
    print(f"\n=== Summary ===")
    print(f"Total Emails: {len(message_ids)}")
    print(f"Emails Processed: {processed}")
    print(f"Total Children Registered: {total_children}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    
    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(process_all_emails())

