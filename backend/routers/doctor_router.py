"""
Medi-Link Doctor & Healthcare Provider API Router
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Query
from backend.services.doctor_service import DoctorService

router = APIRouter(prefix="/api/doctors", tags=["Doctors & Providers"])


@router.get("")
def list_doctors(
    specialty: Optional[str] = None,
    department: Optional[str] = None,
    facility_id: Optional[str] = None,
    facility_type: Optional[str] = None,
    home_visit: Optional[bool] = None,
    location: Optional[str] = None,
    search: Optional[str] = None
):
    """Retrieve verified doctor and provider profiles with flexible filters."""
    return DoctorService.get_doctors(
        specialty=specialty,
        department=department,
        facility_id=facility_id,
        facility_type=facility_type,
        home_visit=home_visit,
        location=location,
        search=search
    )


@router.get("/specialties/list")
def get_specialties():
    """Retrieve unique doctor specialties."""
    return DoctorService.get_specialties()


@router.get("/{doctor_id}")
def get_doctor_profile(doctor_id: str):
    """Get verified doctor details and booking slots."""
    doc = DoctorService.get_doctor_by_id(doctor_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doc
