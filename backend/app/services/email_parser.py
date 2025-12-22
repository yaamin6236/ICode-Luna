"""
Email parser service to extract registration data from Bright Horizons Back-Up Care emails.
Uses regex patterns instead of AI for fast, deterministic parsing.
"""

import re
from typing import Dict, Optional
from datetime import datetime

from ..utils.parser_patterns import (
    PATTERNS,
    parse_date,
    extract_all_dates,
    parse_phone,
    parse_care_dates,
    extract_hours_from_dates
)
from ..models.registration import RegistrationStatus


class EmailParser:
    """Parser for Bright Horizons Back-Up Care emails"""
    
    def __init__(self):
        self.patterns = PATTERNS
    
    def extract_field(self, text: str, pattern_key: str) -> Optional[str]:
        """Extract a field from email text using regex pattern"""
        pattern = self.patterns.get(pattern_key)
        if not pattern:
            return None
        
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE | re.DOTALL)
        if match:
            return match.group(1).strip()
        return None
    
    def determine_status(self, email_text: str, email_subject: str = "") -> RegistrationStatus:
        """Determine if this is an authorization or cancellation"""
        combined_text = f"{email_subject} {email_text}".lower()
        
        if re.search(self.patterns["cancellation"], combined_text, re.IGNORECASE):
            return RegistrationStatus.CANCELLED
        
        return RegistrationStatus.ENROLLED
    
    def parse_email(self, email_text: str, email_subject: str = "", email_date: Optional[datetime] = None) -> Dict:
        """
        Parse Bright Horizons email and extract registration data.
        
        Args:
            email_text: The body of the email
            email_subject: The subject line of the email
            email_date: When the email was received
            
        Returns:
            Dictionary with extracted registration data
        """
        status = self.determine_status(email_text, email_subject)
        
        # Extract fields
        care_request = self.extract_field(email_text, "care_request_number")
        
        # Try both child name formats
        child_name = self.extract_field(email_text, "child_name_simple")
        if not child_name:
            child_name = self.extract_field(email_text, "child_name_detailed")
        
        child_age_str = self.extract_field(email_text, "child_age")
        child_age = int(child_age_str) if child_age_str and child_age_str.isdigit() else None
        
        parent_name = self.extract_field(email_text, "parent_name")
        parent_email = self.extract_field(email_text, "parent_email")
        parent_phone_raw = self.extract_field(email_text, "parent_phone")
        parent_phone = parse_phone(parent_phone_raw) if parent_phone_raw else None
        
        employer = self.extract_field(email_text, "employer")
        location = self.extract_field(email_text, "location")
        
        # Extract all care dates
        camp_dates = extract_all_dates(email_text)
        enrollment_date = camp_dates[0] if camp_dates else (email_date or datetime.utcnow())
        
        # Calculate cost based on hours - assume 8 hours if not specified
        total_hours = extract_hours_from_dates(email_text)
        if total_hours == 0 and camp_dates:
            # If no hours found but we have dates, assume 8 hours per day
            total_hours = len(camp_dates) * 8
        
        total_cost = total_hours * 50 if total_hours > 0 else None  # $50/hour rate
        
        result = {
            "status": status,
            "enrollmentDate": enrollment_date,
            "cancellationDate": datetime.utcnow() if status == RegistrationStatus.CANCELLED else None,
            "childName": child_name or "Unknown",
            "childAge": child_age,
            "parentName": parent_name or "Unknown",
            "parentEmail": parent_email or "noemail@example.com",
            "parentPhone": parent_phone,
            "campDates": camp_dates if camp_dates else [enrollment_date],
            "campType": f"Back-Up Care - {employer}" if employer else "Back-Up Care",
            "totalCost": total_cost,
            "amountPaid": total_cost if status == RegistrationStatus.ENROLLED else 0,
            "registrationId": care_request or f"BH-{int(datetime.utcnow().timestamp())}",
        }
        
        return result
    
    def is_valid_parsed_data(self, parsed_data: Dict) -> bool:
        """
        Check if parsed data has minimum required fields.
        Returns False if critical data is missing.
        """
        # Must have at least child name and parent info
        if not parsed_data.get("childName") or parsed_data["childName"] == "Unknown":
            return False
        
        if not parsed_data.get("parentName") or parsed_data["parentName"] == "Unknown":
            return False
        
        # Must have at least one camp date
        if not parsed_data.get("campDates") or len(parsed_data["campDates"]) == 0:
            return False
        
        return True


# Singleton instance
email_parser = EmailParser()


def parse_bright_horizon_email(
    email_text: str,
    email_subject: str = "",
    email_date: Optional[datetime] = None
) -> Optional[Dict]:
    """
    Convenience function to parse a Bright Horizon email.
    
    Returns:
        Parsed data dictionary if successful, None if parsing fails
    """
    parsed = email_parser.parse_email(email_text, email_subject, email_date)
    
    if email_parser.is_valid_parsed_data(parsed):
        return parsed
    
    return None

