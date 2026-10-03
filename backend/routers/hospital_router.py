"""
Medi-Link Hospital & Facility API Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from backend.services.hospital_service import HospitalService
from backend.models import SymptomSuitabilityRequest

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals & Facilities"])


@router.get("")
def list_facilities(
    facility_type: Optional[str] = None,
    city: Optional[str] = None,
    emergency_only: Optional[bool] = None,
    search: Optional[str] = None
):
    """List healthcare facilities (hospitals, clinics, RMP centers, Ayurvedic clinics)."""
    return HospitalService.get_facilities(
        facility_type=facility_type,
        city=city,
        emergency_only=emergency_only,
        search=search
    )


@router.get("/{facility_id}")
def get_facility_detail(facility_id: str):
    """Get facility profile, doctor roster, and indoor navigation wayfinding nodes."""
    fac = HospitalService.get_facility_by_id(facility_id)
    if not fac:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")
    return fac


@router.post("/suitability")
def check_hospital_suitability(payload: SymptomSuitabilityRequest):
    """
    Hospital Suitability Engine:
    Accepts health complaint or symptoms, identifies matching department,
    recommends matching care facilities and doctors, and provides transparent clinical justification.
    """
    return HospitalService.match_suitability(
        symptoms=payload.symptoms,
        location=payload.location or "Hyderabad",
        preferred_type=payload.preferred_care_type or "all"
    )
