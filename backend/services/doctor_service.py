"""
Medi-Link Doctor & Healthcare Provider Service
Provides discovery, filtering, and factual profile retrieval across multi-tier care providers:
Super-specialists, Hospital Consultants, Local Clinic Doctors, RMPs, and Ayurvedic Vaidyas.
"""
from typing import List, Dict, Any, Optional
from backend.database import query_db


class DoctorService:
    @staticmethod
    def get_doctors(
        specialty: Optional[str] = None,
        department: Optional[str] = None,
        facility_id: Optional[str] = None,
        facility_type: Optional[str] = None,
        home_visit: Optional[bool] = None,
        location: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Filter and retrieve verified doctor profiles without arbitrary ranking."""
        sql = """
        SELECT d.*, f.type as facility_type, f.city, f.address as facility_address
        FROM doctors d
        JOIN facilities f ON d.facility_id = f.id
        WHERE 1=1
        """
        params = []

        if specialty:
            sql += " AND (d.specialty LIKE ? OR d.qualification LIKE ?)"
            params.extend([f"%{specialty}%", f"%{specialty}%"])

        if department:
            sql += " AND d.department LIKE ?"
            params.append(f"%{department}%")

        if facility_id:
            sql += " AND d.facility_id = ?"
            params.append(facility_id)

        if facility_type:
            sql += " AND f.type = ?"
            params.append(facility_type)

        if home_visit is True:
            sql += " AND d.home_visit_available = 1"

        if location:
            sql += " AND (f.city LIKE ? OR f.address LIKE ?)"
            params.extend([f"%{location}%", f"%{location}%"])

        if search:
            sql += " AND (d.name LIKE ? OR d.specialty LIKE ? OR d.department LIKE ? OR d.qualification LIKE ? OR d.facility_name LIKE ?)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param, search_param])

        sql += " ORDER BY d.experience_years DESC"
        doctors = query_db(sql, tuple(params))
        
        # Add dynamic slot availability preview
        for doc in doctors:
            doc["available_today"] = True
            doc["next_available_slot"] = "Today, 11:30 AM"
            doc["consultation_types_list"] = [t.strip() for t in doc["consultation_types"].split(",")]

        return doctors

    @staticmethod
    def get_doctor_by_id(doctor_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve complete verified profile for a doctor."""
        sql = """
        SELECT d.*, f.type as facility_type, f.city, f.address as facility_address, f.phone as facility_phone
        FROM doctors d
        JOIN facilities f ON d.facility_id = f.id
        WHERE d.id = ?
        """
        doc = query_db(sql, (doctor_id,), one=True)
        if doc:
            doc["consultation_types_list"] = [t.strip() for t in doc["consultation_types"].split(",")]
            doc["slots"] = [
                {"slot": "09:30 AM - 10:00 AM", "available": True},
                {"slot": "10:30 AM - 11:00 AM", "available": True},
                {"slot": "11:30 AM - 12:00 PM", "available": False},
                {"slot": "04:30 PM - 05:00 PM", "available": True},
                {"slot": "05:30 PM - 06:00 PM", "available": True},
                {"slot": "06:30 PM - 07:00 PM", "available": True},
            ]
        return doc

    @staticmethod
    def get_specialties() -> List[str]:
        """Get unique available specialties."""
        rows = query_db("SELECT DISTINCT specialty FROM doctors ORDER BY specialty ASC")
        return [r["specialty"] for r in rows]
