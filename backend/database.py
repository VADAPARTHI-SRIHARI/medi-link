"""
Medi-Link Database Management
Provides SQLite database connection, table schemas, and query execution helpers.
"""
import sqlite3
import os
from typing import List, Dict, Any, Optional
from backend.config import DATABASE_PATH


def get_db_connection() -> sqlite3.Connection:
    """Create a thread-safe connection to the SQLite database with Row mapping."""
    conn = sqlite3.connect(DATABASE_PATH, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Initialize all SQLite tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table (Patients, Hospital Staff, Doctors, Admins)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        location TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'patient',
        hospital_affiliation TEXT,
        department TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Facilities table (Hospitals, Clinics, RMP Clinics, Ayurvedic Centres)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- hospital, clinic, rmp_clinic, ayurvedic_centre
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'Telangana',
        lat REAL DEFAULT 17.3850,
        lng REAL DEFAULT 78.4867,
        phone TEXT NOT NULL,
        emergency_available INTEGER DEFAULT 0,
        opd_timings TEXT DEFAULT '09:00 AM - 08:00 PM',
        departments TEXT, -- JSON or comma-separated
        rating REAL DEFAULT 4.5,
        description TEXT,
        image_url TEXT
    );
    """)

    # 3. Doctors & Healthcare Providers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        qualification TEXT NOT NULL,
        specialty TEXT NOT NULL,
        department TEXT NOT NULL,
        facility_id TEXT NOT NULL,
        facility_name TEXT NOT NULL,
        experience_years INTEGER NOT NULL,
        reg_number TEXT NOT NULL,
        reg_council TEXT NOT NULL,
        fee INTEGER NOT NULL DEFAULT 500,
        home_visit_available INTEGER DEFAULT 0,
        consultation_types TEXT DEFAULT 'in_person,teleconsult', -- in_person, teleconsult, home_visit
        rating REAL DEFAULT 4.8,
        timings TEXT DEFAULT '10:00 AM - 02:00 PM, 05:00 PM - 08:00 PM',
        bio TEXT,
        available_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
        image_url TEXT,
        FOREIGN KEY (facility_id) REFERENCES facilities (id)
    );
    """)

    # 4. Appointments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        patient_mobile TEXT NOT NULL,
        doctor_id TEXT,
        doctor_name TEXT NOT NULL,
        facility_id TEXT,
        facility_name TEXT NOT NULL,
        department TEXT NOT NULL,
        appointment_type TEXT NOT NULL DEFAULT 'doctor', -- doctor, hospital_op, clinic, rmp, ayurvedic, home_visit, emergency
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'CONFIRMED', -- PENDING, CONFIRMED, WAITING, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
        queue_token TEXT,
        symptoms TEXT,
        reason TEXT,
        home_address TEXT,
        is_elderly INTEGER DEFAULT 0,
        wheelchair_needed INTEGER DEFAULT 0,
        preparation_notes TEXT,
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Appointment Audit Trail
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointment_audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id TEXT NOT NULL,
        previous_status TEXT,
        new_status TEXT NOT NULL,
        changed_by TEXT NOT NULL,
        action_note TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments (id)
    );
    """)

    # 6. Queues table (Live Token and Waiting time tracking)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS queues (
        id TEXT PRIMARY KEY,
        facility_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        doctor_id TEXT,
        date TEXT NOT NULL,
        current_serving_token INTEGER DEFAULT 1,
        total_tokens INTEGER DEFAULT 20,
        estimated_wait_mins_per_patient INTEGER DEFAULT 8,
        delay_minutes INTEGER DEFAULT 0,
        delay_reason TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Pharmacies table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pharmacies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        distance_km REAL DEFAULT 1.2,
        phone TEXT NOT NULL,
        open_hours TEXT DEFAULT '24 Hours',
        delivery_available INTEGER DEFAULT 1,
        lat REAL,
        lng REAL
    );
    """)

    # 8. Medicines table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        pharmacy_id TEXT NOT NULL,
        name TEXT NOT NULL,
        generic_name TEXT NOT NULL,
        category TEXT NOT NULL, -- Allopathy, Ayurveda, Pediatric, Emergency
        dosage TEXT NOT NULL,
        form TEXT NOT NULL, -- Tablet, Syrup, Capsule, Ointment, Injection
        price REAL NOT NULL,
        in_stock INTEGER DEFAULT 1,
        stock_quantity INTEGER DEFAULT 50,
        prescription_required INTEGER DEFAULT 1,
        instructions TEXT,
        FOREIGN KEY (pharmacy_id) REFERENCES pharmacies (id)
    );
    """)

    # 9. Blood Donors table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blood_donors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        city TEXT NOT NULL,
        last_donation_date TEXT,
        eligible INTEGER DEFAULT 1,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 10. Blood Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blood_requests (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        units_needed INTEGER NOT NULL,
        hospital_name TEXT NOT NULL,
        city TEXT NOT NULL,
        urgency TEXT NOT NULL DEFAULT 'URGENT', -- CRITICAL, URGENT, SCHEDULED
        contact_name TEXT NOT NULL,
        contact_mobile TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'MATCHING', -- MATCHING, ASSIGNED, FULFILLED
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 11. Organ Pledges table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS organ_pledges (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT NOT NULL,
        city TEXT NOT NULL,
        age INTEGER NOT NULL,
        pledged_organs TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        consent_agreed INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 12. Organ Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS organ_requests (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        organ_type TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        city TEXT NOT NULL,
        urgency TEXT NOT NULL DEFAULT 'HIGH',
        registry_ref TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ON_REGISTRY_LIST',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 13. Emergency Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_alerts (
        id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        user_mobile TEXT NOT NULL,
        location_lat REAL,
        location_lng REAL,
        address TEXT NOT NULL,
        emergency_type TEXT NOT NULL,
        symptoms TEXT,
        emergency_contact TEXT,
        status TEXT NOT NULL DEFAULT 'DISPATCHED_SIMULATED',
        ambulance_vehicle_no TEXT DEFAULT 'AMB-TS-09-5421',
        dispatched_hospital TEXT DEFAULT 'City Trauma & Emergency Center',
        eta_minutes INTEGER DEFAULT 8,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 14. Vitals Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vitals_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        heart_rate INTEGER NOT NULL,
        spo2 INTEGER NOT NULL,
        blood_pressure_sys INTEGER NOT NULL,
        blood_pressure_dia INTEGER NOT NULL,
        temperature REAL NOT NULL,
        steps INTEGER DEFAULT 0,
        device_id TEXT DEFAULT 'MediWatch-Pro-7X',
        status TEXT DEFAULT 'NORMAL', -- NORMAL, WARNING, CRITICAL
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()


def query_db(query: str, args: tuple = (), one: bool = False) -> Any:
    """Execute a query and fetch dictionary results."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    if not rv:
        return None if one else []
    return dict(rv[0]) if one else [dict(row) for row in rv]


def execute_db(query: str, args: tuple = ()) -> int:
    """Execute a DML query and commit, returning the last row id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id
