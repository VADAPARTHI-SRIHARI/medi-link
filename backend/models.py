"""
Medi-Link Data Validation Models
Pydantic schemas for all request and response payloads.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ----------------- AUTHENTICATION MODELS -----------------

class PatientRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full patient name")
    email: EmailStr = Field(..., description="Gmail or valid email address")
    mobile: str = Field(..., min_length=10, max_length=15, description="Mobile contact number")
    location: str = Field(..., min_length=2, max_length=100, description="City / Locality")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    confirm_password: str = Field(..., description="Confirm password match")

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        clean = re.sub(r"[^\d+]", "", v)
        if len(clean) < 10:
            raise ValueError("Mobile number must contain at least 10 digits")
        return clean

    @field_validator("confirm_password")
    @classmethod
    def validate_passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class StaffRegisterRequest(BaseModel):
    employee_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(..., description="Work or personal email")
    mobile: str = Field(..., min_length=10, max_length=15)
    location: str = Field(..., min_length=2, max_length=100)
    hospital_affiliation: str = Field(..., min_length=2, max_length=150)
    department: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(...)

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        clean = re.sub(r"[^\d+]", "", v)
        if len(clean) < 10:
            raise ValueError("Mobile number must contain at least 10 digits")
        return clean

    @field_validator("confirm_password")
    @classmethod
    def validate_passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "patient"  # patient, staff, doctor, admin


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    mobile: str
    location: str
    role: str
    hospital_affiliation: Optional[str] = None
    department: Optional[str] = None
    created_at: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- APPOINTMENTS & BOOKING MODELS -----------------

class AppointmentCreateRequest(BaseModel):
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None
    department: str
    appointment_type: str = Field(
        "doctor", 
        description="doctor, hospital_op, clinic, rmp, ayurvedic, home_visit, emergency"
    )
    date: str = Field(..., description="YYYY-MM-DD")
    time_slot: str = Field(..., description="e.g. 10:00 AM - 10:30 AM")
    patient_name: Optional[str] = None
    patient_mobile: Optional[str] = None
    symptoms: Optional[str] = None
    reason: Optional[str] = None
    home_address: Optional[str] = None
    past_history: Optional[str] = None
    is_elderly: Optional[bool] = False
    wheelchair_needed: Optional[bool] = False


class AppointmentRescheduleRequest(BaseModel):
    new_date: str
    new_time_slot: str
    reschedule_reason: Optional[str] = "Patient requested reschedule"


class AppointmentCancelRequest(BaseModel):
    cancel_reason: str = "Personal emergency / Conflict"


class AppointmentStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="PENDING, CONFIRMED, WAITING, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED")
    notes: Optional[str] = None


# ----------------- QUEUE MODELS -----------------

class QueueAdvanceRequest(BaseModel):
    facility_id: str
    department_id: str
    doctor_id: Optional[str] = None
    action: str = Field("next", description="next, delay, call_specific")
    delay_minutes: Optional[int] = 0
    delay_reason: Optional[str] = None


# ----------------- SUITABILITY & AI MODELS -----------------

class SymptomSuitabilityRequest(BaseModel):
    symptoms: str = Field(..., min_length=3, description="Health complaint or symptoms")
    location: Optional[str] = "Hyderabad"
    preferred_care_type: Optional[str] = "all"  # all, hospital, clinic, rmp, ayurvedic, home_visit


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    mode: Optional[str] = "general"  # general, prescription_explain, nutritionist, department_finder, triage
    history: Optional[List[Dict[str, str]]] = []
    user_context: Optional[Dict[str, Any]] = None


# ----------------- MEDICINE & PHARMACY MODELS -----------------

class MedicineSearchRequest(BaseModel):
    query: Optional[str] = ""
    location: Optional[str] = ""
    prescription_only: Optional[bool] = None


class MedicineReserveRequest(BaseModel):
    medicine_id: str
    pharmacy_id: str
    quantity: int = 1
    patient_name: str
    patient_phone: str
    prescription_notes: Optional[str] = None


# ----------------- BLOOD SERVICES MODELS -----------------

class BloodDonationRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    blood_group: str = Field(..., pattern=r"^(A|B|AB|O)[+-]$")
    mobile: str = Field(..., min_length=10)
    email: Optional[EmailStr] = None
    age: int = Field(..., ge=18, le=65)
    gender: str
    city: str
    last_donation_date: Optional[str] = None
    medical_declaration: bool = True


class BloodRequestCreateRequest(BaseModel):
    patient_name: str = Field(..., min_length=2)
    blood_group: str = Field(..., pattern=r"^(A|B|AB|O)[+-]$")
    units_needed: int = Field(..., ge=1, le=10)
    hospital_name: str
    city: str
    urgency: str = Field("URGENT", description="CRITICAL, URGENT, SCHEDULED")
    contact_name: str
    contact_mobile: str
    notes: Optional[str] = None


# ----------------- ORGAN SERVICES MODELS -----------------

class OrganPledgeRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    mobile: str = Field(..., min_length=10)
    email: EmailStr
    city: str
    age: int = Field(..., ge=18)
    pledged_organs: List[str] = Field(..., min_items=1)  # Kidneys, Liver, Heart, Cornea, Lungs, Pancreas
    emergency_contact_name: str
    emergency_contact_phone: str
    consent_agreed: bool = True


class OrganRequestCreateRequest(BaseModel):
    patient_name: str
    organ_type: str
    hospital_name: str
    city: str
    urgency: str = "HIGH"
    physician_name: Optional[str] = None
    notes: Optional[str] = None


# ----------------- EMERGENCY MODELS -----------------

class EmergencySOSAlertRequest(BaseModel):
    user_name: str
    user_mobile: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    address: str
    emergency_type: str = "Medical Emergency / Trauma"
    symptoms: Optional[str] = None
    emergency_contact: Optional[str] = None


class EmergencyAppointmentRequest(BaseModel):
    patient_name: str
    mobile: str
    symptoms: str
    severity: str = "CRITICAL"  # SEVERE, CRITICAL
    location: str
    preferred_hospital_id: Optional[str] = None
    triage_notes: Optional[str] = None


# ----------------- VITALS MONITORING MODELS -----------------

class VitalsLogRequest(BaseModel):
    heart_rate: int = Field(..., ge=30, le=250)
    spo2: int = Field(..., ge=50, le=100)
    blood_pressure_sys: int = Field(120, ge=60, le=240)
    blood_pressure_dia: int = Field(80, ge=40, le=160)
    temperature: float = Field(98.6, ge=92.0, le=108.0)
    steps: Optional[int] = 0
    device_id: Optional[str] = "MediWatch-Pro-7X"
