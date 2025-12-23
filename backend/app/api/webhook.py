"""
Webhook endpoint for Gmail Pub/Sub notifications.
"""

from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
from datetime import datetime

from ..config import get_settings
from ..services.pubsub_handler import pubsub_handler

settings = get_settings()
router = APIRouter()


@router.post("/gmail")
async def gmail_webhook(
    request: Request,
    x_goog_resource_state: Optional[str] = Header(None)
):
    """
    Receive Gmail Pub/Sub notifications.
    
    This endpoint is called by Google Cloud Pub/Sub when new emails arrive.
    """
    try:
        # Get the notification data
        body = await request.json()
        
        # Verify the notification (optional but recommended)
        # You can add verification token checking here
        
        # Process the notification
        result = await pubsub_handler.process_notification(body)
        
        return result
    
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-email/{message_id}")
async def process_email_manually(message_id: str):
    """
    Manually trigger processing of a specific email.
    Useful for testing or reprocessing failed emails.
    """
    try:
        result = await pubsub_handler.process_email(message_id)
        
        if result:
            return {
                'status': 'success',
                'message': 'Email processed successfully',
                'registration': result
            }
        else:
            return {
                'status': 'failed',
                'message': 'Email processing failed or already processed'
            }
    
    except Exception as e:
        print(f"❌ Manual processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def webhook_health():
    """Health check for webhook"""
    return {"status": "healthy", "service": "gmail-webhook"}


@router.post("/setup-gmail-watch")
async def setup_gmail_watch():
    """
    Enable Gmail watch for the configured label.
    This needs to be called once, then renewed every 7 days.
    
    Call this endpoint to start receiving Gmail notifications via Pub/Sub.
    """
    from ..services.gmail_service import gmail_service
    
    try:
        # Your topic name from Google Cloud
        topic_name = "projects/orbital-avatar-454314-u8/topics/bright-horizon-gmail-notifications"
        label_name = settings.gmail_label_name  # "Leads/Bright Horizons"
        
        print(f"[INFO] Setting up Gmail watch for label: {label_name}")
        print(f"[INFO] Pub/Sub topic: {topic_name}")
        
        # Call Gmail Watch API
        response = gmail_service.watch_label(
            label_name=label_name,
            topic_name=topic_name
        )
        
        # Calculate expiration time (Gmail watch lasts 7 days)
        expiration_ms = int(response.get('expiration', 0))
        expiration_date = datetime.fromtimestamp(expiration_ms / 1000) if expiration_ms else None
        
        return {
            'status': 'success',
            'message': 'Gmail watch enabled successfully!',
            'historyId': response.get('historyId'),
            'expiration': expiration_date.isoformat() if expiration_date else None,
            'expirationTimestamp': expiration_ms,
            'labelName': label_name,
            'topicName': topic_name,
            'note': 'Gmail watch expires in 7 days and needs to be renewed'
        }
    
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        print(f"❌ Error setting up Gmail watch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop-gmail-watch")
async def stop_gmail_watch():
    """
    Stop Gmail watch notifications.
    Use this if you want to disable the email monitoring.
    """
    from ..services.gmail_service import gmail_service
    
    try:
        gmail_service.stop_watch()
        return {
            'status': 'success',
            'message': 'Gmail watch stopped successfully'
        }
    
    except Exception as e:
        print(f"❌ Error stopping Gmail watch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gmail-watch-status")
async def gmail_watch_status():
    """
    Check if Gmail watch is active (basic health check).
    """
    from ..services.gmail_service import gmail_service
    
    try:
        # Try to get service to verify credentials work
        service = gmail_service.get_service()
        
        return {
            'status': 'credentials_valid',
            'message': 'Gmail API credentials are valid',
            'note': 'To check if watch is active, try sending a test email'
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Gmail credentials issue: {str(e)}'
        }

