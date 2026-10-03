"""
Medi-Link Organ Donation & Transplant Registry API Router
"""
from fastapi import APIRouter, status
from backend.services.organ_service import OrganService
from backend.models import OrganPledgeRequest, OrganRequestCreateRequest

router = APIRouter(prefix="/api/organ", tags=["Organ Services"])


@router.post("/pledge", status_code=status.HTTP_201_CREATED)
def pledge_organs(payload: OrganPledgeRequest):
    """Register informed voluntary organ pledge."""
    return OrganService.register_pledge(payload)


@router.post("/requests", status_code=status.HTTP_201_CREATED)
def create_organ_request(payload: OrganRequestCreateRequest):
    """Submit clinical organ transplant waiting list entry."""
    return OrganService.create_organ_request(payload)


@router.get("/requests")
def list_organ_requests():
    """List transplant waiting registry entries."""
    return OrganService.get_requests()
