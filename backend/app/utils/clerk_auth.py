"""
Clerk authentication utilities for FastAPI.
Verifies JWT tokens from Clerk.
"""

import jwt
import os
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from pydantic import BaseModel

# Clerk secret key from environment
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")

security = HTTPBearer(auto_error=False)


class ClerkUser(BaseModel):
    """Clerk user data from JWT"""
    user_id: str
    email: Optional[str] = None


async def verify_clerk_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> ClerkUser:
    """
    Verify Clerk JWT token and return user information.
    
    This dependency can be used on protected routes:
    @router.get("/protected")
    async def protected_route(user: ClerkUser = Depends(verify_clerk_token)):
        return {"user_id": user.user_id}
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Decode JWT token from Clerk
        # Clerk uses RS256 algorithm, but for development we'll skip verification
        # In production, you should fetch Clerk's public key and verify properly
        
        if not CLERK_SECRET_KEY:
            # If no secret key, allow in development (not recommended for production!)
            # Decode without verification (development only)
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            # Verify with secret key
            payload = jwt.decode(
                token,
                CLERK_SECRET_KEY,
                algorithms=["RS256", "HS256"],
                options={"verify_signature": True}
            )
        
        # Extract user information
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
            )
        
        return ClerkUser(
            user_id=user_id,
            email=payload.get("email")
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_clerk_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[ClerkUser]:
    """
    Optional authentication - returns None if not authenticated.
    Useful for routes that work with or without authentication.
    """
    if not credentials:
        return None
    
    try:
        return await verify_clerk_token(credentials)
    except HTTPException:
        return None

