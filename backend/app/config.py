from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB Configuration
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "icode_portal"
    
    # JWT Configuration (legacy - keeping for compatibility)
    secret_key: str = "fallback-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Clerk Authentication
    clerk_secret_key: str = ""
    
    # Gmail API Configuration
    gmail_credentials_path: str = "credentials.json"
    gmail_token_path: str = "token.json"
    gmail_label_name: str = "BrightHorizon"
    
    # Gmail API Credentials (Base64 encoded JSON - for cloud deployment)
    gmail_credentials_base64: str = ""
    gmail_token_base64: str = ""
    
    # Gmail OAuth Credentials (Individual values - cleaner for cloud deployment)
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_refresh_token: str = ""
    gmail_user_email: str = ""
    
    # Google Cloud Pub/Sub
    pubsub_verification_token: str = ""
    
    # Application Configuration
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()

