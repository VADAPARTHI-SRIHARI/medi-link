"""
Medi-Link Emergency Service
Manages 24x7 emergency SOS alerts, automated ambulance dispatch simulations,
instant trauma center appointments, and offline crisis guidance cards.
"""
import uuid
from typing import Dict, Any, List
from backend.database import query_db, execute_db
from backend.models import EmergencySOSAlertRequest, EmergencyAppointmentRequest


class EmergencyService:
    @staticmethod
    def trigger_sos(req: EmergencySOSAlertRequest, user_id: str = "guest") -> Dict[str, Any]:
        """Trigger immediate emergency SOS dispatch."""
        alert_id = f"sos-{uuid.uuid4().hex[:6]}"
        amb_no = f"AMB-TS-09-{uuid.uuid4().hex[:4].upper()}"

        execute_db("""
        INSERT INTO emergency_alerts (
            id, user_name, user_mobile, location_lat, location_lng, address,
            emergency_type, symptoms, emergency_contact, status, ambulance_vehicle_no,
            dispatched_hospital, eta_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISPATCHED_SIMULATED', ?, 'City General Trauma & Emergency Hospital', 7)
        """, (
            alert_id, req.user_name, req.user_mobile, req.location_lat, req.location_lng,
            req.address, req.emergency_type, req.symptoms, req.emergency_contact, amb_no
        ))

        return {
            "status": "DISPATCHED",
            "alert_id": alert_id,
            "user_name": req.user_name,
            "dispatched_vehicle": amb_no,
            "assigned_hospital": "City General Trauma & Emergency Hospital",
            "eta_minutes": 7,
            "emergency_numbers": ["108 (National Ambulance)", "112 (Universal Emergency)", "102 (Pregnancy/Child Helpline)"],
            "first_aid_guidance": [
                "Keep patient lying down in a well-ventilated space.",
                "Loosen tight collars or clothing around neck and chest.",
                "If patient is conscious with chest pain, keep them seated at 45 degrees.",
                "Do not administer solid foods or heavy liquids."
            ],
            "simulation_notice": "DEMO MODE: In a real-world scenario, this triggers CAD (Computer-Aided Dispatch) to the nearest 108 GVK-EMRI emergency control center."
        }

    @staticmethod
    def create_emergency_appointment(req: EmergencyAppointmentRequest) -> Dict[str, Any]:
        """Create an expedited priority emergency room appointment."""
        appt_id = f"ML-EMERG-{uuid.uuid4().hex[:5].upper()}"
        
        execute_db("""
        INSERT INTO appointments (
            id, patient_name, patient_mobile, doctor_name, facility_id, facility_name,
            department, appointment_type, date, time_slot, status, queue_token,
            symptoms, reason, preparation_notes
        ) VALUES (?, ?, ?, 'On-Duty Emergency Medical Officer (EMO)', 'fac-hosp-01',
                 'City General Hospital', 'Emergency & Trauma', 'emergency',
                 DATE('now'), 'IMMEDIATE', 'CONFIRMED', 'ER-01',
                 ?, 'Acute Emergency Triage', 'Proceed directly to Red Triage Counter at Block A Ground Floor.')
        """, (appt_id, req.patient_name, req.mobile, req.symptoms))

        return {
            "status": "CONFIRMED",
            "appointment_id": appt_id,
            "queue_token": "ER-PRIORITY-01",
            "hospital": "City General Hospital - Trauma Care Center",
            "location": "Plot 12, Main Road, Lakdikapul (Entry via Gate 1)",
            "counter": "Red Triage Counter 1",
            "instructions": "Hospital security and triage officers have been notified. Keep hazard lights on upon hospital approach."
        }

    @staticmethod
    def get_trauma_centers(location: str = "Hyderabad") -> List[Dict[str, Any]]:
        """List nearby emergency & trauma centers with 24x7 readiness."""
        return [
            {
                "name": "City General Hospital - Level 1 Trauma Center",
                "distance_km": 1.2,
                "phone": "+91 40 2345 6789",
                "emergency_beds_available": 6,
                "icu_available": True,
                "cath_lab_24x7": True,
                "address": "Plot 12, Main Road, Lakdikapul"
            },
            {
                "name": "Apollo Emergency & Cardiac Care",
                "distance_km": 2.8,
                "phone": "+91 40 2360 7777",
                "emergency_beds_available": 4,
                "icu_available": True,
                "cath_lab_24x7": True,
                "address": "Road No. 2, Jubilee/Banjara Hills"
            }
        ]
