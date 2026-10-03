/**
 * MEDI-LINK Landing Page View
 * Tagline: "Right Care. Right Doctor. Right Place. Right Time."
 * Subtitle: "Your Health • Our Priority"
 */

import { APP_CONFIG, store } from "../config.js";

export const HomeView = {
  render() {
    const isEasy = store.get().easyMode;

    return `
      <div class="space-y-16 animate-fade-in pb-12">
        
        <!-- Hero Section with Healthcare Gradient & Logo -->
        <section class="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-sky-50 via-white to-slate-50 border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <!-- Left Copy -->
              <div class="lg:col-span-7 space-y-6 text-left">
                
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-sm">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Unified Digital Healthcare Ecosystem</span>
                </div>

                <h1 class="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Right Care. Right Doctor.<br/>
                  <span class="medilink-gradient-text">Right Place. Right Time.</span>
                </h1>

                <p class="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl">
                  Empowering patients with transparent doctor discovery, hospital suitability AI triage, live OPD queue tracking, emergency SOS, and dignified support for local clinics, RMPs, and Ayurvedic healers.
                </p>

                <!-- Quick Symptom Search / Triage Bar -->
                <div class="p-2 sm:p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2 max-w-2xl">
                  <div class="flex-1 flex items-center gap-3 px-3">
                    <span class="text-xl text-slate-400">🔍</span>
                    <input 
                      id="hero-symptom-input" 
                      type="text" 
                      placeholder="Enter symptom (e.g., knee pain, chest tightness, fever, rash)..." 
                      class="w-full text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base border-none focus:outline-none"
                    />
                  </div>
                  <button 
                    id="hero-check-suitability-btn" 
                    class="px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Check Suitability</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                <!-- Action Chips -->
                <div class="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
                  <span class="text-slate-400">Quick Searches:</span>
                  <button class="hero-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-symptom="Knee osteoarthritis joint pain">Knee Joint Pain</button>
                  <button class="hero-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-symptom="Chest tightness and breathlessness">Chest Tightness</button>
                  <button class="hero-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-symptom="High fever and body ache">High Fever</button>
                  <button class="hero-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-symptom="Ayurvedic digestion and acidity">Ayurvedic Acidity</button>
                </div>

                <!-- Call to action buttons -->
                <div class="pt-4 flex flex-wrap gap-3">
                  <a href="#/doctors" class="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-lg transition flex items-center gap-2">
                    <span>Find Doctors & Providers</span>
                  </a>
                  <a href="#/ai" class="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg transition flex items-center gap-2">
                    <span>Ask Medi-Link AI</span>
                    <span class="text-xs bg-emerald-800 px-2 py-0.5 rounded-md">Jarvis</span>
                  </a>
                  <a href="#/emergency" class="px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-500/20 transition flex items-center gap-2">
                    <span>🚨 24x7 Emergency</span>
                  </a>
                </div>

              </div>

              <!-- Right Visual Card Showcase -->
              <div class="lg:col-span-5 relative">
                <div class="relative mx-auto max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-6">
                  
                  <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-xl bg-sky-50 p-1 flex items-center justify-center border border-sky-100">
                        <img src="${APP_CONFIG.logoUrl}" alt="Medi-Link Icon" class="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h2 class="text-base font-bold text-slate-800 leading-tight">Live Health Nexus</h2>
                        <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Real-time Patient Flow Active
                        </p>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-lg">Demo Mode</span>
                  </div>

                  <!-- Live Queue Snapshot Card -->
                  <div class="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-between">
                    <div>
                      <span class="text-xs font-bold uppercase text-sky-700 tracking-wider">OPD Live Queue</span>
                      <div class="text-2xl font-black text-sky-900">Token OP-14</div>
                      <p class="text-xs text-slate-600">Currently Serving: <strong>OP-11</strong> (3 ahead)</p>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-bold text-slate-500">Est. Wait</span>
                      <div class="text-xl font-bold text-emerald-600">~24 mins</div>
                      <a href="#/queue" class="text-xs font-bold text-sky-700 hover:underline">Track Queue &rarr;</a>
                    </div>
                  </div>

                  <!-- Telemetry Vitals Snapshot -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>WEARABLE SYNC (MediWatch-Pro)</span>
                      <span class="text-emerald-600">Connected</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-center">
                      <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span class="text-xs text-slate-400">Heart Rate</span>
                        <div class="text-lg font-bold text-rose-600">74 <span class="text-xs font-normal">BPM</span></div>
                      </div>
                      <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span class="text-xs text-slate-400">Blood O2</span>
                        <div class="text-lg font-bold text-sky-600">98 <span class="text-xs font-normal">%</span></div>
                      </div>
                      <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span class="text-xs text-slate-400">BP Resting</span>
                        <div class="text-lg font-bold text-emerald-600">120/80</div>
                      </div>
                    </div>
                  </div>

                  <!-- Hospital Navigation Mini Teaser -->
                  <div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🧭</span>
                      <div>
                        <h4 class="text-xs font-bold text-amber-900">Hospital Indoor Wayfinding</h4>
                        <p class="text-xs text-amber-700">Elderly & first-time visitor directions</p>
                      </div>
                    </div>
                    <a href="#/navigation" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition">View Map</a>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Multi-Tier Care Ecosystem (Hospitals, Clinics, RMP, Ayurvedic, Home Visits) -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <h2 class="text-3xl font-extrabold text-slate-900">Inclusive Multi-Tier Healthcare Network</h2>
            <p class="text-slate-600 text-base">
              Healthcare is not just giant super-speciality hospitals. Medi-Link provides transparent visibility, verified credentials, and booking access across all levels of care.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- Tier 1: Hospitals -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">🏥</div>
                <h3 class="text-lg font-bold text-slate-800">Multi-Speciality Hospitals</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Tertiary centers with 24x7 Emergency, ICU, Cath Labs, and comprehensive outpatient department (OPD) slot booking.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 mt-4">
                <a href="#/hospitals" class="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">Browse Hospitals &rarr;</a>
              </div>
            </div>

            <!-- Tier 2: Community Clinics -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">🩺</div>
                <h3 class="text-lg font-bold text-slate-800">Local Walk-in Clinics</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Neighborhood family clinics for viral illness, routine pediatrics, diabetes maintenance, and fast local consultations.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 mt-4">
                <a href="#/doctors?facility_type=clinic" class="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">Find Clinics &rarr;</a>
              </div>
            </div>

            <!-- Tier 3: RMP Family Doctors & Home Visits -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">🏠</div>
                <h3 class="text-lg font-bold text-slate-800">RMP Doctors & Home Visits</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Trusted Registered Medical Practitioners with 20+ years community service. Direct home visits for bedridden or elderly patients.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 mt-4">
                <a href="#/home-visit" class="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">Book Home Doctor &rarr;</a>
              </div>
            </div>

            <!-- Tier 4: Ayurvedic & AYUSH Care -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">🌿</div>
                <h3 class="text-lg font-bold text-slate-800">Ayurvedic Chikitsalaya</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Licensed BAMS Vaidyas providing authentic Nadi Pariksha (Pulse Diagnosis), herbal therapy, and natural chronic pain care.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 mt-4">
                <a href="#/doctors?specialty=Ayurvedic" class="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">Ayurvedic Doctors &rarr;</a>
              </div>
            </div>

          </div>
        </section>

        <!-- Connected Patient Journey Stepper -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-r from-slate-900 to-sky-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <div class="max-w-3xl space-y-4 mb-10">
              <span class="px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-sky-400/30">Seamless Continuum</span>
              <h2 class="text-3xl sm:text-4xl font-black">The Connected Medi-Link Experience</h2>
              <p class="text-slate-300 text-base leading-relaxed">
                From initial symptom uncertainty to post-consultation medicine pickup, Medi-Link guides you every step without confusing hospital bureaucracy.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 space-y-3">
                <div class="text-sky-400 font-black text-2xl">01</div>
                <h4 class="font-bold text-lg text-white">Symptom & Triage</h4>
                <p class="text-xs text-slate-300 leading-relaxed">
                  AI and clinical algorithms analyze your health complaint and suggest the relevant department (e.g. Cardiology or Orthopedics).
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 space-y-3">
                <div class="text-sky-400 font-black text-2xl">02</div>
                <h4 class="font-bold text-lg text-white">7-Step Slot Booking</h4>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Select provider, doctor, date, and preferred time slot with eligibility check and preparation guidelines.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 space-y-3">
                <div class="text-sky-400 font-black text-2xl">03</div>
                <h4 class="font-bold text-lg text-white">Queue & Wayfinding</h4>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Track live token progression from home and follow step-by-step hospital navigation directly to the OPD counter.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 space-y-3">
                <div class="text-sky-400 font-black text-2xl">04</div>
                <h4 class="font-bold text-lg text-white">Prescription & Follow-up</h4>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Instantly locate prescribed medicines at nearby retail pharmacies and schedule follow-up or home visits if needed.
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    `;
  },

  attachEvents() {
    // Symptom search button
    const searchBtn = document.getElementById("hero-check-suitability-btn");
    const input = document.getElementById("hero-symptom-input");

    const doSearch = () => {
      const val = input?.value?.trim();
      if (val) {
        window.location.hash = `#/suitability?symptom=${encodeURIComponent(val)}`;
      } else {
        window.location.hash = "#/suitability";
      }
    };

    if (searchBtn && input) {
      searchBtn.addEventListener("click", doSearch);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearch();
      });
    }

    // Hero quick chips
    document.querySelectorAll(".hero-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        const sym = e.target.getAttribute("data-symptom");
        if (sym) {
          window.location.hash = `#/suitability?symptom=${encodeURIComponent(sym)}`;
        }
      });
    });
  }
};
