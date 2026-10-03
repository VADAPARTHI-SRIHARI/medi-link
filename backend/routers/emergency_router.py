"""
Medi-Link Emergency Services API Router
"""
from typing import Optional
from fastapi import APIRouter, status
from backend.services.emergency_service import EmergencyService
from backend.models import EmergencySOSAlertRequest, EmergencyAppointmentRequest

router = APIRouter(prefix="/api/emergency", tags=["Emergency 24x7"])


@router.post("/sos", status_code=status.HTTP_201_CREATED)
def trigger_emergency_sos(payload: EmergencySOSAlertRequest):
    """Trigger one-touch Emergency SOS alert."""
    return EmergencyService.trigger_sos(payload)


@router.post("/appointment", status_code=status.HTTP_201_CREATED)
def create_emergency_appointment(payload: EmergencyAppointmentRequest):
    """Expedited priority emergency triage appointment."""
    return EmergencyService.create_emergency_appointment(payload)


@router.get("/trauma-centers")
def get_trauma_centers(location: Optional[str] = "Hyderabad"):
    """List 24x7 emergency and trauma care centers."""
    return EmergencyService.get_trauma_centers(location=location or "Hyderabad")
