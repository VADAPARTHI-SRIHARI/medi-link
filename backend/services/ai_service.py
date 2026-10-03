"""
Medi-Link AI Healthcare Assistant (Jarvis-style)
Provides clinical triage guidance, department routing, prescription explanation,
dietary counseling, and red-flag emergency detection with strict safety guardrails.
"""
from typing import Dict, Any, List, Optional
import re
from backend.services.hospital_service import HospitalService
from backend.services.doctor_service import DoctorService
from backend.services.pharmacy_service import PharmacyService


class AIService:
    RED_FLAG_PATTERNS = [
        r"chest pain", r"heart attack", r"can't breathe", r"cannot breathe", r"shortness of breath",
        r"severe bleeding", r"unconscious", r"collapsed", r"stroke", r"paralysis",
        r"slurred speech", r"seizure", r"coughing blood", r"severe anaphylaxis"
    ]

    PRESCRIPTION_KNOWLEDGE = {
        "dolo": {
            "name": "Dolo 650mg (Paracetamol)",
            "purpose": "Analgesic and antipyretic used to reduce fever and alleviate mild to moderate pain (headaches, muscular aches).",
            "usage": "Usually 1 tablet every 6 hours after meals as needed. Do not exceed 4000mg (4g) within a 24-hour period.",
            "precautions": "Avoid combining with other paracetamol-containing syrups or tablets. Consult doctor if you have liver conditions or alcohol history.",
            "questions_for_doctor": ["How many consecutive days should I take this if my fever persists?", "Can I take this on an empty stomach?"]
        },
        "augmentin": {
            "name": "Augmentin 625 Duo (Amoxicillin + Clavulanic Acid)",
            "purpose": "Broad-spectrum penicillin-class antibiotic for bacterial infections (sinusitis, respiratory tract, dental, skin).",
            "usage": "Take strictly as directed by your physician at evenly spaced intervals with meals to minimize stomach upset.",
            "precautions": "Complete the full course even if you feel better to prevent antibiotic resistance. Inform your doctor if you develop a severe rash or diarrhea.",
            "questions_for_doctor": ["Should I take a probiotic alongside this?", "What should I do if I miss a scheduled dose?"]
        },
        "pan": {
            "name": "Pan 40 (Pantoprazole)",
            "purpose": "Proton pump inhibitor (PPI) that reduces gastric stomach acid production to treat GERD, acid reflux, and gastritis.",
            "usage": "Standard instruction is 1 tablet taken orally once daily in the morning, 30 to 60 minutes before breakfast.",
            "precautions": "Do not crush or chew the gastro-resistant tablet; swallow whole with water.",
            "questions_for_doctor": ["How long is this course intended for?", "Can I discontinue once acidity subsides?"]
        },
        "telma": {
            "name": "Telma 40mg (Telmisartan)",
            "purpose": "Angiotensin II Receptor Blocker (ARB) prescribed for high blood pressure (hypertension) and cardiovascular risk reduction.",
            "usage": "Take once daily with or without food at the same time every morning. Monitor BP periodically.",
            "precautions": "Do not stop abruptly without doctor consultation. Stay well-hydrated.",
            "questions_for_doctor": ["What is my target blood pressure reading?", "Are there any dietary potassium precautions?"]
        },
        "ashwagandha": {
            "name": "Ashwagandha Churna / Tablets",
            "purpose": "Traditional Ayurvedic adaptogenic herb known for balancing Vata/Kapha, reducing mental stress, and supporting vitality.",
            "usage": "Typically 1/2 teaspoon churna with warm cow's milk or lukewarm water before bedtime.",
            "precautions": "Inform your treating physician if you have thyroid disorders, autoimmune issues, or are pregnant.",
            "questions_for_doctor": ["Does this interact with my regular allopathic prescriptions?"]
        }
    }

    @staticmethod
    def process_query(message: str, mode: str = "general", history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Process user query with safety-first clinical reasoning:
        1. Emergency Red-Flag Intercept
        2. Prescription Explanation Engine
        3. Nutritionist & Diet Counselor
        4. Department & Care Provider Navigator
        5. General Conversational Healthcare Assistant
        """
        cleaned = message.lower().strip()

        # Step 1: Check Red-Flag Emergency Symptoms
        for pattern in AIService.RED_FLAG_PATTERNS:
            if re.search(pattern, cleaned):
                return {
                    "reply": (
                        "🚨 **URGENT MEDICAL ALERT DETECTED**\n\n"
                        "Your query mentions symptoms such as **chest pain, severe respiratory distress, or stroke signs** "
                        "which require **immediate emergency clinical attention**.\n\n"
                        "**Immediate Actions:**\n"
                        "1. **Call Emergency Services immediately:** Dial **108** or **112**.\n"
                        "2. Tap the **Red Emergency SOS button** on your screen to notify nearby trauma hospitals.\n"
                        "3. Rest in a comfortable position, loosen tight clothing, and do not drive yourself.\n\n"
                        "*Medi-Link AI prioritizes your safety. Please seek emergency medical care immediately.*"
                    ),
                    "is_emergency": True,
                    "suggested_actions": ["Emergency SOS", "Dial 108", "Find Nearest Trauma Center"],
                    "category": "emergency"
                }

        # Step 2: Prescription Explanation Mode
        if mode == "prescription_explain" or any(w in cleaned for w in ["prescription", "explain medicine", "dosage", "side effect", "how to take", "pan 40", "dolo", "augmentin", "telma"]):
            for key, info in AIService.PRESCRIPTION_KNOWLEDGE.items():
                if key in cleaned:
                    return {
                        "reply": (
                            f"📋 **Prescription Guide: {info['name']}**\n\n"
                            f"**What it is used for:**\n{info['purpose']}\n\n"
                            f"**Standard Administration Guidelines:**\n{info['usage']}\n\n"
                            f"⚠️ **Important Precautions:**\n{info['precautions']}\n\n"
                            f"**Suggested Questions to ask your Doctor:**\n" +
                            "\n".join([f"• {q}" for q in info['questions_for_doctor']]) +
                            "\n\n*Safety Notice: Medi-Link AI provides educational information only. Never alter or discontinue prescribed medication without consulting your prescribing doctor.*"
                        ),
                        "is_emergency": False,
                        "suggested_actions": ["Find Medicine in Pharmacy", "Book Doctor Follow-up", "Set Medication Reminder"],
                        "category": "prescription"
                    }
            
            # Generic prescription guide if specific medicine not in index
            return {
                "reply": (
                    "📋 **Prescription Consultation Assistant**\n\n"
                    "I can help explain common medications, their therapeutic classes, timing instructions (before/after food), "
                    "and questions you should clarify with your physician.\n\n"
                    "You can mention specific medicine names like **Dolo 650**, **Augmentin 625**, **Pan 40**, **Telma 40**, or Ayurvedic remedies like **Ashwagandha**.\n\n"
                    "*Reminder: Always carry your physical prescription slip when purchasing medicines at certified pharmacies.*"
                ),
                "is_emergency": False,
                "suggested_actions": ["Explain Dolo 650", "Explain Pan 40", "Search Pharmacy"],
                "category": "prescription"
            }

        # Step 3: Nutritionist & Dietary Counseling
        if mode == "nutritionist" or any(w in cleaned for w in ["diet", "nutrition", "food", "eat", "weight", "cholesterol diet", "diabetic diet", "dosha"]):
            reply_text = (
                "🥗 **Medi-Link Personalized Nutrition & Wellness Guidance**\n\n"
                "Balanced nutritional therapy works best when personalized to your clinical vitals and goals:\n\n"
                "• **Heart-Healthy / Blood Pressure Support:** Prioritize potassium-rich leafy greens, flaxseeds, oats, walnuts, and limit dietary sodium (< 2g/day).\n"
                "• **Blood Sugar Management:** Choose low-glycemic complex carbohydrates (millets like Jowar, Ragi, brown rice), high dietary fiber, and adequate protein per meal.\n"
                "• **Ayurvedic Gut Harmony (Agni Balance):** Sip warm cumin-coriander water between meals, avoid iced drinks with heavy meals, and favor freshly cooked seasonal foods.\n\n"
                "**Safety Note:** Do you have any known food allergies, kidney concerns, or specific medical conditions before adopting a new diet plan?"
            )
            return {
                "reply": reply_text,
                "is_emergency": False,
                "suggested_actions": ["Consult Ayurvedic Vaidya", "Check Vitals Trends", "Book Nutritionist"],
                "category": "nutrition"
            }

        # Step 4: Department & Suitability Finder
        if mode == "department_finder" or any(w in cleaned for w in ["which department", "where to go", "which doctor", "knee pain", "headache", "stomach pain", "fever"]):
            suitability = HospitalService.match_suitability(message)
            dept = suitability["detected_department"]
            tier = suitability["recommended_care_tier"]
            relevance = suitability["relevance_explanation"]

            reply_text = (
                f"🩺 **Care Triage Recommendation**\n\n"
                f"• **Recommended Department:** **{dept}**\n"
                f"• **Suggested Care Tier:** {tier}\n\n"
                f"**Clinical Rationale:**\n{relevance}\n\n"
                f"Would you like me to show available doctor slots in **{dept}** or check community clinic availability?"
            )
            return {
                "reply": reply_text,
                "is_emergency": False,
                "detected_department": dept,
                "suggested_actions": [f"Book {dept} Doctor", "Find Nearby Clinics", "View Hospital Wayfinding"],
                "category": "triage"
            }

        # Step 5: Jarvis-style Comprehensive Healthcare Assistant
        if any(w in cleaned for w in ["hello", "hi", "hey", "jarvis", "help", "who are you", "start"]):
            return {
                "reply": (
                    "👋 **Hello! I am your Medi-Link AI Healthcare Assistant.**\n\n"
                    "I am here to help you navigate your healthcare journey smoothly:\n"
                    "• **Find Doctors & Hospitals** across allopathic, clinic, RMP, and Ayurvedic care\n"
                    "• **Identify which medical department** you should consult based on symptoms\n"
                    "• **Explain medications** and prescription usage instructions safely\n"
                    "• **Check live OPD queue waiting times** and hospital indoor wayfinding\n"
                    "• **Emergency guidance** and blood/organ donation coordination\n\n"
                    "How can I assist you right now? You can tap any quick action below or speak using the microphone."
                ),
                "is_emergency": False,
                "suggested_actions": [
                    "Which department do I need?",
                    "Book an appointment",
                    "Explain my prescription",
                    "Find medicine nearby",
                    "Track my queue token",
                    "Emergency SOS"
                ],
                "category": "general"
            }

        # Fallback intelligent answer
        return {
            "reply": (
                f"I understand your query regarding: *\"{message}\"*.\n\n"
                "As your Medi-Link healthcare assistant, I can guide you to verified specialists, "
                "help book outpatient consultations, explain test preparations, or check medicine availability.\n\n"
                "To give you the most accurate direction, could you share if you are looking for a **specialist consultation**, "
                "**medication information**, or **hospital navigation**?"
            ),
            "is_emergency": False,
            "suggested_actions": ["Find Doctors", "Which department?", "Diet Guidance", "Find Medicine"],
            "category": "general"
        }
