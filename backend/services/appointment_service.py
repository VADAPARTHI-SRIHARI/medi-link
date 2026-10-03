"""
Medi-Link Appointment Service
Manages full appointment lifecycle: 7-step booking, rescheduling, cancellation, queue token generation,
status transitions, and full clinical audit trail.
"""
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status

from backend.database import query_db, execute_db
from backend.models import (
    AppointmentCreateRequest,
    AppointmentRescheduleRequest,
    AppointmentCancelRequest,
    AppointmentStatusUpdateRequest
)


class AppointmentService:
    @staticmethod
    def create_appointment(req: AppointmentCreateRequest, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Book a verified appointment through the multi-tier booking engine."""
        appointment_id = f"ML-{datetime.now().year}-{random.randint(10000, 99999)}"
        token_prefix = "OP"
        
        if req.appointment_type == "ayurvedic":
            token_prefix = "AY"
        elif req.appointment_type == "rmp":
            token_prefix = "RMP"
        elif req.appointment_type == "home_visit":
            token_prefix = "HV"
        elif req.appointment_type == "emergency":
            token_prefix = "EMERG"
        elif req.appointment_type == "clinic":
            token_prefix = "CL"
            
        queue_token = f"{token_prefix}-{random.randint(10, 45)}"

        # Default preparation notes based on department
        prep_notes = "Please bring past medical records, prescription slips, and government photo ID."
        if "cardio" in req.department.lower():
            prep_notes = "Fasting for 10 hours if fasting lipid/glucose tests are needed. Wear comfortable shoes for possible ECG/TMT."
        elif "ayur" in req.department.lower():
            prep_notes = "Avoid heavy or oily meals 2 hours prior to Nadi Pariksha (Pulse Examination)."
        elif req.appointment_type == "home_visit":
            prep_notes = "Doctor will arrive at your provided address. Keep any previous prescriptions and reports ready."

        doctor_name = req.doctor_name or "Assigned Department Consultant"
        facility_name = req.facility_name or "Medi-Link Partner Facility"

        execute_db("""
        INSERT INTO appointments (
            id, patient_id, patient_name, patient_mobile, doctor_id, doctor_name,
            facility_id, facility_name, department, appointment_type, date, time_slot,
            status, queue_token, symptoms, reason, home_address, is_elderly, wheelchair_needed,
            preparation_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, ?, ?)
        """, (
            appointment_id,
            user_id or "guest-patient",
            req.patient_name or "Registered Patient",
            req.patient_mobile or "+919876543210",
            req.doctor_id,
            doctor_name,
            req.facility_id,
            facility_name,
            req.department,
            req.appointment_type,
            req.date,
            req.time_slot,
            queue_token,
            req.symptoms,
            req.reason or "Clinical consultation",
            req.home_address,
            1 if req.is_elderly else 0,
            1 if req.wheelchair_needed else 0,
            prep_notes
        ))

        # Add initial audit log
        execute_db("""
        INSERT INTO appointment_audits (appointment_id, previous_status, new_status, changed_by, action_note)
        VALUES (?, NULL, 'CONFIRMED', 'System / Patient', ?)
        """, (appointment_id, f"Appointment successfully scheduled. Token assigned: {queue_token}"))

        return AppointmentService.get_appointment_by_id(appointment_id)

    @staticmethod
    def get_appointments(
        user_id: Optional[str] = None,
        role: Optional[str] = None,
        facility_id: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List appointments with role-based filtering."""
        sql = "SELECT * FROM appointments WHERE 1=1"
        params = []

        if role == "patient" and user_id:
            sql += " AND patient_id = ?"
            params.append(user_id)
        elif role == "staff" and facility_id:
            sql += " AND facility_id = ?"
            params.append(facility_id)

        if status_filter and status_filter.upper() != "ALL":
            sql += " AND status = ?"
            params.append(status_filter.upper())

        sql += " ORDER BY date ASC, time_slot ASC"
        appts = query_db(sql, tuple(params))
        return appts

    @staticmethod
    def get_appointment_by_id(appointment_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of a single appointment including audit trail."""
        appt = query_db("SELECT * FROM appointments WHERE id = ?", (appointment_id,), one=True)
        if not appt:
            return None
        
        audits = query_db(
            "SELECT * FROM appointment_audits WHERE appointment_id = ? ORDER BY timestamp DESC",
            (appointment_id,)
        )
        appt["audit_trail"] = audits
        return appt

    @staticmethod
    def cancel_appointment(appointment_id: str, req: AppointmentCancelRequest, actor: str = "Patient") -> Dict[str, Any]:
        """Cancel appointment with audit trail."""
        appt = query_db("SELECT * FROM appointments WHERE id = ?", (appointment_id,), one=True)
        if not appt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

        prev_status = appt["status"]
        if prev_status in ["COMPLETED", "CANCELLED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel an appointment that is already {prev_status.lower()}."
            )

        execute_db("""
        UPDATE appointments
        SET status = 'CANCELLED', cancel_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (req.cancel_reason, appointment_id))

        execute_db("""
        INSERT INTO appointment_audits (appointment_id, previous_status, new_status, changed_by, action_note)
        VALUES (?, ?, 'CANCELLED', ?, ?)
        """, (appointment_id, prev_status, actor, f"Reason: {req.cancel_reason}"))

        return AppointmentService.get_appointment_by_id(appointment_id)

    @staticmethod
    def reschedule_appointment(appointment_id: str, req: AppointmentRescheduleRequest, actor: str = "Patient") -> Dict[str, Any]:
        """Reschedule appointment to a new date and time slot with audit log."""
        appt = query_db("SELECT * FROM appointments WHERE id = ?", (appointment_id,), one=True)
        if not appt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

        prev_status = appt["status"]
        if prev_status in ["COMPLETED", "CANCELLED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reschedule an appointment that is already {prev_status.lower()}."
            )

        execute_db("""
        UPDATE appointments
        SET date = ?, time_slot = ?, status = 'RESCHEDULED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (req.new_date, req.new_time_slot, appointment_id))

        execute_db("""
        INSERT INTO appointment_audits (appointment_id, previous_status, new_status, changed_by, action_note)
        VALUES (?, ?, 'RESCHEDULED', ?, ?)
        """, (
            appointment_id,
            prev_status,
            actor,
            f"Rescheduled to {req.new_date} at {req.new_time_slot}. Reason: {req.reschedule_reason}"
        ))

        return AppointmentService.get_appointment_by_id(appointment_id)

    @staticmethod
    def update_status(appointment_id: str, req: AppointmentStatusUpdateRequest, actor: str = "Staff") -> Dict[str, Any]:
        """Update appointment status (Staff/Doctor action)."""
        appt = query_db("SELECT * FROM appointments WHERE id = ?", (appointment_id,), one=True)
        if not appt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

        prev_status = appt["status"]
        execute_db("""
        UPDATE appointments
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (req.status.upper(), appointment_id))

        execute_db("""
        INSERT INTO appointment_audits (appointment_id, previous_status, new_status, changed_by, action_note)
        VALUES (?, ?, ?, ?, ?)
        """, (appointment_id, prev_status, req.status.upper(), actor, req.notes or f"Status changed to {req.status}"))

        return AppointmentService.get_appointment_by_id(appointment_id)
