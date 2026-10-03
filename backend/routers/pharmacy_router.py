"""
Medi-Link Pharmacy & Medicine API Router
"""
from typing import Optional
from fastapi import APIRouter
from backend.services.pharmacy_service import PharmacyService
from backend.models import MedicineReserveRequest

router = APIRouter(prefix="/api/pharmacy", tags=["Pharmacy & Medicines"])


@router.get("/medicines")
def search_medicines(
    query: Optional[str] = "",
    location: Optional[str] = "",
    prescription_only: Optional[bool] = None
):
    """Search medications and check pharmacy availability."""
    return PharmacyService.search_medicines(query=query, location=location, prescription_only=prescription_only)


@router.get("/stores")
def get_pharmacies(city: Optional[str] = ""):
    """Find nearby partner pharmacies."""
    return PharmacyService.get_pharmacies(city=city)


@router.post("/reserve")
def reserve_medication(payload: MedicineReserveRequest):
    """Reserve medication for counter pickup."""
    return PharmacyService.reserve_medicine(payload)
