from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


class RegistrationStatus(str, Enum):
    ENROLLED = "enrolled"
    CANCELLED = "cancelled"


class RegistrationBase(BaseModel):
    status: RegistrationStatus
    enrollmentDate: datetime
    cancellationDate: Optional[datetime] = None
    
    # Child info
    childName: str
    childAge: Optional[int] = None
    
    # Parent info
    parentName: str
    parentEmail: EmailStr
    parentPhone: Optional[str] = None
    
    # Camp details
    campDates: List[datetime]
    campType: Optional[str] = None
    
    # Financial
    totalCost: Optional[Decimal] = None
    amountPaid: Optional[Decimal] = None


class RegistrationCreate(RegistrationBase):
    manualEntry: bool = True
    createdBy: Optional[str] = None


class RegistrationUpdate(BaseModel):
    status: Optional[RegistrationStatus] = None
    childName: Optional[str] = None
    childAge: Optional[int] = None
    parentName: Optional[str] = None
    parentEmail: Optional[EmailStr] = None
    parentPhone: Optional[str] = None
    campDates: Optional[List[datetime]] = None
    campType: Optional[str] = None
    totalCost: Optional[Decimal] = None
    amountPaid: Optional[Decimal] = None


class RegistrationInDB(RegistrationBase):
    id: str = Field(alias="_id")
    registrationId: str
    emailId: Optional[str] = None
    emailReceivedAt: Optional[datetime] = None
    parsedAt: Optional[datetime] = None
    rawEmailBody: Optional[str] = None
    manualEntry: bool = False
    createdBy: Optional[str] = None
    updatedAt: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v)
        }


class RegistrationResponse(RegistrationInDB):
    pass


class User(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    disabled: Optional[bool] = False


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None

