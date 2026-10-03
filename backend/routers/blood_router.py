"""
Medi-Link Blood Services API Router
"""
from typing import Optional
from fastapi import APIRouter, status
from backend.services.blood_service import BloodService
from backend.models import BloodDonationRegisterRequest, BloodRequestCreateRequest

router = APIRouter(prefix="/api/blood", tags=["Blood Services"])


@router.post("/donors", status_code=status.HTTP_201_CREATED)
def register_donor(payload: BloodDonationRegisterRequest):
    """Register as a voluntary blood donor."""
    return BloodService.register_donor(payload)


@router.post("/requests", status_code=status.HTTP_201_CREATED)
def create_blood_request(payload: BloodRequestCreateRequest):
    """Submit emergency blood request."""
    return BloodService.create_request(payload)


@router.get("/requests")
def list_blood_requests(city: Optional[str] = ""):
    """List active blood requests."""
    return BloodService.get_requests(city=city)


@router.get("/stock")
def get_blood_stock():
    """Get regional blood bank stock units."""
    return BloodService.get_stock_levels()
