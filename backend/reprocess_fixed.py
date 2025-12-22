"""
Reprocess emails with correct single-document-per-email approach.
"""

import asyncio
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.gmail_service import gmail_service
from app.services.pubsub_handler import pubsub_handler
from app.config import get_settings

settings = get_settings()


async def reprocess():
    """Clear and reprocess all emails"""
    await connect_to_mongodb()
    db = get_database()
    
    print("\n[INFO] FIXED: One document per email with multiple children array")
    print("[INFO] Revenue: num_children × num_days × $100\n")
    
    # Clear database
    print("[INFO] Clearing database...")
    r1 = await db.registrations.delete_many({})
    r2 = await db.unparsed_emails.delete_many({})
    print(f"[OK] Deleted {r1.deleted_count} registrations, {r2.deleted_count} unparsed emails\n")
    
    # Fetch emails
    print(f"[INFO] Fetching emails from: {settings.gmail_label_name}")
    message_ids = gmail_service.list_messages(
        label_name=settings.gmail_label_name,
        max_results=10000
    )
    
    print(f"[INFO] Found {len(message_ids)} emails\n")
    print("=== Processing ===\n")
    
    processed = 0
    total_children = 0
    multi_child_emails = 0
    failed = 0
    skipped = 0
    
    for i, message_id in enumerate(message_ids, 1):
        if i % 100 == 0:
            print(f"\n[PROGRESS] {i}/{len(message_ids)} emails | {total_children} children total\n")
        
        try:
            result = await pubsub_handler.process_email(message_id)
            if result:
                processed += 1
                num_children = len(result.get('children', []))
                total_children += num_children
                
                if num_children > 1:
                    multi_child_emails += 1
                    children_names = ", ".join(result.get('children', []))
                    print(f"[{i}/{len(message_ids)}] MULTIPLE KIDS: {children_names}")
            else:
                skipped += 1
        except Exception as e:
            failed += 1
            print(f"[{i}/{len(message_ids)}] ERROR: {e}")
    
    print(f"\n\n{'='*70}")
    print("FINAL SUMMARY")
    print(f"{'='*70}")
    print(f"Total Emails: {len(message_ids)}")
    print(f"Successfully Processed: {processed}")
    print(f"Total Children Registered: {total_children}")
    print(f"Emails with Multiple Children: {multi_child_emails}")
    print(f"Skipped (unparsable): {skipped}")
    print(f"Failed: {failed}")
    print(f"{'='*70}\n")
    
    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(reprocess())

