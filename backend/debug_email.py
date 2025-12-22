"""
Debug script to see what an actual email looks like.
"""

from app.services.gmail_service import gmail_service
from app.config import get_settings

settings = get_settings()

# Get one email ID from the label
message_ids = gmail_service.list_messages(
    label_name=settings.gmail_label_name,
    max_results=1
)

if message_ids:
    message_id = message_ids[0]
    print(f"Fetching email: {message_id}")
    print("=" * 80)
    
    email_data = gmail_service.get_message(message_id)
    
    if email_data:
        print(f"Subject: {email_data['subject']}")
        print("=" * 80)
        print(f"Body:\n{email_data['body']}")
        print("=" * 80)
    else:
        print("Failed to fetch email")
else:
    print(f"No emails found in label: {settings.gmail_label_name}")

