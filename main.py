"""
MEDI-LINK Full-Stack Platform Entrypoint
Tagline: "Right Care. Right Doctor. Right Place. Right Time."
Subtitle: "Your Health • Our Priority"
"""
import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.config import APP_NAME, TAGLINE, SUBTITLE, VERSION, STATIC_DIR, CORS_ORIGINS
from backend.database import init_db
from backend.seed_data import seed_database

# Import routers
from backend.routers.auth_router import router as auth_router
from backend.routers.doctor_router import router as doctor_router
from backend.routers.hospital_router import router as hospital_router
from backend.routers.appointment_router import router as appointment_router
from backend.routers.queue_router import router as queue_router
from backend.routers.pharmacy_router import router as pharmacy_router
from backend.routers.blood_router import router as blood_router
from backend.routers.organ_router import router as organ_router
from backend.routers.ai_router import router as ai_router
from backend.routers.emergency_router import router as emergency_router
from backend.routers.vitals_router import router as vitals_router

# Initialize FastAPI application
app = FastAPI(
    title=APP_NAME,
    description=f"**{TAGLINE}** — {SUBTITLE}\n\nComprehensive full-stack healthcare ecosystem platform integrating multi-tier provider discovery, hospital suitability AI triage, live OPD queue tracking, emergency SOS, pharmacy inventory, blood and organ services, and elder-friendly accessibility.",
    version=VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Initialize database tables and seed initial data."""
    init_db()
    seed_database()
    print(f"==================================================")
    print(f" {APP_NAME} v{VERSION} - Online")
    print(f" Tagline: '{TAGLINE}'")
    print(f" Subtitle: '{SUBTITLE}'")
    print(f" Swagger Docs: http://localhost:8000/docs")
    print(f" Web Portal:   http://localhost:8000/")
    print(f"==================================================")


# Health Check
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": APP_NAME,
        "tagline": TAGLINE,
        "subtitle": SUBTITLE,
        "version": VERSION
    }


# Include all API routers
app.include_router(auth_router)
app.include_router(doctor_router)
app.include_router(hospital_router)
app.include_router(appointment_router)
app.include_router(queue_router)
app.include_router(pharmacy_router)
app.include_router(blood_router)
app.include_router(organ_router)
app.include_router(ai_router)
app.include_router(emergency_router)
app.include_router(vitals_router)

# Mount static files
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Serve SPA index.html for root and frontend paths
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    # If request is an API route that was not found, return 404 JSON instead of HTML
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
    
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse(status_code=404, content={"detail": "Frontend index.html not found"})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
