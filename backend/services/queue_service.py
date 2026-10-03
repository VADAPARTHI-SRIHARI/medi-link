"""
Medi-Link Live Queue & Waiting Time Service
Tracks real-time OPD and clinic token queues, delay notifications, and waiting time estimates.
"""
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from backend.database import query_db, execute_db
from backend.models import QueueAdvanceRequest


class QueueService:
    @staticmethod
    def get_queue_status(facility_id: str = "fac-hosp-01", department: str = "Cardiology", user_token: Optional[str] = "OP-14") -> Dict[str, Any]:
        """Fetch current queue metrics for a department or facility."""
        q = query_db(
            "SELECT * FROM queues WHERE facility_id = ? AND department_id = ?",
            (facility_id, department),
            one=True
        )

        if not q:
            # Fallback or create default queue for demo
            q = {
                "id": f"q-{facility_id[:8]}",
                "facility_id": facility_id,
                "department_id": department,
                "current_serving_token": 11,
                "total_tokens": 25,
                "estimated_wait_mins_per_patient": 8,
                "delay_minutes": 10,
                "delay_reason": "Consultant attending an urgent inpatient ECG review."
            }

        # Calculate people ahead and estimated waiting time
        current_serving = q["current_serving_token"]
        user_num = 14
        if user_token:
            parts = user_token.split("-")
            if len(parts) > 1 and parts[1].isdigit():
                user_num = int(parts[1])

        people_ahead = max(0, user_num - current_serving)
        wait_mins_per_patient = q.get("estimated_wait_mins_per_patient", 8)
        base_wait = people_ahead * wait_mins_per_patient
        total_estimated_wait = base_wait + (q.get("delay_minutes", 0) or 0)

        return {
            "facility_id": facility_id,
            "department": department,
            "your_token": user_token or f"OP-{user_num}",
            "current_serving_token_number": current_serving,
            "current_serving_token": f"OP-{current_serving:02d}",
            "people_ahead": people_ahead,
            "estimated_wait_minutes": total_estimated_wait,
            "wait_time_display": f"{total_estimated_wait} mins" if total_estimated_wait > 0 else "Ready now / In consultation",
            "delay_minutes": q.get("delay_minutes", 0) or 0,
            "delay_reason": q.get("delay_reason"),
            "is_simulation": True,
            "integration_label": "Medi-Link Live OPD Queue Sync (Simulated Demo Stream)",
            "average_time_per_patient": f"{wait_mins_per_patient} mins"
        }

    @staticmethod
    def advance_queue(req: QueueAdvanceRequest) -> Dict[str, Any]:
        """Advance queue token or update delay (Staff or Demo interaction)."""
        q = query_db(
            "SELECT * FROM queues WHERE facility_id = ? AND department_id = ?",
            (req.facility_id, req.department_id),
            one=True
        )

        if not q:
            # Create if doesn't exist
            q_id = f"q-{req.facility_id[:8]}"
            execute_db("""
            INSERT INTO queues (id, facility_id, department_id, current_serving_token, total_tokens, estimated_wait_mins_per_patient, delay_minutes, delay_reason)
            VALUES (?, ?, ?, 1, 30, 8, ?, ?)
            """, (q_id, req.facility_id, req.department_id, req.delay_minutes or 0, req.delay_reason))
            current = 1
        else:
            q_id = q["id"]
            current = q["current_serving_token"]

        if req.action == "next":
            new_serving = current + 1
            execute_db("""
            UPDATE queues
            SET current_serving_token = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, (new_serving, q_id))
        elif req.action == "delay":
            execute_db("""
            UPDATE queues
            SET delay_minutes = ?, delay_reason = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """, (req.delay_minutes or 15, req.delay_reason or "Emergency procedure in progress", q_id))

        return QueueService.get_queue_status(req.facility_id, req.department_id)
