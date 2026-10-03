"""
Medi-Link Blood Services
Provides voluntary blood donation registration, verified blood requests, and emergency compatibility matching.
"""
import uuid
from typing import List, Dict, Any
from backend.database import query_db, execute_db
from backend.models import BloodDonationRegisterRequest, BloodRequestCreateRequest


class BloodService:
    @staticmethod
    def register_donor(req: BloodDonationRegisterRequest) -> Dict[str, Any]:
        """Register a voluntary blood donor."""
        donor_id = f"bd-{uuid.uuid4().hex[:6]}"
        execute_db("""
        INSERT INTO blood_donors (id, name, blood_group, mobile, email, age, gender, city, last_donation_date, eligible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (donor_id, req.name, req.blood_group, req.mobile, req.email, req.age, req.gender, req.city, req.last_donation_date))

        return {
            "status": "REGISTERED",
            "donor_id": donor_id,
            "name": req.name,
            "blood_group": req.blood_group,
            "message": "Thank you for registering as a life-saving blood donor! You will be notified when an emergency match occurs in your city."
        }

    @staticmethod
    def create_request(req: BloodRequestCreateRequest) -> Dict[str, Any]:
        """Submit an urgent blood requirement."""
        request_id = f"br-{uuid.uuid4().hex[:6]}"
        execute_db("""
        INSERT INTO blood_requests (id, patient_name, blood_group, units_needed, hospital_name, city, urgency, contact_name, contact_mobile, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'MATCHING', ?)
        """, (request_id, req.patient_name, req.blood_group, req.units_needed, req.hospital_name, req.city, req.urgency, req.contact_name, req.contact_mobile, req.notes))

        # Check matching eligible donors in same city
        matching_donors = query_db("""
        SELECT COUNT(*) as count FROM blood_donors
        WHERE blood_group = ? AND city LIKE ? AND eligible = 1
        """, (req.blood_group, f"%{req.city}%"), one=True)["count"]

        return {
            "status": "MATCHING",
            "request_id": request_id,
            "patient_name": req.patient_name,
            "blood_group": req.blood_group,
            "units_needed": req.units_needed,
            "urgency": req.urgency,
            "matching_registered_donors_alerted": matching_donors,
            "disclaimer": "Simulated emergency notification dispatched to certified blood banks and registered donors."
        }

    @staticmethod
    def get_requests(city: str = "") -> List[Dict[str, Any]]:
        """List active blood requests."""
        sql = "SELECT * FROM blood_requests WHERE 1=1"
        params = []
        if city:
            sql += " AND city LIKE ?"
            params.append(f"%{city}%")
        sql += " ORDER BY urgency DESC, created_at DESC"
        return query_db(sql, tuple(params))

    @staticmethod
    def get_stock_levels() -> Dict[str, Any]:
        """Summary of certified blood bank stock units in region (Demo Data)."""
        return {
            "O+": {"units": 42, "status": "ADEQUATE"},
            "O-": {"units": 8, "status": "CRITICAL_LOW"},
            "A+": {"units": 29, "status": "ADEQUATE"},
            "A-": {"units": 12, "status": "MODERATE"},
            "B+": {"units": 36, "status": "ADEQUATE"},
            "B-": {"units": 10, "status": "LOW"},
            "AB+": {"units": 18, "status": "MODERATE"},
            "AB-": {"units": 5, "status": "CRITICAL_LOW"}
        }
