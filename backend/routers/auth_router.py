"""
Medi-Link Authentication API Router
Routes for patient registration, staff registration, login, and profile retrieval.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from backend.models import (
    PatientRegisterRequest,
    StaffRegisterRequest,
    LoginRequest,
    AuthTokenResponse,
    UserResponse
)
from backend.services.auth_service import AuthService
from backend.security import get_current_user_required

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_patient(payload: PatientRegisterRequest):
    """Register a new patient account with validation."""
    return AuthService.register_patient(payload)


@router.post("/staff/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_staff(payload: StaffRegisterRequest):
    """Register a hospital employee or administrative staff account."""
    return AuthService.register_staff(payload)


@router.post("/login", response_model=AuthTokenResponse)
def login_patient(payload: LoginRequest):
    """Authenticate patient or general user."""
    return AuthService.login(payload)


@router.post("/staff/login", response_model=AuthTokenResponse)
def login_staff(payload: LoginRequest):
    """Authenticate hospital administration or clinical staff."""
    payload.role = "staff"
    return AuthService.login(payload)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: dict = Depends(get_current_user_required)):
    """Retrieve current logged-in user profile from JWT session."""
    return AuthService.get_profile(user["sub"])
