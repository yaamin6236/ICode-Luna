"""
Gmail API service for fetching and watching emails.
Handles authentication and email retrieval.
"""

import os
import base64
import json
from typing import Optional, Dict, List
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pickle

from ..config import get_settings

settings = get_settings()

# Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
]


class GmailService:
    """Service for interacting with Gmail API"""
    
    def __init__(self):
        self.service = None
        self.credentials = None
    
    def authenticate(self):
        """Authenticate with Gmail API - supports both env vars and files"""
        creds = None
        
        # Method 1: Try loading from base64 environment variables (for cloud deployment)
        if settings.gmail_token_base64:
            try:
                print("[INFO] Loading Gmail token from environment variable")
                token_json = base64.b64decode(settings.gmail_token_base64).decode('utf-8')
                token_data = json.loads(token_json)
                
                creds = Credentials(
                    token=token_data.get('token'),
                    refresh_token=token_data.get('refresh_token'),
                    token_uri=token_data.get('token_uri'),
                    client_id=token_data.get('client_id'),
                    client_secret=token_data.get('client_secret'),
                    scopes=token_data.get('scopes', SCOPES)
                )
                print("[OK] Gmail token loaded from environment")
            except Exception as e:
                print(f"[WARN] Failed to load token from environment: {e}")
                creds = None
        
        # Method 2: Try loading from file (for local development)
        if not creds:
            token_path = settings.gmail_token_path
            if os.path.exists(token_path):
                print(f"[INFO] Loading Gmail token from file: {token_path}")
                with open(token_path, 'rb') as token:
                    creds = pickle.load(token)
                print("[OK] Gmail token loaded from file")
        
        # Refresh or get new credentials if needed
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                print("[INFO] Refreshing expired Gmail token")
                creds.refresh(Request())
                print("[OK] Gmail token refreshed")
            else:
                # Try to get new credentials from credentials.json
                credentials_path = settings.gmail_credentials_path
                credentials_data = None
                
                # Try environment variable first
                if settings.gmail_credentials_base64:
                    try:
                        print("[INFO] Loading Gmail credentials from environment variable")
                        creds_json = base64.b64decode(settings.gmail_credentials_base64).decode('utf-8')
                        credentials_data = json.loads(creds_json)
                        print("[OK] Gmail credentials loaded from environment")
                    except Exception as e:
                        print(f"[WARN] Failed to load credentials from environment: {e}")
                
                # Fall back to file
                if not credentials_data and os.path.exists(credentials_path):
                    print(f"[INFO] Loading Gmail credentials from file: {credentials_path}")
                    with open(credentials_path, 'r') as f:
                        credentials_data = json.load(f)
                    print("[OK] Gmail credentials loaded from file")
                
                if not credentials_data:
                    raise FileNotFoundError(
                        f"Gmail credentials not found in environment variables or file: {credentials_path}\n"
                        "Please set GMAIL_CREDENTIALS_BASE64 or download credentials.json from Google Cloud Console."
                    )
                
                # Create flow and get credentials
                flow = InstalledAppFlow.from_client_config(
                    credentials_data, SCOPES
                )
                creds = flow.run_local_server(port=0)
                
                # Save to file if possible
                token_path = settings.gmail_token_path
                try:
                    with open(token_path, 'wb') as token:
                        pickle.dump(creds, token)
                    print(f"[OK] Gmail token saved to {token_path}")
                except Exception as e:
                    print(f"[WARN] Could not save token to file: {e}")
        
        self.credentials = creds
        self.service = build('gmail', 'v1', credentials=creds)
        print("[OK] Gmail service authenticated and ready")
        return self.service
    
    def get_service(self):
        """Get authenticated Gmail service"""
        if not self.service:
            self.authenticate()
        return self.service
    
    def get_label_id(self, label_name: str) -> Optional[str]:
        """Get label ID by name"""
        try:
            service = self.get_service()
            results = service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            
            for label in labels:
                if label['name'] == label_name:
                    return label['id']
            
            return None
        except HttpError as error:
            print(f"Error getting label ID: {error}")
            return None
    
    def get_message(self, message_id: str) -> Optional[Dict]:
        """
        Fetch a specific email message by ID.
        
        Returns:
            Dictionary with message details including subject, body, date
        """
        try:
            service = self.get_service()
            message = service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            # Extract email components
            headers = message.get('payload', {}).get('headers', [])
            subject = ''
            date_str = ''
            
            for header in headers:
                if header['name'] == 'Subject':
                    subject = header['value']
                elif header['name'] == 'Date':
                    date_str = header['value']
            
            # Extract body
            body = self._get_message_body(message.get('payload', {}))
            
            # Parse date
            email_date = self._parse_email_date(date_str)
            
            return {
                'id': message_id,
                'subject': subject,
                'body': body,
                'date': email_date,
                'raw': message
            }
        
        except HttpError as error:
            print(f"Error fetching message {message_id}: {error}")
            return None
    
    def _get_message_body(self, payload: Dict) -> str:
        """Extract message body from payload"""
        body = ""
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body'].get('data', '')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8')
                        break
                elif part['mimeType'] == 'text/html' and not body:
                    data = part['body'].get('data', '')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8')
        else:
            data = payload.get('body', {}).get('data', '')
            if data:
                body = base64.urlsafe_b64decode(data).decode('utf-8')
        
        return body
    
    def _parse_email_date(self, date_str: str) -> datetime:
        """Parse email date string"""
        # This is a simplified parser. Gmail dates are in RFC 2822 format
        # For production, use email.utils.parsedate_to_datetime
        try:
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(date_str)
        except:
            return datetime.utcnow()
    
    def watch_label(self, label_name: str, topic_name: str) -> Dict:
        """
        Set up Gmail push notifications for a specific label.
        
        Args:
            label_name: Name of the Gmail label to watch
            topic_name: Google Cloud Pub/Sub topic name (format: projects/{project}/topics/{topic})
            
        Returns:
            Watch response with historyId and expiration
        """
        try:
            service = self.get_service()
            label_id = self.get_label_id(label_name)
            
            if not label_id:
                raise ValueError(f"Label '{label_name}' not found")
            
            request = {
                'labelIds': [label_id],
                'topicName': topic_name
            }
            
            response = service.users().watch(userId='me', body=request).execute()
            print(f"[OK] Gmail watch setup successful. Expires at: {response.get('expiration')}")
            return response
        
        except HttpError as error:
            print(f"Error setting up Gmail watch: {error}")
            raise
    
    def stop_watch(self):
        """Stop Gmail push notifications"""
        try:
            service = self.get_service()
            service.users().stop(userId='me').execute()
            print("[OK] Gmail watch stopped")
        except HttpError as error:
            print(f"Error stopping Gmail watch: {error}")
    
    def list_messages(self, label_name: Optional[str] = None, max_results: int = 10000) -> List[str]:
        """
        List message IDs from a label.
        Uses pagination to get all messages.
        
        Returns:
            List of message IDs
        """
        try:
            service = self.get_service()
            all_messages = []
            page_token = None
            
            label_id = None
            if label_name:
                label_id = self.get_label_id(label_name)
                if not label_id:
                    print(f"[WARN] Label '{label_name}' not found")
                    return []
            
            # Paginate through all results
            while True:
                query_params = {'userId': 'me', 'maxResults': min(500, max_results - len(all_messages))}
                
                if label_id:
                    query_params['labelIds'] = [label_id]
                
                if page_token:
                    query_params['pageToken'] = page_token
                
                results = service.users().messages().list(**query_params).execute()
                messages = results.get('messages', [])
                all_messages.extend(messages)
                
                page_token = results.get('nextPageToken')
                
                # Stop if no more pages or reached max_results
                if not page_token or len(all_messages) >= max_results:
                    break
            
            print(f"[INFO] Retrieved {len(all_messages)} message IDs from Gmail API")
            return [msg['id'] for msg in all_messages[:max_results]]
        
        except HttpError as error:
            print(f"Error listing messages: {error}")
            return []


# Singleton instance
gmail_service = GmailService()

