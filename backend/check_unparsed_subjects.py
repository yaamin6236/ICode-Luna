"""
Check subjects of unparsed emails.
"""

import asyncio
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection, get_database

async def check():
    await connect_to_mongodb()
    db = get_database()
    
    unparsed = []
    async for doc in db.unparsed_emails.find():
        unparsed.append(doc)
    
    print(f'Total unparsed: {len(unparsed)}\n')
    
    for i, e in enumerate(unparsed, 1):
        print(f'{i}. Email ID: {e.get("emailId")}')
        print(f'   Subject: {e.get("subject")}')
        print(f'   Reason: {e.get("reason")}')
        print()
    
    await close_mongodb_connection()

if __name__ == "__main__":
    asyncio.run(check())

