"""
Analytics endpoints for revenue tracking and capacity management.
"""

from fastapi import APIRouter, Query, Depends
from typing import List, Dict
from datetime import datetime, timedelta
from collections import defaultdict

from ..db.mongodb import get_database
from ..models.registration import RegistrationStatus
from ..utils.clerk_auth import verify_clerk_token, ClerkUser

router = APIRouter()


@router.get("/revenue")
async def get_revenue_analytics(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: ClerkUser = Depends(verify_clerk_token)
):
    """
    Get revenue analytics for a date range.
    
    Returns:
    - Total revenue
    - Total paid
    - Outstanding balance
    - Revenue by date
    - Revenue by camp type
    """
    db = get_database()
    
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    query = {
        "status": RegistrationStatus.ENROLLED.value,
        "enrollmentDate": {"$gte": start_date, "$lte": end_date}
    }
    
    registrations = await db.registrations.find(query).to_list(length=10000)
    
    total_cost = 0
    total_paid = 0
    revenue_by_date = defaultdict(float)
    revenue_by_camp_type = defaultdict(float)
    
    for reg in registrations:
        cost = float(reg.get("totalCost", 0) or 0)
        paid = float(reg.get("amountPaid", 0) or 0)
        
        total_cost += cost
        total_paid += paid
        
        # Group by enrollment date
        enrollment_date = reg.get("enrollmentDate")
        if enrollment_date:
            date_key = enrollment_date.strftime("%Y-%m-%d")
            revenue_by_date[date_key] += cost
        
        # Group by camp type
        camp_type = reg.get("campType", "Unknown")
        revenue_by_camp_type[camp_type] += cost
    
    return {
        "totalRevenue": total_cost,
        "totalPaid": total_paid,
        "outstandingBalance": total_cost - total_paid,
        "dateRange": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "revenueByDate": dict(revenue_by_date),
        "revenueByCampType": dict(revenue_by_camp_type),
        "registrationCount": len(registrations)
    }


@router.get("/daily-capacity")
async def get_daily_capacity(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: ClerkUser = Depends(verify_clerk_token)
):
    """
    Get daily enrollment capacity for calendar view.
    
    Returns enrollment count per day for active registrations.
    """
    db = get_database()
    
    # Default to next 60 days if no dates provided
    if not start_date:
        start_date = datetime.utcnow()
    if not end_date:
        end_date = start_date + timedelta(days=60)
    
    # Find all enrolled registrations
    registrations = await db.registrations.find({
        "status": RegistrationStatus.ENROLLED.value
    }).to_list(length=10000)
    
    # Count enrollments per day
    daily_counts = defaultdict(int)
    daily_registrations = defaultdict(list)
    
    for reg in registrations:
        camp_dates = reg.get("campDates", [])
        for camp_date in camp_dates:
            if start_date <= camp_date <= end_date:
                date_key = camp_date.strftime("%Y-%m-%d")
                daily_counts[date_key] += 1
                daily_registrations[date_key].append({
                    "childName": reg.get("childName"),
                    "parentName": reg.get("parentName"),
                    "campType": reg.get("campType")
                })
    
    # Format response
    capacity_data = []
    current = start_date
    while current <= end_date:
        date_key = current.strftime("%Y-%m-%d")
        capacity_data.append({
            "date": date_key,
            "count": daily_counts.get(date_key, 0),
            "registrations": daily_registrations.get(date_key, [])
        })
        current += timedelta(days=1)
    
    return {
        "dateRange": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "capacityData": capacity_data
    }


@router.get("/cancellations")
async def get_cancellation_stats(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: ClerkUser = Depends(verify_clerk_token)
):
    """
    Get cancellation statistics and trends.
    """
    db = get_database()
    
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    query = {
        "status": RegistrationStatus.CANCELLED.value,
        "cancellationDate": {"$gte": start_date, "$lte": end_date}
    }
    
    cancellations = await db.registrations.find(query).to_list(length=10000)
    
    cancellation_by_date = defaultdict(int)
    total_lost_revenue = 0
    
    for cancel in cancellations:
        cancel_date = cancel.get("cancellationDate")
        if cancel_date:
            date_key = cancel_date.strftime("%Y-%m-%d")
            cancellation_by_date[date_key] += 1
        
        cost = float(cancel.get("totalCost", 0) or 0)
        paid = float(cancel.get("amountPaid", 0) or 0)
        total_lost_revenue += (cost - paid)
    
    return {
        "totalCancellations": len(cancellations),
        "lostRevenue": total_lost_revenue,
        "dateRange": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "cancellationsByDate": dict(cancellation_by_date)
    }


@router.get("/dashboard-summary")
async def get_dashboard_summary(current_user: ClerkUser = Depends(verify_clerk_token)):
    """
    Get summary statistics for dashboard KPI cards.
    """
    db = get_database()
    
    # Total active registrations
    total_enrolled = await db.registrations.count_documents({
        "status": RegistrationStatus.ENROLLED.value
    })
    
    # All-time revenue from enrolled
    all_enrolled = await db.registrations.find({
        "status": RegistrationStatus.ENROLLED.value
    }).to_list(length=100000)
    
    enrolled_revenue = sum(float(reg.get("totalCost", 0) or 0) for reg in all_enrolled)
    
    # All-time lost revenue from cancellations
    all_cancelled = await db.registrations.find({
        "status": RegistrationStatus.CANCELLED.value
    }).to_list(length=100000)
    
    cancelled_revenue = sum(float(reg.get("totalCost", 0) or 0) for reg in all_cancelled)
    
    # Net revenue = enrolled - cancelled
    net_revenue = enrolled_revenue - cancelled_revenue
    
    # Total paid across all enrolled
    total_paid = sum(float(reg.get("amountPaid", 0) or 0) for reg in all_enrolled)
    
    # Upcoming camps (next 7 days)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days = today + timedelta(days=7)
    
    upcoming_registrations = await db.registrations.find({
        "status": RegistrationStatus.ENROLLED.value,
        "campDates": {
            "$elemMatch": {
                "$gte": today,
                "$lte": seven_days
            }
        }
    }).to_list(length=10000)
    
    # Recent cancellations (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_cancellations = await db.registrations.count_documents({
        "status": RegistrationStatus.CANCELLED.value,
        "cancellationDate": {"$gte": thirty_days_ago}
    })
    
    return {
        "totalEnrolled": total_enrolled,
        "totalEnrolledRevenue": enrolled_revenue,
        "totalCancelledRevenue": cancelled_revenue,
        "netRevenue": net_revenue,
        "totalRevenue30Days": net_revenue,  # Keep for backward compatibility
        "totalPaid": total_paid,
        "outstandingBalance": enrolled_revenue - total_paid,
        "upcomingCampsCount": len(upcoming_registrations),
        "recentCancellations": recent_cancellations
    }

