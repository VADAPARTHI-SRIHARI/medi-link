"""
Medi-Link Hospital & Healthcare Facility Service
Handles hospital discovery, clinical department wayfinding, and health problem suitability matching.
"""
from typing import List, Dict, Any, Optional
from backend.database import query_db


class HospitalService:
    @staticmethod
    def get_facilities(
        facility_type: Optional[str] = None,
        city: Optional[str] = None,
        emergency_only: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve facilities with transparent information."""
        sql = "SELECT * FROM facilities WHERE 1=1"
        params = []

        if facility_type:
            sql += " AND type = ?"
            params.append(facility_type)

        if city:
            sql += " AND city LIKE ?"
            params.append(f"%{city}%")

        if emergency_only is True:
            sql += " AND emergency_available = 1"

        if search:
            sql += " AND (name LIKE ? OR departments LIKE ? OR address LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s])

        sql += " ORDER BY rating DESC"
        facilities = query_db(sql, tuple(params))

        # Attach doctor count and department list
        for fac in facilities:
            doc_count = query_db(
                "SELECT COUNT(*) as count FROM doctors WHERE facility_id = ?",
                (fac["id"],),
                one=True
            )["count"]
            fac["doctor_count"] = doc_count
            fac["department_list"] = [d.strip() for d in fac["departments"].split(",") if d.strip()]

        return facilities

    @staticmethod
    def get_facility_by_id(facility_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve facility details including affiliated doctors and navigation wayfinding map."""
        fac = query_db("SELECT * FROM facilities WHERE id = ?", (facility_id,), one=True)
        if not fac:
            return None

        fac["department_list"] = [d.strip() for d in fac["departments"].split(",") if d.strip()]
        fac["doctors"] = query_db("SELECT * FROM doctors WHERE facility_id = ?", (facility_id,))
        
        # Hospital Navigation Wayfinding Map (for elderly and first-time hospital visitors)
        fac["wayfinding_nodes"] = [
            {
                "department": "Emergency & Trauma",
                "building": "Block A - Ground Floor",
                "floor": "Ground Floor",
                "room_counter": "Red Triage Counter 1",
                "wheelchair_access": True,
                "directions": "Direct entry from Main Gate 1. Follow the red floor line directly to the Triage desk."
            },
            {
                "department": "Cardiology",
                "building": "Block B - Heart Wing",
                "floor": "1st Floor",
                "room_counter": "Rooms 104 - 108",
                "wheelchair_access": True,
                "directions": "Take Elevator B near main reception to 1st Floor. Turn right; follow the blue line to OPD Room 104."
            },
            {
                "department": "Orthopedics",
                "building": "Block B - Joint & Spine Wing",
                "floor": "Ground Floor",
                "room_counter": "Rooms 012 - 015",
                "wheelchair_access": True,
                "directions": "Turn left at central lobby; Ortho OPD and Cast Room are right past the pharmacy."
            },
            {
                "department": "Pediatrics",
                "building": "Block C - Child & Mother Care",
                "floor": "2nd Floor",
                "room_counter": "Rooms 201 - 205",
                "wheelchair_access": True,
                "directions": "Take Elevator C to 2nd Floor. Play area and immunization desk are immediately opposite the lift."
            },
            {
                "department": "General Medicine",
                "building": "Main OPD Block",
                "floor": "Ground Floor",
                "room_counter": "OPD Counters 01 - 06",
                "wheelchair_access": True,
                "directions": "Straight ahead from registration counter. Token display boards are clearly visible."
            },
            {
                "department": "Ayurvedic Medicine",
                "building": "AYUSH Wellness Wing",
                "floor": "Ground Floor",
                "room_counter": "Cabin 01 & Herbal Dispensary",
                "wheelchair_access": True,
                "directions": "Follow green garden pathway on East wing. Direct herbal pharmacy and consultation room."
            },
            {
                "department": "Pharmacy & Diagnostic Lab",
                "building": "Central Atrium",
                "floor": "Ground Floor",
                "room_counter": "Counters P1 - P4",
                "wheelchair_access": True,
                "directions": "Located right next to the central exit lobby. Open 24x7."
            }
        ]
        return fac

    @staticmethod
    def match_suitability(symptoms: str, location: str = "Hyderabad", preferred_type: str = "all") -> Dict[str, Any]:
        """
        Analyze health symptoms and provide intelligent, transparent care suitability matching:
        - Relevant medical department
        - Recommended care tier (Emergency, Tertiary Hospital, Community Clinic, RMP, Ayurvedic)
        - Matching providers & facilities with distance, slot, and why this is suitable.
        """
        symp_lower = symptoms.lower()
        
        # Rule-based clinical triage matching
        matched_dept = "General Medicine"
        care_tier = "Community Clinic / General Physician"
        urgency = "Standard Consultation"
        relevance_explanation = (
            "Your symptoms indicate general health concerns. A comprehensive evaluation by a General Physician or primary clinic "
            "will help establish initial clinical vitals, order basic diagnostics, and direct you to specialists if required."
        )

        if any(w in symp_lower for w in ["chest pain", "heart", "breathless", "palpitation", "left arm pain", "bp high", "hypertension"]):
            matched_dept = "Cardiology"
            urgency = "Urgent / Critical Check" if "chest pain" in symp_lower else "Priority Specialist Check"
            care_tier = "Multi-speciality Hospital with Cardiac Care"
            relevance_explanation = (
                "Symptoms involving chest pressure, palpitations, or shortness of breath require immediate cardiac investigation "
                "(ECG, Troponin, Echocardiogram) at a hospital equipped with a 24x7 Cath Lab and coronary care unit."
            )
        elif any(w in symp_lower for w in ["joint", "knee", "back pain", "fracture", "bone", "arthritis", "sprain"]):
            if "ayurveda" in symp_lower or "herbal" in symp_lower or "chronic" in symp_lower:
                matched_dept = "Ayurvedic Medicine"
                care_tier = "Ayurvedic Centre / Ortho Specialist"
                relevance_explanation = (
                    "For chronic joint stiffness, degenerative osteoarthritis, or long-term mobility issues, Ayurvedic Panchakarma "
                    "and specialized Vaidya consultation offer non-invasive restorative management alongside conventional orthopedics."
                )
            else:
                matched_dept = "Orthopedics"
                care_tier = "Orthopedic Specialist / Hospital"
                relevance_explanation = (
                    "Musculoskeletal joint pain, suspected ligament strain, or spinal stiffness is best assessed by an Orthopedic surgeon "
                    "who can arrange digital X-rays or MRI imaging to examine cartilage and structural integrity."
                )
        elif any(w in symp_lower for w in ["child", "baby", "infant", "vaccine", "pediatric"]):
            matched_dept = "Pediatrics"
            care_tier = "Pediatric Clinic / Hospital"
            relevance_explanation = (
                "Childhood conditions require weight-adjusted pediatric dosages, specialized pediatric growth milestone tracking, and gentle clinical handling."
            )
        elif any(w in symp_lower for w in ["fever", "cough", "cold", "body ache", "flu", "weakness", "vomiting"]):
            matched_dept = "General Medicine"
            care_tier = "Local Clinic / Neighborhood RMP / Home Visit"
            relevance_explanation = (
                "Acute seasonal viral illness, fever, and fatigue are ideally treated at local neighborhood clinics or by qualified RMPs "
                "without long hospital waiting queues. Home visit options are also available if the patient is bedridden."
            )
        elif any(w in symp_lower for w in ["skin", "rash", "itching", "allergy", "pimples", "hair fall"]):
            matched_dept = "Dermatology"
            care_tier = "Dermatology Specialist Clinic"
            relevance_explanation = (
                "Cutaneous rashes, inflammatory lesions, and allergic reactions require dermatological examination and topical management."
            )
        elif any(w in symp_lower for w in ["digestive", "gas", "acidity", "constipation", "stomach", "bloating"]):
            matched_dept = "Ayurvedic Medicine" if "ayurveda" in symp_lower else "General Medicine"
            care_tier = "Ayurvedic Care / Gastroenterology"
            relevance_explanation = (
                "Digestive distress, hyperacidity, and IBS symptoms respond very favorably to holistic dietary modifications, digestive enzyme balances, and gut health protocols."
            )

        # Retrieve relevant facilities providing this department
        all_facilities = HospitalService.get_facilities(city=location)
        matching_facilities = []
        for fac in all_facilities:
            depts = [d.lower() for d in fac["department_list"]]
            if matched_dept.lower() in depts or "general medicine" in depts:
                matching_facilities.append(fac)

        # Retrieve matching specialized doctors
        doctors = query_db("""
        SELECT d.*, f.type as facility_type, f.city
        FROM doctors d
        JOIN facilities f ON d.facility_id = f.id
        WHERE d.department LIKE ? OR d.specialty LIKE ?
        ORDER BY d.experience_years DESC
        """, (f"%{matched_dept}%", f"%{matched_dept}%"))

        return {
            "query_symptoms": symptoms,
            "detected_department": matched_dept,
            "recommended_care_tier": care_tier,
            "urgency_level": urgency,
            "relevance_explanation": relevance_explanation,
            "matching_facilities_count": len(matching_facilities),
            "matching_facilities": matching_facilities,
            "matching_doctors": doctors,
            "safety_disclaimer": "This algorithmic recommendation is for informational guidance and appointment direction. It does not constitute a definitive medical diagnosis. In case of sudden emergency, please call 108 or use the Emergency SOS button."
        }
