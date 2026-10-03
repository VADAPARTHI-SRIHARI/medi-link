"""
Medi-Link AI Assistant API Router
"""
from fastapi import APIRouter
from backend.services.ai_service import AIService
from backend.models import AIChatRequest

router = APIRouter(prefix="/api/ai", tags=["Medi-Link AI"])


@router.post("/chat")
def chat_with_assistant(payload: AIChatRequest):
    """
    Jarvis-style healthcare support assistant:
    - Triage & department routing
    - Prescription explanation
    - Dietary guidance
    - Red-flag emergency interception
    """
    return AIService.process_query(
        message=payload.message,
        mode=payload.mode or "general",
        history=payload.history
    )
