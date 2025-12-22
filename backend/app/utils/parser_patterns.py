"""
Regex patterns for parsing Bright Horizons Back-Up Care emails.
These patterns extract structured data from plain text emails.
"""

import re
from typing import Dict, List, Optional
from datetime import datetime

# Bright Horizons specific patterns
PATTERNS = {
    # Care Request
    "care_request_number": r"Care Request Number:\s*([A-Z0-9\-]+)",
    
    # Child/Recipient information (two formats: cancellation and authorization)
    # Format 1: Cancellation - "Care Recipient(s):\nElizabeth Ellis\nFemale, 9 Years"
    "child_name_simple": r"Care Recipient\(s\):\s*\n([A-Za-z\s]+)\n",
    # Format 2: Authorization - "Name: Saahithi Pola"
    "child_name_detailed": r"(?:Care Recipient.*?)?Name:\s*([A-Za-z\s]+)",
    
    "child_gender": r"(Male|Female),",
    "child_dob": r"DOB:\s*([A-Za-z]+\s+\d+,\s*\d{4})",
    "child_age": r"(\d+)\s*Years?\s*\d*\s*months?",
    
    # Parent/Employee information
    "parent_name": r"Scheduled Care for Employee:\s*([A-Za-z\s]+?)(?:\(|$)",
    "parent_email": r"(?:Email:|kapola@|kalyani\.pola@)([\w\.-]+@[\w\.-]+\.\w+)",
    "parent_phone": r"(?:Home Phone|Mobile Phone):\s*([\d]+)",
    "employer": r"Employer:\s*([A-Za-z\s]+)",
    
    # Date parsing - two formats
    # Format 1: Simple cancellation "Date of Care: December 23,2025 - December 23,2025"
    "date_range": r"Date of Care:\s*(\w+\s+\d+,\d{4})\s*-\s*(\w+\s+\d+,\d{4})",
    
    # Format 2: Detailed with times "December 22, 2025\n09:00 AM - 05:00 PM - 8 hours - Confirmed"
    "care_dates_detailed": r"(\w+\s+\d+,\s+\d{4})\s+(\d{2}:\d{2}\s+[AP]M)\s*-\s*(\d{2}:\d{2}\s+[AP]M)\s*-\s*(\d+)\s*hours?\s*-\s*(Confirmed|Cancelled)",
    
    # Format 3: Inline cancellation "Female, 9 Years 6 months, 09:00 AM - 05:00 PM - Cancelled"
    "inline_time": r"(\d{2}:\d{2}\s+[AP]M)\s*-\s*(\d{2}:\d{2}\s+[AP]M)\s*-\s*(Cancelled|Confirmed)",
    
    # Status
    "cancellation": r"(?:cancellation|Cancelled)",
    "authorization": r"(?:authorized|Confirmed)",
    
    # Location
    "location": r"Care Location:\s*([^\n]+)",
}


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse date string into datetime object"""
    if not date_str:
        return None
    
    date_str = date_str.strip()
    
    date_formats = [
        "%B %d, %Y",   # December 29, 2025
        "%B %d,%Y",    # December 23,2025 (no space after comma)
        "%b %d, %Y",   # Dec 29, 2025
        "%b %d,%Y",    # Dec 23,2025
        "%m/%d/%Y",
        "%m-%d-%Y",
        "%Y-%m-%d",
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    return None


def parse_care_dates(email_text: str) -> List[tuple]:
    """
    Parse multiple care dates from email.
    Returns list of tuples: (date, start_time, end_time, hours, status)
    """
    pattern = r"(\w+\s+\d+,\s+\d{4})\s+(\d{2}:\d{2}\s+[AP]M)\s*-\s*(\d{2}:\d{2}\s+[AP]M)\s*-\s*(\d+)\s*hours?\s*-\s*(Confirmed|Cancelled)"
    matches = re.findall(pattern, email_text, re.MULTILINE)
    return matches


def extract_all_dates(email_text: str) -> List[datetime]:
    """Extract all care dates from the email"""
    dates = []
    
    # Try detailed format first (with hours)
    care_dates = parse_care_dates(email_text)
    for date_str, _, _, _, _ in care_dates:
        parsed = parse_date(date_str)
        if parsed:
            dates.append(parsed)
    
    # If no detailed dates found, try simple date range format
    if not dates:
        date_range_pattern = r"Date of Care:\s*(\w+\s+\d+,\d{4})\s*-\s*(\w+\s+\d+,\d{4})"
        matches = re.findall(date_range_pattern, email_text)
        for start_date, end_date in matches:
            parsed_start = parse_date(start_date)
            parsed_end = parse_date(end_date)
            if parsed_start:
                dates.append(parsed_start)
            if parsed_end and parsed_end != parsed_start:
                dates.append(parsed_end)
    
    return dates


def parse_phone(phone_str: str) -> str:
    """Clean up phone number string"""
    if not phone_str:
        return ""
    
    # Remove all non-digit characters except + at the start
    cleaned = re.sub(r'[^\d+]', '', phone_str)
    return cleaned


def extract_hours_from_dates(email_text: str) -> float:
    """Calculate total hours from all care dates"""
    care_dates = parse_care_dates(email_text)
    total_hours = 0
    
    for _, _, _, hours, status in care_dates:
        if status == "Confirmed":
            total_hours += int(hours)
    
    return total_hours


def parse_currency(amount_str: str) -> Optional[float]:
    """Parse currency string to float"""
    if not amount_str:
        return None
    
    # Remove currency symbols and commas
    cleaned = re.sub(r'[$,]', '', amount_str.strip())
    
    try:
        return float(cleaned)
    except ValueError:
        return None

