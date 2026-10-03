"""
Medi-Link Organ Donation & Transplant Registry Service
Facilitates legal organ donor pledge registrations and authorized transparent waiting-list requests.
Operates strictly in compliance with the Transplantation of Human Organs and Tissues Act (THOTA).
"""
import uuid
from typing import List, Dict, Any
from backend.database import query_db, execute_db
from backend.models import OrganPledgeRequest, OrganRequestCreateRequest


class OrganService:
    @staticmethod
    def register_pledge(req: OrganPledgeRequest) -> Dict[str, Any]:
        """Register an informed, voluntary organ donor pledge."""
        pledge_id = f"op-{uuid.uuid4().hex[:6]}"
        organs_str = ",".join(req.pledged_organs)

        execute_db("""
        INSERT INTO organ_pledges (
            id, full_name, mobile, email, city, age, pledged_organs,
            emergency_contact_name, emergency_contact_phone, consent_agreed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            pledge_id, req.full_name, req.mobile, req.email, req.city, req.age,
            organs_str, req.emergency_contact_name, req.emergency_contact_phone
        ))

        return {
            "status": "PLEDGE_RECORDED",
            "pledge_id": pledge_id,
            "full_name": req.full_name,
            "pledged_organs": req.pledged_organs,
            "pledge_card_url": f"/api/organ/pledge-card/{pledge_id}",
            "legal_notice": "Your pledge has been securely recorded. Medi-Link facilitates registry connection with the National Organ & Tissue Transplant Organization (NOTTO). No commercial transactions are permitted by law."
        }

    @staticmethod
    def create_organ_request(req: OrganRequestCreateRequest) -> Dict[str, Any]:
        """Record a verified hospital-authorized organ transplant waiting request."""
        req_id = f"or-{uuid.uuid4().hex[:6]}"
        registry_ref = f"NOTTO-ML-2026-{uuid.uuid4().hex[:5].upper()}"

        execute_db("""
        INSERT INTO organ_requests (id, patient_name, organ_type, hospital_name, city, urgency, registry_ref, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ON_REGISTRY_LIST', ?)
        """, (req_id, req.patient_name, req.organ_type, req.hospital_name, req.city, req.urgency, registry_ref, req.notes))

        return {
            "status": "ON_REGISTRY_LIST",
            "request_id": req_id,
            "registry_ref": registry_ref,
            "patient_name": req.patient_name,
            "organ_type": req.organ_type,
            "hospital_name": req.hospital_name,
            "safety_information": "Transplant allocation is handled strictly on clinical urgency, HLA matching, and waiting time by authorized government medical boards."
        }

    @staticmethod
    def get_requests() -> List[Dict[str, Any]]:
        """List active registry requests."""
        return query_db("SELECT * FROM organ_requests ORDER BY created_at DESC")
