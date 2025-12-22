"""
Authentication endpoints for staff login.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..models.registration import Token, User
from ..utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from ..config import get_settings
from ..db.mongodb import get_database

settings = get_settings()
router = APIRouter()


# Temporary in-memory user store for demo
# In production, this should be in MongoDB with proper user management
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "email": "admin@icode.com",
        "full_name": "Admin User",
        "hashed_password": get_password_hash("admin123"),  # Change in production!
        "disabled": False
    }
}


async def get_user(username: str):
    """Get user from database"""
    # For demo purposes, using in-memory store
    # In production, query from MongoDB
    if username in DEMO_USERS:
        user_dict = DEMO_USERS[username]
        return user_dict
    return None


async def authenticate_user(username: str, password: str):
    """Authenticate a user"""
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint for staff authentication.
    
    Default credentials (change in production):
    - Username: admin
    - Password: admin123
    """
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def read_users_me(current_user = Depends(get_current_user)):
    """Get current user information"""
    user = await get_user(current_user.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        username=user["username"],
        email=user["email"],
        full_name=user.get("full_name"),
        disabled=user.get("disabled", False)
    )

