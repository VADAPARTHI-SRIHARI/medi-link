"""
Medi-Link Health & Vitals Monitoring API Router
"""
from typing import Optional
from fastapi import APIRouter, Depends
from backend.services.vitals_service import VitalsService
from backend.models import VitalsLogRequest
from backend.security import get_current_user_optional

router = APIRouter(prefix="/api/vitals", tags=["Health Monitoring"])


@router.get("/latest")
def get_latest_vitals(user: Optional[dict] = Depends(get_current_user_optional)):
    """Fetch current wearable vitals telemetry and trends."""
    user_id = user["sub"] if user else "usr-pat-01"
    return VitalsService.get_latest_vitals(user_id=user_id)


@router.post("/log")
def log_vitals_reading(payload: VitalsLogRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    """Record a new vitals telemetry reading (or simulate threshold breach)."""
    user_id = user["sub"] if user else "usr-pat-01"
    return VitalsService.record_reading(payload, user_id=user_id)
