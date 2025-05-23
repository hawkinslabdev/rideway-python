import httpx
import json
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.webhook import WebhookConfig
from app.core.config import settings


class WebhookService:
    def __init__(self, db: Session):
        self.db = db

    async def send_webhook(self, event_type: str, data: Dict[Any, Any]):
        """Send webhook notifications for a specific event type"""
        webhooks = self.db.query(WebhookConfig).filter(
            WebhookConfig.is_active == True
        ).all()
        
        for webhook in webhooks:
            if self._should_trigger_webhook(webhook, event_type):
                await self._send_single_webhook(webhook, event_type, data)

    def _should_trigger_webhook(self, webhook: WebhookConfig, event_type: str) -> bool:
        """Check if webhook should be triggered for this event type"""
        if not webhook.event_types:
            return True
        
        event_types = json.loads(webhook.event_types)
        return event_type in event_types

    async def _send_single_webhook(self, webhook: WebhookConfig, event_type: str, data: Dict[Any, Any]):
        """Send a single webhook notification"""
        payload = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        
        try:
            async with httpx.AsyncClient(timeout=settings.WEBHOOK_TIMEOUT) as client:
                response = await client.post(
                    webhook.url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                
                # Update statistics
                webhook.total_calls += 1
                webhook.successful_calls += 1
                webhook.last_triggered = datetime.utcnow()
                self.db.commit()
                
        except Exception as e:
            webhook.total_calls += 1
            webhook.failed_calls += 1
            self.db.commit()
            print(f"Webhook failed for {webhook.name}: {str(e)}")

    async def trigger_maintenance_due(self, motorcycle_data: Dict, maintenance_data: Dict):
        """Trigger webhook for maintenance due events"""
        await self.send_webhook("maintenance_due", {
            "motorcycle": motorcycle_data,
            "maintenance": maintenance_data
        })

    async def trigger_service_completed(self, motorcycle_data: Dict, service_data: Dict):
        """Trigger webhook for completed service events"""
        await self.send_webhook("service_completed", {
            "motorcycle": motorcycle_data,
            "service": service_data
        })