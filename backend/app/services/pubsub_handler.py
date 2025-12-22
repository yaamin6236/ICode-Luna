"""
Service to handle Gmail Pub/Sub notifications and process emails.
"""

import base64
import json
from typing import Dict, Optional
from datetime import datetime
from bson import ObjectId

from .gmail_service import gmail_service
from .email_parser import parse_bright_horizon_email
from ..db.mongodb import get_database
from ..models.registration import RegistrationStatus


class PubSubHandler:
    """Handler for Gmail Pub/Sub notifications"""
    
    async def process_notification(self, notification_data: Dict) -> Dict:
        """
        Process a Gmail Pub/Sub notification.
        
        Args:
            notification_data: The notification payload from Gmail
            
        Returns:
            Dictionary with processing result
        """
        try:
            # Decode the notification
            message = notification_data.get('message', {})
            data = message.get('data', '')
            
            if data:
                decoded_data = base64.b64decode(data).decode('utf-8')
                gmail_data = json.loads(decoded_data)
                
                email_address = gmail_data.get('emailAddress')
                history_id = gmail_data.get('historyId')
                
                print(f"[EMAIL] Received notification for {email_address}, history: {history_id}")
                
                # In a real implementation, you would use the history API
                # to get only new messages. For simplicity, we'll process
                # the most recent message.
                
                # For now, return success
                return {
                    'status': 'success',
                    'message': 'Notification received',
                    'historyId': history_id
                }
            
            return {'status': 'success', 'message': 'Empty notification'}
        
        except Exception as e:
            print(f"[ERROR] Error processing notification: {e}")
            return {'status': 'error', 'message': str(e)}
    
    async def process_email(self, message_id: str) -> Optional[Dict]:
        """
        Fetch and process a single email by message ID.
        
        Args:
            message_id: Gmail message ID
            
        Returns:
            Created registration document or None if processing fails
        """
        db = get_database()
        
        try:
            # Check if already processed
            existing = await db.registrations.find_one({'emailId': message_id})
            if existing:
                print(f"[SKIP] Email {message_id} already processed")
                return None
            
            # Fetch email from Gmail
            email_data = gmail_service.get_message(message_id)
            if not email_data:
                print(f"[ERROR] Failed to fetch email {message_id}")
                return None
            
            # Parse email
            parsed_data = parse_bright_horizon_email(
                email_text=email_data['body'],
                email_subject=email_data['subject'],
                email_date=email_data['date']
            )
            
            if not parsed_data:
                print(f"[WARN] Failed to parse email {message_id} - insufficient data")
                # Store the raw email for manual review
                await self._store_unparsed_email(message_id, email_data)
                return None
            
            # Create registration document
            registration_doc = {
                'registrationId': f"BH-{message_id[:8]}-{int(datetime.utcnow().timestamp())}",
                'status': parsed_data['status'].value,
                'enrollmentDate': parsed_data['enrollmentDate'],
                'cancellationDate': parsed_data.get('cancellationDate'),
                'childName': parsed_data['childName'],
                'childAge': parsed_data.get('childAge'),
                'parentName': parsed_data['parentName'],
                'parentEmail': parsed_data['parentEmail'],
                'parentPhone': parsed_data.get('parentPhone'),
                'campDates': parsed_data['campDates'],
                'campType': parsed_data.get('campType'),
                'totalCost': parsed_data.get('totalCost'),
                'amountPaid': parsed_data.get('amountPaid'),
                'emailId': message_id,
                'emailReceivedAt': email_data['date'],
                'parsedAt': datetime.utcnow(),
                'rawEmailBody': email_data['body'],
                'manualEntry': False,
                'createdBy': None,
                'updatedAt': datetime.utcnow()
            }
            
            # Insert into database
            result = await db.registrations.insert_one(registration_doc)
            registration_doc['_id'] = str(result.inserted_id)
            
            print(f"[OK] Successfully processed email {message_id} -> {registration_doc['registrationId']}")
            
            return registration_doc
        
        except Exception as e:
            print(f"[ERROR] Error processing email {message_id}: {e}")
            return None
    
    async def _store_unparsed_email(self, message_id: str, email_data: Dict):
        """Store unparsed emails for manual review"""
        db = get_database()
        
        unparsed_doc = {
            'emailId': message_id,
            'subject': email_data['subject'],
            'body': email_data['body'],
            'date': email_data['date'],
            'receivedAt': datetime.utcnow(),
            'status': 'unparsed'
        }
        
        await db.unparsed_emails.insert_one(unparsed_doc)
        print(f"[STORED] Unparsed email {message_id} for manual review")


# Singleton instance
pubsub_handler = PubSubHandler()

