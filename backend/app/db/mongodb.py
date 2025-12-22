from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from ..config import get_settings

settings = get_settings()


class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


mongodb = MongoDB()


async def connect_to_mongodb():
    """Connect to MongoDB and create indexes"""
    mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
    mongodb.db = mongodb.client[settings.mongodb_db_name]
    
    # Create indexes for registrations collection
    registrations_collection = mongodb.db.registrations
    await registrations_collection.create_index("parentEmail")
    await registrations_collection.create_index("campDates")
    await registrations_collection.create_index("status")
    await registrations_collection.create_index("enrollmentDate")
    await registrations_collection.create_index("emailId", unique=True, sparse=True)
    
    print(f"[OK] Connected to MongoDB: {settings.mongodb_db_name}")


async def close_mongodb_connection():
    """Close MongoDB connection"""
    if mongodb.client:
        mongodb.client.close()
        print("[OK] Closed MongoDB connection")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return mongodb.db

