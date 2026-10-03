"""
Medi-Link Configuration Module
Defines application configuration, security settings, and paths.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

DATABASE_PATH = str(DATA_DIR / "medilink.db")

# Security configuration (in production, use environment variables)
SECRET_KEY = os.getenv("MEDILINK_SECRET_KEY", "medi-link-healthcare-ultra-secure-key-2026-v1")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for user convenience in demo

# CORS origins
CORS_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]

# Tagline & Platform branding
APP_NAME = "MEDI-LINK"
TAGLINE = "Right Care. Right Doctor. Right Place. Right Time."
SUBTITLE = "Your Health • Our Priority"
VERSION = "1.0.0"
