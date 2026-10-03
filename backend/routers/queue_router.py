"""
Medi-Link Queue Management Router
"""
from typing import Optional
from fastapi import APIRouter
from backend.services.queue_service import QueueService
from backend.models import QueueAdvanceRequest

router = APIRouter(prefix="/api/queue", tags=["Queue Tracking"])


@router.get("/status")
def get_queue_status(
    facility_id: str = "fac-hosp-01",
    department: str = "Cardiology",
    token: Optional[str] = "OP-14"
):
    """Retrieve real-time token tracking metrics."""
    return QueueService.get_queue_status(facility_id, department, token)


@router.post("/advance")
def advance_queue(payload: QueueAdvanceRequest):
    """Advance serving token or log delays (Staff / Live Demo)."""
    return QueueService.advance_queue(payload)
