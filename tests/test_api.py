"""
MEDI-LINK Comprehensive Test Suite
Tests authentication, appointment lifecycle, queue tracking, hospital suitability,
pharmacy search, blood and organ services, emergency SOS, and AI assistant.
"""
import unittest
import uuid
from starlette.testclient import TestClient

from main import app
from backend.database import init_db
from backend.seed_data import seed_database


class TestMediLinkAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        seed_database()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        """Test system health check endpoint."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["app"], "MEDI-LINK")
        self.assertEqual(data["tagline"], "Right Care. Right Doctor. Right Place. Right Time.")

    def test_02_patient_registration_validation(self):
        """Test registration validation rules (e.g. password mismatch)."""
        # Mismatched passwords
        payload = {
            "name": "Test Patient",
            "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
            "mobile": "+919876543210",
            "location": "Hyderabad",
            "password": "Password123",
            "confirm_password": "DifferentPassword"
        }
        res = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res.status_code, 422)

        # Successful registration
        payload["confirm_password"] = "Password123"
        res_ok = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res_ok.status_code, 201)
        data = res_ok.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "patient")

    def test_03_staff_registration_and_login(self):
        """Test hospital staff registration and role authentication."""
        staff_email = f"staff_{uuid.uuid4().hex[:6]}@hospital.com"
        reg_payload = {
            "employee_name": "Test Officer",
            "email": staff_email,
            "mobile": "+919876543219",
            "location": "Secunderabad",
            "hospital_affiliation": "City General Hospital",
            "department": "Cardiology Front Desk",
            "password": "StaffSecret123",
            "confirm_password": "StaffSecret123"
        }
        res = self.client.post("/api/auth/staff/register", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["user"]["role"], "staff")

        # Test login
        login_res = self.client.post("/api/auth/staff/login", json={
            "email": staff_email,
            "password": "StaffSecret123"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("access_token", login_res.json())

    def test_04_doctor_discovery_and_filters(self):
        """Test multi-tier doctor search and verified credentials."""
        # All doctors
        res = self.client.get("/api/doctors")
        self.assertEqual(res.status_code, 200)
        docs = res.json()
        self.assertGreater(len(docs), 0)

        # Filter by home visit
        res_hv = self.client.get("/api/doctors?home_visit=true")
        self.assertEqual(res_hv.status_code, 200)
        for doc in res_hv.json():
            self.assertEqual(doc["home_visit_available"], 1)

        # Filter by specialty
        res_spec = self.client.get("/api/doctors?specialty=Cardiology")
        self.assertEqual(res_spec.status_code, 200)
        self.assertTrue(any("Cardiology" in d["specialty"] for d in res_spec.json()))

    def test_05_hospital_suitability_matcher(self):
        """Test health symptom analysis and department suitability routing."""
        payload = {
            "symptoms": "Severe chest pressure and breathlessness during climbing stairs",
            "location": "Hyderabad"
        }
        res = self.client.post("/api/hospitals/suitability", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["detected_department"], "Cardiology")
        self.assertIn("relevance_explanation", data)
        self.assertGreater(len(data["matching_facilities"]), 0)

    def test_06_appointment_lifecycle(self):
        """Test full appointment lifecycle: 7-step booking, rescheduling, and cancellation."""
        # 1. Create appointment
        create_payload = {
            "doctor_name": "Dr. Arvind Sharma",
            "facility_name": "City General Hospital",
            "department": "Cardiology",
            "appointment_type": "hospital_op",
            "date": "2026-10-15",
            "time_slot": "10:30 AM - 11:00 AM",
            "patient_name": "Rajesh Kumar",
            "patient_mobile": "+919876543210",
            "symptoms": "Blood pressure checkup and ECG review"
        }
        create_res = self.client.post("/api/appointments", json=create_payload)
        self.assertEqual(create_res.status_code, 201)
        appt = create_res.json()
        appt_id = appt["id"]
        self.assertTrue(appt_id.startswith("ML-"))
        self.assertIn("OP-", appt["queue_token"])
        self.assertEqual(appt["status"], "CONFIRMED")

        # 2. Reschedule appointment
        resched_payload = {
            "new_date": "2026-10-18",
            "new_time_slot": "04:30 PM - 05:00 PM",
            "reschedule_reason": "Family travel emergency"
        }
        resched_res = self.client.post(f"/api/appointments/{appt_id}/reschedule", json=resched_payload)
        self.assertEqual(resched_res.status_code, 200)
        updated = resched_res.json()
        self.assertEqual(updated["status"], "RESCHEDULED")
        self.assertEqual(updated["date"], "2026-10-18")

        # 3. Cancel appointment
        cancel_payload = {
            "cancel_reason": "Booked another consultant"
        }
        cancel_res = self.client.post(f"/api/appointments/{appt_id}/cancel", json=cancel_payload)
        self.assertEqual(cancel_res.status_code, 200)
        cancelled = cancel_res.json()
        self.assertEqual(cancelled["status"], "CANCELLED")

        # Verify audit trail
        self.assertGreater(len(cancelled["audit_trail"]), 2)

    def test_07_live_queue_and_advance(self):
        """Test queue status and simulated token advance."""
        status_res = self.client.get("/api/queue/status?facility_id=fac-hosp-01&department=Cardiology&token=OP-14")
        self.assertEqual(status_res.status_code, 200)
        q = status_res.json()
        self.assertIn("current_serving_token", q)
        self.assertIn("estimated_wait_minutes", q)

        # Advance queue token
        advance_res = self.client.post("/api/queue/advance", json={
            "facility_id": "fac-hosp-01",
            "department_id": "Cardiology",
            "action": "next"
        })
        self.assertEqual(advance_res.status_code, 200)
        adv_data = advance_res.json()
        self.assertGreaterEqual(adv_data["current_serving_token_number"], q["current_serving_token_number"])

    def test_08_pharmacy_and_medicines(self):
        """Test medicine search, Rx requirement filter, and pickup reservation."""
        res = self.client.get("/api/pharmacy/medicines?query=Dolo")
        self.assertEqual(res.status_code, 200)
        meds = res.json()
        self.assertGreater(len(meds), 0)
        first_med = meds[0]

        # Pickup reservation
        reserve_res = self.client.post("/api/pharmacy/reserve", json={
            "medicine_id": first_med["id"],
            "pharmacy_id": first_med["pharmacy_id"],
            "quantity": 1,
            "patient_name": "Rajesh Kumar",
            "patient_phone": "+919876543210"
        })
        self.assertEqual(reserve_res.status_code, 200)
        self.assertIn("reservation_token", reserve_res.json())

    def test_09_blood_and_organ_services(self):
        """Test blood donor pledge, emergency request, and organ pledge."""
        # Blood request
        br_res = self.client.post("/api/blood/requests", json={
            "patient_name": "Test Emergency Patient",
            "blood_group": "O+",
            "units_needed": 2,
            "hospital_name": "City General Hospital",
            "city": "Hyderabad",
            "urgency": "CRITICAL",
            "contact_name": "Relative",
            "contact_mobile": "+919876500000"
        })
        self.assertEqual(br_res.status_code, 201)

        # Organ pledge
        op_res = self.client.post("/api/organ/pledge", json={
            "full_name": "Compassionate Donor",
            "mobile": "+919876543210",
            "email": "donor@example.com",
            "city": "Hyderabad",
            "age": 29,
            "pledged_organs": ["Kidneys", "Liver", "Cornea"],
            "emergency_contact_name": "Parent",
            "emergency_contact_phone": "+919876543211",
            "consent_agreed": True
        })
        self.assertEqual(op_res.status_code, 201)
        self.assertIn("pledge_id", op_res.json())

    def test_10_ai_assistant_and_safety_intercept(self):
        """Test MEDI-LINK Jarvis assistant clinical guidance and red-flag emergency intercept."""
        # Red-flag emergency detection
        emergency_query = {
            "message": "I am having sudden acute chest pain and I cannot breathe!"
        }
        res_emerg = self.client.post("/api/ai/chat", json=emergency_query)
        self.assertEqual(res_emerg.status_code, 200)
        data_emerg = res_emerg.json()
        self.assertTrue(data_emerg["is_emergency"])
        self.assertIn("108", data_emerg["reply"])

        # Prescription explanation
        rx_query = {
            "message": "Explain prescription for Pan 40 and how to take it"
        }
        res_rx = self.client.post("/api/ai/chat", json=rx_query)
        self.assertEqual(res_rx.status_code, 200)
        self.assertIn("Pantoprazole", res_rx.json()["reply"])

    def test_11_emergency_sos_dispatch(self):
        """Test emergency SOS alert and trauma center routing."""
        sos_payload = {
            "user_name": "Rajesh Kumar",
            "user_mobile": "+919876543210",
            "address": "Banjara Hills Rd 12, Hyderabad",
            "emergency_type": "Cardiac Distress",
            "emergency_contact": "+919876543211"
        }
        res = self.client.post("/api/emergency/sos", json=sos_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["status"], "DISPATCHED")
        self.assertIn("AMB-", data["dispatched_vehicle"])

    def test_12_vitals_telemetry(self):
        """Test biometric telemetry and validated threshold detection."""
        # Post critical reading
        res = self.client.post("/api/vitals/log", json={
            "heart_rate": 145,
            "spo2": 88,
            "blood_pressure_sys": 170,
            "blood_pressure_dia": 105,
            "temperature": 101.2,
            "steps": 5400
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["alert"]["level"], "CRITICAL")


if __name__ == "__main__":
    unittest.main()
