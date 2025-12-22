"""
Inspect the 4 unparsed emails to understand why they failed.
"""

import asyncio
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection, get_database

async def inspect_unparsed():
    await connect_to_mongodb()
    db = get_database()
    
    print(f"Fetching all unparsed emails...\n")
    
    unparsed = []
    async for doc in db.unparsed_emails.find():
        unparsed.append(doc)
    
    print(f"Found {len(unparsed)} unparsed emails\n")
    print("="*80)
    
    for i, email in enumerate(unparsed, 1):
        print(f"\nUNPARSED EMAIL #{i}")
        print(f"Email ID: {email.get('emailId')}")
        print(f"Subject: {email.get('subject')}")
        print(f"Reason: {email.get('reason')}")
        print(f"Date: {email.get('receivedDate')}")
        print("="*80)
        
        body = email.get('body', '')
        print(f"\nFull Email Body:")
        print(body)
        print("\n" + "="*80)
    
    await close_mongodb_connection()

if __name__ == "__main__":
    asyncio.run(inspect_unparsed())

