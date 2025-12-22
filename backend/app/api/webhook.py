"""
Webhook endpoint for Gmail Pub/Sub notifications.
"""

from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional

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

