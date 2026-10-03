"""
Medi-Link Health & Wearable Monitoring Service
Simulates real-time physiological vitals telemetry (Heart Rate, SpO2, Blood Pressure, Body Temp),
trend analysis, and validated clinical threshold alerts.
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
from backend.database import query_db, execute_db
from backend.models import VitalsLogRequest


class VitalsService:
    @staticmethod
    def get_latest_vitals(user_id: str = "usr-pat-01") -> Dict[str, Any]:
        """Fetch latest telemetry readings and past 24-hour trends."""
        recent = query_db(
            "SELECT * FROM vitals_logs WHERE user_id = ? ORDER BY id DESC LIMIT 10",
            (user_id,)
        )

        if not recent:
            # Seed default if empty
            execute_db("""
            INSERT INTO vitals_logs (user_id, heart_rate, spo2, blood_pressure_sys, blood_pressure_dia, temperature, steps, status)
            VALUES (?, 74, 98, 120, 80, 98.6, 6800, 'NORMAL')
            """, (user_id,))
            recent = query_db(
                "SELECT * FROM vitals_logs WHERE user_id = ? ORDER BY id DESC LIMIT 10",
                (user_id,)
            )

        current = recent[0]
        hr = current["heart_rate"]
        spo2 = current["spo2"]
        sys_bp = current["blood_pressure_sys"]
        dia_bp = current["blood_pressure_dia"]

        # Validate thresholds
        alert_level = "NORMAL"
        alert_message = "All biometric vitals within normal resting ranges."

        if hr > 130 or hr < 45 or spo2 < 90 or sys_bp > 160:
            alert_level = "CRITICAL"
            alert_message = f"CRITICAL ANOMALY: Heart rate ({hr} bpm) or SpO2 ({spo2}%) crossed safety threshold."
        elif hr > 100 or spo2 < 94 or sys_bp > 135:
            alert_level = "WARNING"
            alert_message = f"Elevated reading detected: Resting HR is {hr} bpm. Please sit quietly and re-check."

        return {
            "device": {
                "name": current.get("device_id", "MediWatch-Pro-7X"),
                "battery": "88%",
                "status": "Connected (Bluetooth BLE Sync)",
                "last_synced": "Just now"
            },
            "metrics": {
                "heart_rate": {"value": hr, "unit": "BPM", "status": "critical" if hr > 130 else "elevated" if hr > 100 else "normal"},
                "spo2": {"value": spo2, "unit": "%", "status": "critical" if spo2 < 90 else "low" if spo2 < 94 else "normal"},
                "blood_pressure": {"value": f"{sys_bp}/{dia_bp}", "unit": "mmHg", "status": "elevated" if sys_bp > 135 else "normal"},
                "temperature": {"value": current["temperature"], "unit": "°F", "status": "normal"},
                "steps": {"value": current["steps"], "unit": "steps", "goal": 10000}
            },
            "alert": {
                "level": alert_level,
                "message": alert_message,
                "consent_for_family_notification": True
            },
            "trends": [
                {"time": "08:00 AM", "hr": 72, "spo2": 98},
                {"time": "11:00 AM", "hr": 78, "spo2": 99},
                {"time": "02:00 PM", "hr": 84, "spo2": 97},
                {"time": "05:00 PM", "hr": 76, "spo2": 98},
                {"time": "Now", "hr": hr, "spo2": spo2}
            ],
            "disclaimer": "Simulated wearable vitals integration. Clinical diagnosis must always be confirmed using calibrated medical diagnostic instruments."
        }

    @staticmethod
    def record_reading(req: VitalsLogRequest, user_id: str = "usr-pat-01") -> Dict[str, Any]:
        """Record new vitals reading (from device sync or user test)."""
        status_val = "NORMAL"
        if req.heart_rate > 130 or req.spo2 < 90 or req.blood_pressure_sys > 160:
            status_val = "CRITICAL"
        elif req.heart_rate > 100 or req.spo2 < 94:
            status_val = "WARNING"

        execute_db("""
        INSERT INTO vitals_logs (user_id, heart_rate, spo2, blood_pressure_sys, blood_pressure_dia, temperature, steps, device_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, req.heart_rate, req.spo2, req.blood_pressure_sys, req.blood_pressure_dia, req.temperature, req.steps, req.device_id, status_val))

        return VitalsService.get_latest_vitals(user_id)
