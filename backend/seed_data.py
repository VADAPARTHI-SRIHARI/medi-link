"""
Medi-Link Database Seed Loader
Seeds comprehensive initial data for hospitals, clinics, RMP doctors, Ayurvedic practitioners,
medicines, pharmacies, queues, blood services, and demo accounts.
"""
from backend.database import get_db_connection, query_db
from backend.security import hash_password


def seed_database():
    """Populate database with rich realistic healthcare ecosystem data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if data already seeded
    existing_users = cursor.execute("SELECT COUNT(*) as count FROM users").fetchone()["count"]
    if existing_users > 0:
        conn.close()
        return

    print("Seeding Medi-Link database with initial data...")

    # 1. Seed Demo Users
    demo_users = [
        (
            "usr-pat-01",
            "Rajesh Kumar",
            "patient@medilink.com",
            "+919876543210",
            "Hyderabad, Banjara Hills",
            hash_password("patient123"),
            "patient",
            None,
            None
        ),
        (
            "usr-staff-01",
            "Priya Sharma",
            "staff@cityhospital.com",
            "+919876543211",
            "Secunderabad",
            hash_password("staff123"),
            "staff",
            "City General Hospital",
            "OPD Administration & Queue Counter"
        ),
        (
            "usr-doc-01",
            "Dr. Arvind Sharma",
            "doctor.sharma@apollo.com",
            "+919876543212",
            "Hyderabad, Jubilee Hills",
            hash_password("doctor123"),
            "doctor",
            "City General Hospital",
            "Cardiology"
        )
    ]
    cursor.executemany("""
    INSERT INTO users (id, name, email, mobile, location, password_hash, role, hospital_affiliation, department)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_users)

    # 2. Seed Facilities (Hospitals, Clinics, RMP practices, Ayurvedic centres)
    facilities = [
        (
            "fac-hosp-01",
            "City General Hospital",
            "hospital",
            "Plot 12, Main Road, Lakdikapul",
            "Hyderabad",
            "Telangana",
            17.4042,
            78.4682,
            "+91 40 2345 6789",
            1,
            "24 Hours / OPD: 08:30 AM - 08:00 PM",
            "Cardiology,Orthopedics,Pediatrics,Neurology,General Medicine,Emergency & Trauma",
            4.8,
            "Premier 500-bed government-recognized tertiary care medical institution with 24x7 emergency and modern ICU.",
            "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "fac-hosp-02",
            "Apollo Care & Heart Institute",
            "hospital",
            "Road No. 2, Banjara Hills",
            "Hyderabad",
            "Telangana",
            17.4156,
            78.4419,
            "+91 40 2360 7777",
            1,
            "24 Hours / OPD: 09:00 AM - 07:30 PM",
            "Cardiology,Cardiothoracic Surgery,Nephrology,Oncology,Radiology",
            4.9,
            "NABH & JCI accredited multi-speciality super hospital specializing in non-invasive and surgical cardiac interventions.",
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "fac-clin-01",
            "Sunshine Community Family Clinic",
            "clinic",
            "Shop 4, Anand Nagar Colony, Khairatabad",
            "Hyderabad",
            "Telangana",
            17.4121,
            78.4590,
            "+91 98480 12345",
            0,
            "09:00 AM - 01:30 PM, 05:00 PM - 09:30 PM",
            "General Medicine,Pediatrics,Vaccination,Diabetes Care",
            4.7,
            "Affordable community walk-in clinic providing reliable outpatient consultations, rapid diagnostics, and chronic care.",
            "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "fac-rmp-01",
            "Dr. Venkat Rao Neighborhood Health Point (RMP)",
            "rmp_clinic",
            "H.No 3-4-102, Barkatpura Chowk",
            "Hyderabad",
            "Telangana",
            17.3912,
            78.4975,
            "+91 94401 98765",
            0,
            "08:00 AM - 12:30 PM, 04:30 PM - 09:30 PM",
            "General Health,First Aid,Viral Fevers,Minor Dressings,Home Visit Care",
            4.6,
            "Experienced Registered Medical Practitioner serving local families for over 22 years. Provides dedicated home visits for elderly and bedridden patients.",
            "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
        ),
        (
            "fac-ayur-01",
            "Ayush Sanjeevani Ayurvedic Chikitsalaya",
            "ayurvedic_centre",
            "Lane 5, Srinagar Colony, Near Satya Sai Nigamagamam",
            "Hyderabad",
            "Telangana",
            17.4330,
            78.4380,
            "+91 40 2374 8899",
            0,
            "08:30 AM - 01:00 PM, 04:00 PM - 08:00 PM",
            "Ayurvedic Medicine,Panchakarma,Joint Pain & Arthritis,Digestive Disorders,Lifestyle Medicine",
            4.8,
            "Authentic Ayurvedic healing centre staffed by licensed BAMS Vaidyas, offering traditional pulse diagnosis (Nadi Pariksha) and herbal therapy.",
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80"
        )
    ]
    cursor.executemany("""
    INSERT INTO facilities (id, name, type, address, city, state, lat, lng, phone, emergency_available, opd_timings, departments, rating, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, facilities)

    # 3. Seed Doctors & Small Providers
    doctors = [
        (
            "doc-001",
            "Dr. Arvind Sharma",
            "MBBS, MD (General Medicine), DM (Cardiology)",
            "Cardiology",
            "Cardiology",
            "fac-hosp-01",
            "City General Hospital",
            18,
            "TSMC/2006/4921",
            "Telangana State Medical Council",
            600,
            0,
            "in_person,teleconsult",
            4.9,
            "09:30 AM - 01:30 PM, 05:00 PM - 07:30 PM",
            "Senior consultant cardiologist with extensive expertise in hypertension, coronary artery disease, lipid disorders, and preventive cardiology.",
            "Mon,Tue,Wed,Thu,Fri,Sat",
            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
        ),
        (
            "doc-002",
            "Dr. Ananya Sen",
            "MBBS, DCH, DNB (Pediatrics)",
            "Pediatrics",
            "Pediatrics",
            "fac-hosp-02",
            "Apollo Care & Heart Institute",
            12,
            "MCI/2012/8372",
            "Medical Council of India",
            500,
            1,
            "in_person,teleconsult,home_visit",
            4.8,
            "10:00 AM - 02:00 PM, 04:30 PM - 07:00 PM",
            "Dedicated pediatrician caring for neonates, infant growth, immunizations, childhood respiratory infections, and home visits for sick infants.",
            "Mon,Tue,Wed,Thu,Fri",
            "https://images.unsplash.com/photo-1594824813589-9a7f3f3801f9?auto=format&fit=crop&w=400&q=80"
        ),
        (
            "doc-003",
            "Dr. Venkat Rao (RMP)",
            "Registered Medical Practitioner (Community Medicine Diploma)",
            "General Practice (RMP)",
            "General Medicine",
            "fac-rmp-01",
            "Dr. Venkat Rao Neighborhood Health Point (RMP)",
            23,
            "RMP-AP-1999-041",
            "State Association of Registered Medical Practitioners",
            200,
            1,
            "in_person,home_visit",
            4.7,
            "08:00 AM - 12:30 PM, 05:00 PM - 09:30 PM",
            "Trusted community doctor for 20+ years. Expert in primary triage, routine fever checkups, BP monitoring, wound care, and home visit bedside treatment for elders.",
            "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80"
        ),
        (
            "doc-004",
            "Vaidya Rameshwar Shastri",
            "BAMS, MD (Ayurveda - Kayachikitsa)",
            "Ayurvedic Medicine",
            "Ayurvedic Medicine",
            "fac-ayur-01",
            "Ayush Sanjeevani Ayurvedic Chikitsalaya",
            16,
            "AYUSH-TS-2008-118",
            "Board of Indian Medicine (AYUSH)",
            350,
            1,
            "in_person,teleconsult,home_visit",
            4.9,
            "09:00 AM - 01:00 PM, 04:30 PM - 08:00 PM",
            "Renowned Ayurvedic physician skilled in Nadi Pariksha (Pulse Diagnosis), holistic management of chronic rheumatoid arthritis, sciatica, and digestive disorders.",
            "Mon,Tue,Wed,Thu,Fri,Sat",
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
        ),
        (
            "doc-005",
            "Dr. Preeti Reddy",
            "MBBS, MS (Orthopedics), Fellowship Joint Replacement",
            "Orthopedics",
            "Orthopedics",
            "fac-hosp-01",
            "City General Hospital",
            14,
            "TSMC/2010/6120",
            "Telangana State Medical Council",
            600,
            0,
            "in_person,teleconsult",
            4.8,
            "10:00 AM - 02:00 PM, 04:00 PM - 06:30 PM",
            "Specialist in knee & hip osteoarthritis, sports ligament injuries, spine disc issues, and minimally invasive fracture management.",
            "Mon,Wed,Fri,Sat",
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
        ),
        (
            "doc-006",
            "Dr. Mohammed Imran",
            "MBBS, DNB (Family Medicine)",
            "Family & Home Care",
            "General Medicine",
            "fac-clin-01",
            "Sunshine Community Family Clinic",
            9,
            "TSMC/2015/9044",
            "Telangana State Medical Council",
            300,
            1,
            "in_person,teleconsult,home_visit",
            4.7,
            "09:00 AM - 01:00 PM, 05:00 PM - 09:00 PM",
            "Passionate family doctor focused on accessible neighborhood care, elderly home visits, diabetes & hypertension lifestyle management.",
            "Mon,Tue,Wed,Thu,Fri,Sat",
            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
        )
    ]
    cursor.executemany("""
    INSERT INTO doctors (id, name, qualification, specialty, department, facility_id, facility_name, experience_years, reg_number, reg_council, fee, home_visit_available, consultation_types, rating, timings, bio, available_days, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, doctors)

    # 4. Seed Appointments
    appointments = [
        (
            "ML-2026-1001",
            "usr-pat-01",
            "Rajesh Kumar",
            "+919876543210",
            "doc-001",
            "Dr. Arvind Sharma",
            "fac-hosp-01",
            "City General Hospital",
            "Cardiology",
            "hospital_op",
            "2026-10-04",
            "10:30 AM - 11:00 AM",
            "CONFIRMED",
            "OP-14",
            "Mild chest discomfort during brisk walking and high BP readings",
            "Routine cardiac evaluation and ECG review",
            None,
            0,
            0,
            "Fasting 10 hours if lipid panel requested. Bring past prescriptions and ECG reports.",
            None
        ),
        (
            "ML-2026-1002",
            "usr-pat-01",
            "Rajesh Kumar",
            "+919876543210",
            "doc-004",
            "Vaidya Rameshwar Shastri",
            "fac-ayur-01",
            "Ayush Sanjeevani Ayurvedic Chikitsalaya",
            "Ayurvedic Medicine",
            "ayurvedic",
            "2026-10-06",
            "04:30 PM - 05:00 PM",
            "CONFIRMED",
            "AY-07",
            "Joint stiffness in morning and knee pain",
            "Nadi Pariksha and natural herbal care consultation",
            None,
            0,
            0,
            "Avoid heavy oily meal 2 hours prior to Nadi Pariksha.",
            None
        ),
        (
            "ML-2026-1003",
            "usr-pat-01",
            "Rajesh Kumar",
            "+919876543210",
            "doc-003",
            "Dr. Venkat Rao (RMP)",
            "fac-rmp-01",
            "Dr. Venkat Rao Neighborhood Health Point (RMP)",
            "General Medicine",
            "home_visit",
            "2026-09-28",
            "06:00 PM - 06:30 PM",
            "COMPLETED",
            "HV-03",
            "High fever, body chills and headache",
            "Home visit primary care checkup",
            "Flat 302, Green Meadows, Banjara Hills Rd 12",
            0,
            0,
            "Doctor visited home. Temperature checked, oral rehydration and Paracetamol prescribed.",
            None
        )
    ]
    cursor.executemany("""
    INSERT INTO appointments (id, patient_id, patient_name, patient_mobile, doctor_id, doctor_name, facility_id, facility_name, department, appointment_type, date, time_slot, status, queue_token, symptoms, reason, home_address, is_elderly, wheelchair_needed, preparation_notes, cancel_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, appointments)

    # 5. Seed Appointment Audits
    audits = [
        (
            "ML-2026-1001",
            None,
            "CONFIRMED",
            "System / Patient",
            "Appointment successfully booked and token OP-14 generated."
        ),
        (
            "ML-2026-1003",
            "CONFIRMED",
            "COMPLETED",
            "Dr. Venkat Rao",
            "Home consultation concluded successfully. Patient recovery on track."
        )
    ]
    cursor.executemany("""
    INSERT INTO appointment_audits (appointment_id, previous_status, new_status, changed_by, action_note)
    VALUES (?, ?, ?, ?, ?)
    """, audits)

    # 6. Seed Queues
    queues = [
        (
            "q-cg-cardio",
            "fac-hosp-01",
            "Cardiology",
            "doc-001",
            "2026-10-04",
            11,
            24,
            8,
            10,
            "Doctor attended a brief 10-min urgent ECG consultation."
        ),
        (
            "q-ayur-gen",
            "fac-ayur-01",
            "Ayurvedic Medicine",
            "doc-004",
            "2026-10-06",
            4,
            12,
            15,
            0,
            None
        )
    ]
    cursor.executemany("""
    INSERT INTO queues (id, facility_id, department_id, doctor_id, date, current_serving_token, total_tokens, estimated_wait_mins_per_patient, delay_minutes, delay_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, queues)

    # 7. Seed Pharmacies
    pharmacies = [
        (
            "ph-01",
            "MediPlus 24x7 Chemist & Druggist",
            "Door No. 4-1-88, Lakdikapul Main Junction",
            "Hyderabad",
            0.6,
            "+91 40 2341 5566",
            "24 Hours",
            1,
            17.4045,
            78.4680
        ),
        (
            "ph-02",
            "Apollo Pharmacy Express",
            "Opposite Care Hospital, Banjara Hills Rd 1",
            "Hyderabad",
            1.4,
            "+91 40 2333 4455",
            "07:00 AM - 11:30 PM",
            1,
            17.4140,
            78.4430
        ),
        (
            "ph-03",
            "Sanjeevani Ayurvedic & Herbal Store",
            "Beside Ayush Kendra, Srinagar Colony",
            "Hyderabad",
            2.1,
            "+91 98490 66778",
            "09:00 AM - 09:30 PM",
            0,
            17.4325,
            78.4375
        )
    ]
    cursor.executemany("""
    INSERT INTO pharmacies (id, name, address, city, distance_km, phone, open_hours, delivery_available, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, pharmacies)

    # 8. Seed Medicines
    medicines = [
        ("med-01", "ph-01", "Dolo 650mg", "Paracetamol", "Allopathy", "650mg", "Tablet", 32.50, 1, 120, 0, "Take after food every 6 hours for fever/body ache. Do not exceed 4g/day."),
        ("med-02", "ph-01", "Augmentin 625 Duo", "Amoxicillin and Potassium Clavulanate", "Allopathy", "625mg", "Tablet", 215.00, 1, 45, 1, "Broad spectrum antibiotic. Strictly follow physician-prescribed course."),
        ("med-03", "ph-01", "Telma 40mg", "Telmisartan", "Allopathy", "40mg", "Tablet", 145.00, 1, 60, 1, "Antihypertensive medication. Take once daily at a fixed morning hour."),
        ("med-04", "ph-01", "Pan 40", "Pantoprazole Gastro-resistant", "Allopathy", "40mg", "Tablet", 110.00, 1, 80, 0, "Take early morning on empty stomach 30 mins before breakfast for acid reflux."),
        ("med-05", "ph-02", "Glycomet-GP 1", "Glimepiride and Metformin HCl", "Allopathy", "1mg / 500mg", "Tablet", 138.00, 1, 55, 1, "Anti-diabetic medicine. Take with or immediately after main meals."),
        ("med-06", "ph-02", "Asthalin Inhaler 100mcg", "Salbutamol", "Emergency", "100mcg/puff", "Inhaler", 168.00, 1, 30, 1, "Rapid bronchodilator for asthma or wheezing attacks."),
        ("med-07", "ph-03", "Ashwagandha Churna", "Withania Somnifera (Pure Herbal)", "Ayurveda", "100g powder", "Powder", 120.00, 1, 40, 0, "Take 1/2 teaspoon with warm milk at bedtime for vitality and stress relief."),
        ("med-08", "ph-03", "Yogaraj Guggulu", "Ayurvedic Classical Formulation", "Ayurveda", "60 tablets", "Tablet", 160.00, 1, 35, 0, "Traditional remedy for joint stiffness, vata balance, and musculoskeletal comfort."),
        ("med-09", "ph-01", "Electral ORS Sachet", "Oral Rehydration Salts (WHO formula)", "Pediatric", "21.8g powder", "Sachet", 22.00, 1, 200, 0, "Dissolve 1 sachet in 1 litre drinking water. Drink during diarrhea or dehydration.")
    ]
    cursor.executemany("""
    INSERT INTO medicines (id, pharmacy_id, name, generic_name, category, dosage, form, price, in_stock, stock_quantity, prescription_required, instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, medicines)

    # 9. Seed Blood Donors & Requests
    donors = [
        ("bd-01", "Suresh Varma", "O+", "+919848123456", "suresh.v@gmail.com", 29, "Male", "Hyderabad", "2026-05-15", 1),
        ("bd-02", "Pooja Hegde", "A+", "+919988223344", "pooja.h@gmail.com", 26, "Female", "Hyderabad", "2026-06-20", 1),
        ("bd-03", "Kiran Yadav", "B+", "+919700112233", "kiran.y@gmail.com", 34, "Male", "Secunderabad", "2026-04-10", 1),
        ("bd-04", "Farhan Ahmed", "O-", "+919611223344", "farhan.a@gmail.com", 31, "Male", "Hyderabad", "2026-03-01", 1),
        ("bd-05", "Anita Roy", "AB+", "+919500334455", "anita.r@gmail.com", 28, "Female", "Hyderabad", "2026-07-12", 1)
    ]
    cursor.executemany("""
    INSERT INTO blood_donors (id, name, blood_group, mobile, email, age, gender, city, last_donation_date, eligible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, donors)

    blood_requests = [
        ("br-01", "Lakshmi Devi", "O+", 2, "City General Hospital", "Hyderabad", "CRITICAL", "Sunil (Son)", "+919876001122", "MATCHING", "Required for emergency cardiac bypass surgery."),
        ("br-02", "Ravi Teja", "B+", 1, "Apollo Care & Heart Institute", "Hyderabad", "URGENT", "Mahesh (Brother)", "+919876003344", "ASSIGNED", "Post-trauma recovery unit. Donor matching in progress.")
    ]
    cursor.executemany("""
    INSERT INTO blood_requests (id, patient_name, blood_group, units_needed, hospital_name, city, urgency, contact_name, contact_mobile, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, blood_requests)

    # 10. Seed Organ Pledges & Requests
    organ_pledges = [
        (
            "op-01",
            "Manoj Kumar",
            "+919811223344",
            "manoj.k@gmail.com",
            "Hyderabad",
            32,
            "Kidneys,Cornea,Liver",
            "Sunita Kumar (Spouse)",
            "+919811223355",
            1
        )
    ]
    cursor.executemany("""
    INSERT INTO organ_pledges (id, full_name, mobile, email, city, age, pledged_organs, emergency_contact_name, emergency_contact_phone, consent_agreed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, organ_pledges)

    organ_requests = [
        (
            "or-01",
            "S. Narayana",
            "Kidney",
            "City General Hospital",
            "Hyderabad",
            "HIGH",
            "NOTTO-REG-2026-4410",
            "ON_REGISTRY_LIST",
            "End-stage renal disease under regular hemodialysis awaiting compatible donor match."
        )
    ]
    cursor.executemany("""
    INSERT INTO organ_requests (id, patient_name, organ_type, hospital_name, city, urgency, registry_ref, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, organ_requests)

    # 11. Seed Vitals Logs
    vitals = [
        ("usr-pat-01", 72, 98, 120, 80, 98.6, 6420, "MediWatch-Pro-7X", "NORMAL"),
        ("usr-pat-01", 75, 99, 122, 82, 98.4, 5100, "MediWatch-Pro-7X", "NORMAL"),
        ("usr-pat-01", 78, 97, 126, 84, 98.7, 7830, "MediWatch-Pro-7X", "NORMAL")
    ]
    cursor.executemany("""
    INSERT INTO vitals_logs (user_id, heart_rate, spo2, blood_pressure_sys, blood_pressure_dia, temperature, steps, device_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, vitals)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")
