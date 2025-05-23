# backend/app/api/v1/endpoints/webhooks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.webhook import WebhookConfig
from app.schemas.webhook import WebhookCreate, WebhookUpdate, WebhookResponse, WebhookStats

router = APIRouter()


@router.get("/", response_model=List[WebhookResponse])
async def get_webhooks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all webhook configurations"""
    webhooks = db.query(WebhookConfig).offset(skip).limit(limit).all()
    return webhooks


@router.post("/", response_model=WebhookResponse)
async def create_webhook(
    webhook: WebhookCreate,
    db: Session = Depends(get_db)
):
    """Create a new webhook configuration"""
    webhook_data = webhook.dict()
    if webhook_data.get('event_types'):
        import json
        webhook_data['event_types'] = json.dumps(webhook_data['event_types'])
    
    db_webhook = WebhookConfig(**webhook_data)
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook


@router.get("/{webhook_id}", response_model=WebhookResponse)
async def get_webhook(
    webhook_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific webhook configuration"""
    webhook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    return webhook


@router.put("/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(
    webhook_id: int,
    webhook_update: WebhookUpdate,
    db: Session = Depends(get_db)
):
    """Update a webhook configuration"""
    db_webhook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not db_webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    update_data = webhook_update.dict(exclude_unset=True)
    if 'event_types' in update_data and update_data['event_types']:
        import json
        update_data['event_types'] = json.dumps(update_data['event_types'])
    
    for field, value in update_data.items():
        setattr(db_webhook, field, value)
    
    db.commit()
    db.refresh(db_webhook)
    return db_webhook


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: int,
    db: Session = Depends(get_db)
):
    """Delete a webhook configuration"""
    db_webhook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not db_webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    db.delete(db_webhook)
    db.commit()
    return {"message": "Webhook deleted successfully"}


@router.get("/{webhook_id}/stats", response_model=WebhookStats)
async def get_webhook_stats(
    webhook_id: int,
    db: Session = Depends(get_db)
):
    """Get webhook statistics"""
    webhook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    success_rate = 0
    if webhook.total_calls > 0:
        success_rate = (webhook.successful_calls / webhook.total_calls) * 100
    
    return WebhookStats(
        total_calls=webhook.total_calls,
        successful_calls=webhook.successful_calls,
        failed_calls=webhook.failed_calls,
        success_rate=success_rate,
        last_triggered=webhook.last_triggered
    )


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: int,
    db: Session = Depends(get_db)
):
    """Test a webhook by sending a test payload"""
    webhook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not webhook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook not found"
        )
    
    from app.services.webhook_service import WebhookService
    webhook_service = WebhookService(db)
    
    test_data = {
        "test": True,
        "message": "This is a test webhook from Motorcycle Maintenance Tracker",
        "webhook_name": webhook.name
    }
    
    try:
        await webhook_service.send_webhook("test_webhook", test_data)
        return {"message": "Test webhook sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test webhook: {str(e)}"
        )