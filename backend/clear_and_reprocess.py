"""
Clear database and reprocess all emails with fixed parser.
"""

import asyncio
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.gmail_service import gmail_service
from app.services.pubsub_handler import pubsub_handler
from app.config import get_settings

settings = get_settings()


async def clear_and_reprocess():
    """Clear database and reprocess all emails"""
    await connect_to_mongodb()
    db = get_database()
    
    # Clear database
    print("\n[INFO] CRITICAL FIX APPLIED:")
    print("  - Now captures ALL children per email")
    print("  - Revenue: $100/day per child (was $50/hour)\n")
    
    print("[INFO] Clearing database...")
    r1 = await db.registrations.delete_many({})
    r2 = await db.unparsed_emails.delete_many({})
    print(f"[OK] Deleted {r1.deleted_count} registrations, {r2.deleted_count} unparsed emails\n")
    
    # Fetch all message IDs
    print(f"[INFO] Fetching emails from label: {settings.gmail_label_name}")
    message_ids = gmail_service.list_messages(
        label_name=settings.gmail_label_name,
        max_results=10000
    )
    
    print(f"[INFO] Retrieved {len(message_ids)} emails\n")
    print("=== Starting Reprocessing ===\n")
    
    emails_processed = 0
    total_registrations = 0
    failed = 0
    skipped = 0
    
    for i, message_id in enumerate(message_ids, 1):
        print(f"Processing {i}/{len(message_ids)}: {message_id}")
        
        try:
            result = await pubsub_handler.process_email(message_id)
            if result:
                num_children = len(result)
                emails_processed += 1
                total_registrations += num_children
                print(f"  [OK] Created {num_children} registration(s)")
            else:
                skipped += 1
                print(f"  [SKIP] Skipped (failed parsing)")
        except Exception as e:
            failed += 1
            print(f"  [ERROR] Error: {e}")
    
    print(f"\n=== FINAL SUMMARY ===")
    print(f"Total Emails: {len(message_ids)}")
    print(f"Emails Processed: {emails_processed}")
    print(f"Total Registrations Created: {total_registrations}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    
    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(clear_and_reprocess())

