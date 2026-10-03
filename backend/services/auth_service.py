"""
Medi-Link Authentication Service
Handles patient registration, staff registration, credential verification, and profile management.
"""
import uuid
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

from backend.database import query_db, execute_db
from backend.security import hash_password, verify_password, create_access_token
from backend.models import PatientRegisterRequest, StaffRegisterRequest, LoginRequest


class AuthService:
    @staticmethod
    def register_patient(req: PatientRegisterRequest) -> Dict[str, Any]:
        """Register a new patient with input validation and password hashing."""
        existing = query_db("SELECT id FROM users WHERE email = ?", (req.email,), one=True)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please log in."
            )
        
        user_id = f"usr-pat-{uuid.uuid4().hex[:8]}"
        hashed_pw = hash_password(req.password)

        execute_db("""
        INSERT INTO users (id, name, email, mobile, location, password_hash, role)
        VALUES (?, ?, ?, ?, ?, ?, 'patient')
        """, (user_id, req.name, req.email, req.mobile, req.location, hashed_pw))

        user_data = query_db(
            "SELECT id, name, email, mobile, location, role, hospital_affiliation, department, created_at FROM users WHERE id = ?",
            (user_id,),
            one=True
        )
        token = create_access_token({"sub": user_id, "email": req.email, "role": "patient", "name": req.name})
        return {"access_token": token, "token_type": "bearer", "user": user_data}

    @staticmethod
    def register_staff(req: StaffRegisterRequest) -> Dict[str, Any]:
        """Register hospital administration or clinical staff."""
        existing = query_db("SELECT id FROM users WHERE email = ?", (req.email,), one=True)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please log in."
            )
        
        user_id = f"usr-staff-{uuid.uuid4().hex[:8]}"
        hashed_pw = hash_password(req.password)

        execute_db("""
        INSERT INTO users (id, name, email, mobile, location, password_hash, role, hospital_affiliation, department)
        VALUES (?, ?, ?, ?, ?, ?, 'staff', ?, ?)
        """, (user_id, req.employee_name, req.email, req.mobile, req.location, hashed_pw, req.hospital_affiliation, req.department))

        user_data = query_db(
            "SELECT id, name, email, mobile, location, role, hospital_affiliation, department, created_at FROM users WHERE id = ?",
            (user_id,),
            one=True
        )
        token = create_access_token({
            "sub": user_id,
            "email": req.email,
            "role": "staff",
            "name": req.employee_name,
            "hospital": req.hospital_affiliation,
            "department": req.department
        })
        return {"access_token": token, "token_type": "bearer", "user": user_data}

    @staticmethod
    def login(req: LoginRequest) -> Dict[str, Any]:
        """Authenticate user and generate signed JWT token."""
        user = query_db("SELECT * FROM users WHERE email = ?", (req.email,), one=True)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password combination."
            )
        
        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password combination."
            )
        
        # Verify requested role matches if provided
        if req.role and req.role != "universal" and user["role"] != req.role:
            if req.role == "staff" and user["role"] not in ["staff", "admin", "doctor"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"This account is registered as a {user['role'].title()}. Please use the Patient Login."
                )

        token_payload = {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
            "name": user["name"]
        }
        if user["hospital_affiliation"]:
            token_payload["hospital"] = user["hospital_affiliation"]
            token_payload["department"] = user["department"]

        token = create_access_token(token_payload)

        safe_user = {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "mobile": user["mobile"],
            "location": user["location"],
            "role": user["role"],
            "hospital_affiliation": user["hospital_affiliation"],
            "department": user["department"],
            "created_at": user["created_at"]
        }
        return {"access_token": token, "token_type": "bearer", "user": safe_user}

    @staticmethod
    def get_profile(user_id: str) -> Dict[str, Any]:
        """Get profile details for current session."""
        user = query_db(
            "SELECT id, name, email, mobile, location, role, hospital_affiliation, department, created_at FROM users WHERE id = ?",
            (user_id,),
            one=True
        )
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
        return user
