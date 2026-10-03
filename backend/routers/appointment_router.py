"""
Medi-Link Appointment Lifecycle Router
Provides endpoints for 7-step booking, rescheduling, cancellation, and status management.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from backend.models import (
    AppointmentCreateRequest,
    AppointmentRescheduleRequest,
    AppointmentCancelRequest,
    AppointmentStatusUpdateRequest
)
from backend.services.appointment_service import AppointmentService
from backend.security import get_current_user_optional, get_current_user_required

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("", status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreateRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Book a new appointment across Doctor, OP, Clinic, RMP, Ayurvedic, or Home Visit tiers."""
    user_id = user["sub"] if user else None
    return AppointmentService.create_appointment(payload, user_id=user_id)


@router.get("")
def list_appointments(
    status: Optional[str] = None,
    facility_id: Optional[str] = None,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """List appointments for the current session or all appointments if requested."""
    user_id = user["sub"] if user else None
    role = user["role"] if user else "patient"
    return AppointmentService.get_appointments(
        user_id=user_id,
        role=role,
        facility_id=facility_id,
        status_filter=status
    )


@router.get("/{appointment_id}")
def get_appointment(appointment_id: str):
    """Retrieve full appointment receipt and audit trail."""
    appt = AppointmentService.get_appointment_by_id(appointment_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt


@router.post("/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: str,
    payload: AppointmentCancelRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Cancel an active appointment with audit trail."""
    actor = user["name"] if user else "Patient"
    return AppointmentService.cancel_appointment(appointment_id, payload, actor=actor)


@router.post("/{appointment_id}/reschedule")
def reschedule_appointment(
    appointment_id: str,
    payload: AppointmentRescheduleRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Reschedule an active appointment to a new date/slot with audit trail."""
    actor = user["name"] if user else "Patient"
    return AppointmentService.reschedule_appointment(appointment_id, payload, actor=actor)


@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdateRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Update appointment status (Staff/Doctor action)."""
    actor = user["name"] if user else "Hospital Staff"
    return AppointmentService.update_status(appointment_id, payload, actor=actor)
