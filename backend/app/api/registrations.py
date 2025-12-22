"""
CRUD endpoints for registration management.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ..models.registration import (
    RegistrationCreate,
    RegistrationUpdate,
    RegistrationResponse,
    RegistrationStatus
)
from ..db.mongodb import get_database
from ..utils.auth import get_current_user

router = APIRouter()


def registration_helper(registration) -> dict:
    """Helper to format registration document"""
    return {
        "id": str(registration["_id"]),
        "_id": str(registration["_id"]),
        "registrationId": registration.get("registrationId"),
        "status": registration.get("status"),
        "enrollmentDate": registration.get("enrollmentDate"),
        "cancellationDate": registration.get("cancellationDate"),
        "childName": registration.get("childName"),
        "childAge": registration.get("childAge"),
        "parentName": registration.get("parentName"),
        "parentEmail": registration.get("parentEmail"),
        "parentPhone": registration.get("parentPhone"),
        "campDates": registration.get("campDates", []),
        "campType": registration.get("campType"),
        "totalCost": float(registration.get("totalCost")) if registration.get("totalCost") else None,
        "amountPaid": float(registration.get("amountPaid")) if registration.get("amountPaid") else None,
        "emailId": registration.get("emailId"),
        "emailReceivedAt": registration.get("emailReceivedAt"),
        "parsedAt": registration.get("parsedAt"),
        "rawEmailBody": registration.get("rawEmailBody"),
        "manualEntry": registration.get("manualEntry", False),
        "createdBy": registration.get("createdBy"),
        "updatedAt": registration.get("updatedAt")
    }


@router.get("/", response_model=List[RegistrationResponse])
async def get_registrations(
    status: Optional[RegistrationStatus] = None,
    parent_email: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user = Depends(get_current_user)
):
    """
    Get all registrations with optional filters.
    
    Filters:
    - status: Filter by enrollment status
    - parent_email: Filter by parent email
    - start_date: Filter registrations from this date
    - end_date: Filter registrations until this date
    """
    db = get_database()
    query = {}
    
    if status:
        query["status"] = status.value
    
    if parent_email:
        query["parentEmail"] = {"$regex": parent_email, "$options": "i"}
    
    if start_date:
        query["enrollmentDate"] = {"$gte": start_date}
    
    if end_date:
        if "enrollmentDate" in query:
            query["enrollmentDate"]["$lte"] = end_date
        else:
            query["enrollmentDate"] = {"$lte": end_date}
    
    registrations = await db.registrations.find(query).skip(skip).limit(limit).sort("enrollmentDate", -1).to_list(length=limit)
    
    return [registration_helper(reg) for reg in registrations]


@router.get("/{registration_id}", response_model=RegistrationResponse)
async def get_registration(
    registration_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific registration by ID"""
    db = get_database()
    
    try:
        registration = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid registration ID format")
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return registration_helper(registration)


@router.post("/", response_model=RegistrationResponse, status_code=201)
async def create_registration(
    registration: RegistrationCreate,
    current_user = Depends(get_current_user)
):
    """
    Create a new registration manually.
    Used when staff needs to add registrations not from emails.
    """
    db = get_database()
    
    registration_doc = {
        "registrationId": f"MANUAL-{int(datetime.utcnow().timestamp())}",
        "status": registration.status.value,
        "enrollmentDate": registration.enrollmentDate,
        "cancellationDate": registration.cancellationDate,
        "childName": registration.childName,
        "childAge": registration.childAge,
        "parentName": registration.parentName,
        "parentEmail": registration.parentEmail,
        "parentPhone": registration.parentPhone,
        "campDates": registration.campDates,
        "campType": registration.campType,
        "totalCost": float(registration.totalCost) if registration.totalCost else None,
        "amountPaid": float(registration.amountPaid) if registration.amountPaid else None,
        "manualEntry": True,
        "createdBy": current_user.username,
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.registrations.insert_one(registration_doc)
    registration_doc["_id"] = result.inserted_id
    
    return registration_helper(registration_doc)


@router.put("/{registration_id}", response_model=RegistrationResponse)
async def update_registration(
    registration_id: str,
    registration_update: RegistrationUpdate,
    current_user = Depends(get_current_user)
):
    """Update an existing registration"""
    db = get_database()
    
    # Build update document
    update_data = {k: v for k, v in registration_update.dict(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Convert status enum to string if present
    if "status" in update_data:
        update_data["status"] = update_data["status"].value
    
    update_data["updatedAt"] = datetime.utcnow()
    
    try:
        result = await db.registrations.update_one(
            {"_id": ObjectId(registration_id)},
            {"$set": update_data}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid registration ID format")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    updated_registration = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    return registration_helper(updated_registration)


@router.delete("/{registration_id}")
async def delete_registration(
    registration_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete a registration (soft delete by setting status to cancelled).
    To permanently delete, use hard_delete=true query parameter.
    """
    db = get_database()
    
    try:
        # Soft delete - mark as cancelled
        result = await db.registrations.update_one(
            {"_id": ObjectId(registration_id)},
            {
                "$set": {
                    "status": RegistrationStatus.CANCELLED.value,
                    "cancellationDate": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid registration ID format")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {"status": "success", "message": "Registration cancelled"}


@router.get("/by-camp-date/", response_model=List[RegistrationResponse])
async def get_registrations_by_camp_date(
    camp_date: str = Query(..., description="Camp date to filter by (YYYY-MM-DD)"),
    status: Optional[RegistrationStatus] = None,
    current_user = Depends(get_current_user)
):
    """
    Get all registrations for a specific camp date.
    This queries the campDates array to find registrations with camps on the specified date.
    Optionally filter by status (enrolled/cancelled).
    """
    db = get_database()
    
    # Parse the date string and create date range for the entire day
    try:
        date_obj = datetime.strptime(camp_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Create start and end of day in UTC
    start_of_day = datetime.combine(date_obj.date(), datetime.min.time())
    end_of_day = datetime.combine(date_obj.date(), datetime.max.time())
    
    # Build query - campDates is an array of datetime objects
    query = {
        "campDates": {
            "$elemMatch": {
                "$gte": start_of_day,
                "$lte": end_of_day
            }
        }
    }
    
    # Add status filter if provided
    if status:
        query["status"] = status.value
    
    registrations = await db.registrations.find(query).sort("childName", 1).to_list(length=500)
    
    return [registration_helper(reg) for reg in registrations]


@router.get("/search/by-child/{child_name}")
async def search_by_child_name(
    child_name: str,
    current_user = Depends(get_current_user)
):
    """Search registrations by child name (fuzzy search)"""
    db = get_database()
    
    registrations = await db.registrations.find({
        "childName": {"$regex": child_name, "$options": "i"}
    }).to_list(length=100)
    
    return [registration_helper(reg) for reg in registrations]

