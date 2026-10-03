/**
 * MEDI-LINK Home Page View
 * Strictly crafted to match the user's handwritten wireframe layout:
 * - Top Search Bar
 * - Row 1: [hospitals] & [local hospitals]
 * - Center Focal: (Emer gency) circular action button
 * - Row 2: [medical shops] & [opointment and (op) booking]
 * - Below Action: (chatbot) AI Assistant widget
 * - Bottom: Copyright bar
 */

import { APP_CONFIG, store } from "../config.js";
import { ApiClient } from "../api.js";

export const HomeView = {
  async render() {
    return `
      <div class="space-y-8 animate-fade-in pb-12">
        
        <!-- ========================================== -->
        <!-- 1. TOP SEARCH BAR (from sketch: "search bar") -->
        <!-- ========================================== -->
        <section class="max-w-4xl mx-auto px-4 pt-6">
          <div class="bg-white rounded-3xl p-3 sm:p-4 border-2 border-slate-200 shadow-lg hover:border-sky-400 transition space-y-3">
            <div class="flex flex-col sm:flex-row items-center gap-3">
              <div class="flex-1 flex items-center gap-3 px-3 w-full">
                <span class="text-2xl text-slate-400">🔍</span>
                <input 
                  type="text" 
                  id="home-search-input" 
                  placeholder="Search hospitals, local clinics, doctors, symptoms (e.g. knee pain), or medicines..."
                  class="w-full text-slate-800 placeholder-slate-400 font-semibold text-sm sm:text-base border-none focus:outline-none bg-transparent"
                />
              </div>
              <button 
                id="home-search-btn" 
                class="w-full sm:w-auto px-7 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Search</span>
                <span>&rarr;</span>
              </button>
            </div>

            <!-- Quick Search Tags -->
            <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <span class="text-slate-400 font-bold">Suggestions:</span>
              <button class="home-tag-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-800 transition" data-query="Cardiology">Cardiology</button>
              <button class="home-tag-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-800 transition" data-query="Knee joint pain">Knee Joint Pain</button>
              <button class="home-tag-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-800 transition" data-query="Dolo 650">Dolo 650mg</button>
              <button class="home-tag-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-800 transition" data-query="Dr. Venkat Rao">Dr. Venkat (RMP)</button>
              <button class="home-tag-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-800 transition" data-query="Ayurvedic">Ayurvedic Clinic</button>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- 2. MAIN 2x2 GRID WITH CENTER EMERGENCY CIRCLE (MATCHING SKETCH) -->
        <!-- ============================================================== -->
        <section class="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          
          <!-- ROW 1: [hospitals] & [local hospitals] -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Card 1: HOSPITALS ("hospitals" from sketch) -->
            <a 
              href="#/hospitals" 
              class="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-sky-500 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-3xl font-black shadow-2xs group-hover:scale-110 transition">
                    🏥
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                    Tertiary Care
                  </span>
                </div>

                <div>
                  <h2 class="text-2xl font-black text-slate-900 group-hover:text-sky-700 transition brand-font">
                    Hospitals
                  </h2>
                  <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                    Major multi-speciality medical institutions, 24x7 Emergency Trauma wards, ICUs, Cath Labs, and specialist consultations.
                  </p>
                </div>

                <div class="flex flex-wrap gap-1.5 text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">City General Hospital</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Apollo Heart Care</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">NABH Accredited</span>
                </div>
              </div>

              <div class="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                <span class="text-xs font-bold text-sky-600 group-hover:underline">Explore Hospitals & OPD</span>
                <span class="text-base text-sky-600 group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </a>

            <!-- Card 2: LOCAL HOSPITALS ("local hospitals" from sketch) -->
            <a 
              href="#/doctors?facility_type=clinic" 
              class="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-emerald-500 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-black shadow-2xs group-hover:scale-110 transition">
                    🩺
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Community & AYUSH
                  </span>
                </div>

                <div>
                  <h2 class="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition brand-font">
                    Local Hospitals & Clinics
                  </h2>
                  <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                    Accessible neighborhood clinics, trusted RMP family doctors with 20+ years service, and certified Ayurvedic Vaidyas.
                  </p>
                </div>

                <div class="flex flex-wrap gap-1.5 text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Community Clinics</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">RMP Doctors</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Ayurvedic Centers</span>
                </div>
              </div>

              <div class="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-600 group-hover:underline">Browse Local Clinics & RMPs</span>
                <span class="text-base text-emerald-600 group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </a>

          </div>

          <!-- ============================================================== -->
          <!-- CENTER PROMINENT CIRCLE: (Emer gency) from sketch              -->
          <!-- ============================================================== -->
          <div class="py-4 flex flex-col items-center justify-center text-center">
            
            <a 
              href="#/emergency" 
              class="heartbeat-btn group relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white shadow-2xl shadow-red-500/50 hover:shadow-red-500/80 border-4 border-white flex flex-col items-center justify-center p-4 transition transform hover:scale-105 cursor-pointer"
              aria-label="24x7 Emergency SOS"
              title="Click for 24x7 Emergency SOS"
            >
              <!-- Glowing ring effect -->
              <span class="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30"></span>

              <span class="text-4xl sm:text-5xl mb-1">🚨</span>
              <span class="text-lg sm:text-xl font-black uppercase tracking-wider leading-none">
                Emergency
              </span>
              <span class="text-[10px] sm:text-xs font-bold text-red-100 uppercase tracking-widest mt-1">
                24x7 Instant SOS
              </span>
              <span class="text-[9px] text-white/90 bg-red-950/40 px-2.5 py-0.5 rounded-full mt-1.5 font-bold">
                Dial 108 / 112
              </span>
            </a>

            <div class="mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span>Direct Trauma & Ambulance Dispatch Simulation</span>
            </div>
          </div>

          <!-- ROW 2: [medical shops] & [opointment and (op) booking] -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Card 3: MEDICAL SHOPS ("medical shops" from sketch) -->
            <a 
              href="#/pharmacy" 
              class="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-amber-500 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-black shadow-2xs group-hover:scale-110 transition">
                    💊
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    Pharmacies & Stores
                  </span>
                </div>

                <div>
                  <h2 class="text-2xl font-black text-slate-900 group-hover:text-amber-700 transition brand-font">
                    Medical Shops
                  </h2>
                  <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                    Locate nearby pharmacies, verify medicine stock availability, check prescription requirements, and reserve for pickup.
                  </p>
                </div>

                <div class="flex flex-wrap gap-1.5 text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">24x7 Chemists</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Medicine Finder</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Ayurvedic Stores</span>
                </div>
              </div>

              <div class="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                <span class="text-xs font-bold text-amber-600 group-hover:underline">Search Medicines & Shops</span>
                <span class="text-base text-amber-600 group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </a>

            <!-- Card 4: APPOINTMENT AND (OP) BOOKING ("opointment and (op) booking" from sketch) -->
            <a 
              href="#/book" 
              class="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-purple-500 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl font-black shadow-2xs group-hover:scale-110 transition">
                    📅
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                    7-Step Booking
                  </span>
                </div>

                <div>
                  <h2 class="text-2xl font-black text-slate-900 group-hover:text-purple-700 transition brand-font">
                    Appointment & (OP) Booking
                  </h2>
                  <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                    Book outpatient (OPD) hospital tokens, specialist slots, clinic consultations, RMP slots, or home doctor visits.
                  </p>
                </div>

                <div class="flex flex-wrap gap-1.5 text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Hospital OP Booking</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Clinic & Doctor Slot</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">Home Doctor Visit</span>
                </div>
              </div>

              <div class="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                <span class="text-xs font-bold text-purple-600 group-hover:underline">Start Appointment Booking</span>
                <span class="text-base text-purple-600 group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </a>

          </div>

          <!-- ============================================================== -->
          <!-- 3. CHATBOT CIRCULAR / WIDGET ACTION (from sketch: "chatbot")    -->
          <!-- ============================================================== -->
          <div class="pt-6 pb-2 flex flex-col items-center justify-center">
            
            <a 
              href="#/ai" 
              class="group relative max-w-xl w-full p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center justify-between gap-4 cursor-pointer"
              title="Open MEDI-LINK AI Chatbot"
            >
              <div class="flex items-center gap-4">
                <!-- Circular Chatbot Icon from sketch -->
                <div class="w-16 h-16 rounded-full bg-white text-emerald-700 flex items-center justify-center text-3xl font-black shadow-md shrink-0 group-hover:rotate-12 transition transform">
                  🤖
                </div>
                
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-xl font-black brand-font tracking-tight">MEDI-LINK AI Chatbot</h3>
                    <span class="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                      Voice & Text
                    </span>
                  </div>
                  <p class="text-xs text-emerald-100 mt-1 leading-relaxed">
                    Jarvis-style clinical assistant: Symptom triage, prescription analyzer, diet advice & department suggestions.
                  </p>
                </div>
              </div>

              <div class="shrink-0 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white text-lg font-bold group-hover:bg-white group-hover:text-emerald-700 transition">
                &rarr;
              </div>
            </a>

          </div>

        </section>

        <!-- ============================================================== -->
        <!-- 4. QUICK ACCESS SERVICES STRIP                                  -->
        <!-- ============================================================== -->
        <section class="max-w-5xl mx-auto px-4 sm:px-6">
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800">Additional Healthcare Services</h3>
              <span class="text-xs text-slate-400">All features accessible</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <a href="#/suitability" class="p-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border border-slate-100">
                <span class="text-2xl">🎯</span>
                <span>Suitability</span>
              </a>
              <a href="#/queue" class="p-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border border-slate-100">
                <span class="text-2xl">⏳</span>
                <span>Live Queue</span>
              </a>
              <a href="#/home-visit" class="p-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border border-slate-100">
                <span class="text-2xl">🏡</span>
                <span>Home Visit</span>
              </a>
              <a href="#/blood" class="p-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border border-slate-100">
                <span class="text-2xl">🩸</span>
                <span>Blood Bank</span>
              </a>
              <a href="#/organ" class="p-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border border-slate-100">
                <span class="text-2xl">🫀</span>
                <span>Organ Pledge</span>
              </a>
              <a href="#/navigation" class="p-3 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1.5 border border-slate-100">
                <span class="text-2xl">🧭</span>
                <span>Wayfinding</span>
              </a>
            </div>
          </div>
        </section>

        <!-- ============================================================== -->
        <!-- 5. COPYRIGHT BAR ("copy rights" from sketch)                    -->
        <!-- ============================================================== -->
        <section class="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div class="py-4 px-6 rounded-2xl bg-slate-900 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-white font-bold">MEDI-LINK</span>
              <span>&copy; ${new Date().getFullYear()} All Rights Reserved.</span>
            </div>
            <div class="text-[11px] text-slate-400 text-center sm:text-right">
              “Right Care. Right Doctor. Right Place. Right Time.”
            </div>
          </div>
        </section>

      </div>
    `;
  },

  attachEvents() {
    const searchInput = document.getElementById("home-search-input");
    const searchBtn = document.getElementById("home-search-btn");

    const handleSearch = () => {
      const q = searchInput?.value?.trim();
      if (!q) return;

      // Smart routing based on search intent
      const lower = q.toLowerCase();
      if (lower.includes("dolo") || lower.includes("pan") || lower.includes("medicine") || lower.includes("pharmacy") || lower.includes("tablet")) {
        window.location.hash = `#/pharmacy?query=${encodeURIComponent(q)}`;
      } else if (lower.includes("hospital") || lower.includes("apollo") || lower.includes("care")) {
        window.location.hash = `#/hospitals?search=${encodeURIComponent(q)}`;
      } else if (lower.includes("emergency") || lower.includes("sos") || lower.includes("ambulance")) {
        window.location.hash = "#/emergency";
      } else if (lower.includes("pain") || lower.includes("fever") || lower.includes("cough") || lower.includes("ache") || lower.includes("symptom")) {
        window.location.hash = `#/suitability?symptom=${encodeURIComponent(q)}`;
      } else {
        window.location.hash = `#/doctors?search=${encodeURIComponent(q)}`;
      }
    };

    if (searchBtn) searchBtn.addEventListener("click", handleSearch);
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSearch();
      });
    }

    // Quick tag suggestions
    document.querySelectorAll(".home-tag-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const query = e.target.getAttribute("data-query");
        if (searchInput && query) {
          searchInput.value = query;
          handleSearch();
        }
      });
    });
  }
};
