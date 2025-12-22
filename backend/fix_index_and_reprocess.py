"""
Drop unique index on emailId and reprocess.
"""

import asyncio
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection, get_database
from app.services.gmail_service import gmail_service
from app.services.pubsub_handler import pubsub_handler
from app.config import get_settings

settings = get_settings()


async def fix_and_reprocess():
    """Drop unique index and reprocess"""
    await connect_to_mongodb()
    db = get_database()
    
    print("\n[INFO] Fixing MongoDB index for multi-child support...")
    
    # Drop the unique index on emailId
    try:
        await db.registrations.drop_index("emailId_1")
        print("[OK] Dropped unique index on emailId")
    except Exception as e:
        print(f"[INFO] No unique index to drop (or already removed): {e}")
    
    # Clear database
    print("\n[INFO] Clearing existing data...")
    r1 = await db.registrations.delete_many({})
    r2 = await db.unparsed_emails.delete_many({})
    print(f"[OK] Deleted {r1.deleted_count} registrations, {r2.deleted_count} unparsed emails")
    
    # Create a regular (non-unique) index on emailId for performance
    await db.registrations.create_index("emailId")
    print("[OK] Created non-unique index on emailId for performance\n")
    
    # Fetch all emails
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
        if i % 50 == 0:  # Progress update every 50 emails
            print(f"\n[PROGRESS] Processed {i}/{len(message_ids)} emails, {total_registrations} registrations created\n")
        
        try:
            result = await pubsub_handler.process_email(message_id)
            if result:
                num_children = len(result)
                emails_processed += 1
                total_registrations += num_children
                if num_children > 1:
                    print(f"[{i}/{len(message_ids)}] {message_id}: {num_children} CHILDREN!")
            else:
                skipped += 1
        except Exception as e:
            failed += 1
            print(f"[{i}/{len(message_ids)}] ERROR: {e}")
    
    print(f"\n\n" + "="*60)
    print("FINAL SUMMARY")
    print("="*60)
    print(f"Total Emails Processed: {len(message_ids)}")
    print(f"Emails with Registrations: {emails_processed}")
    print(f"Total Children Registered: {total_registrations}")
    print(f"Skipped (unparsable): {skipped}")
    print(f"Failed: {failed}")
    print("="*60)
    
    await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(fix_and_reprocess())

