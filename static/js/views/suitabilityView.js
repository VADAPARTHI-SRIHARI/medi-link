/**
 * MEDI-LINK Hospital Suitability Matcher View
 * Users describe health problem/symptoms.
 * System analyzes clinical urgency, directs to appropriate department, care tier,
 * and matching hospital/clinic facilities with transparent clinical justification.
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const SuitabilityView = {
  async render(queryParams = {}) {
    const initialSymptom = queryParams.symptom || "";

    return `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase">
            <span>🎯 Clinical Triage & Hospital Suitability</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Find the Right Care Tier for Your Health Concern
          </h1>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
            Unsure whether to visit a major hospital, a walk-in community clinic, an RMP doctor, or an Ayurvedic Vaidya? Describe your symptoms below for an objective clinical routing.
          </p>
        </div>

        <!-- Input Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              Describe your health problem or symptoms in detail *
            </label>
            <textarea 
              id="suitability-textarea" 
              rows="3" 
              placeholder="e.g., Persistent morning knee stiffness and sharp pain while climbing stairs for 3 months, looking for non-invasive or Ayurvedic care..."
              class="w-full p-4 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800 font-medium text-sm sm:text-base"
            >${initialSymptom}</textarea>
          </div>

          <!-- Suggested Chips -->
          <div class="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            <span class="text-slate-400 font-bold">Try example:</span>
            <button class="suit-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-text="Severe chest discomfort radiating to left shoulder and breathing difficulty">Chest Pressure</button>
            <button class="suit-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-text="Knee joint osteoarthritis with swelling and morning stiffness">Knee Osteoarthritis</button>
            <button class="suit-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-text="Acute seasonal viral fever with severe body chills and headache">Viral Fever</button>
            <button class="suit-chip px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 transition" data-text="Chronic digestive acid reflux, bloating, and stomach discomfort">Acid Reflux</button>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div class="text-xs text-slate-500">
              📍 Current Location: <strong>Hyderabad</strong> (Auto-detected)
            </div>
            <button 
              id="suitability-analyze-btn" 
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Analyze Suitability & Facilities</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        <!-- Result Container -->
        <div id="suitability-result-container" class="space-y-6">
          ${initialSymptom ? `
            <div class="text-center py-8 text-slate-500">
              <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
              <p>Analyzing symptom suitability...</p>
            </div>
          ` : ''}
        </div>

      </div>
    `;
  },

  attachEvents(queryParams = {}) {
    const btn = document.getElementById("suitability-analyze-btn");
    const textarea = document.getElementById("suitability-textarea");

    const runAnalysis = async () => {
      const val = textarea?.value?.trim();
      if (!val || val.length < 3) {
        Toast.warning("Please enter your health symptoms or condition first.");
        return;
      }
      await SuitabilityView.fetchSuitability(val);
    };

    if (btn) btn.addEventListener("click", runAnalysis);

    document.querySelectorAll(".suit-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        if (textarea) {
          textarea.value = e.target.getAttribute("data-text");
          runAnalysis();
        }
      });
    });

    if (queryParams.symptom) {
      runAnalysis();
    }
  },

  async fetchSuitability(symptoms) {
    const container = document.getElementById("suitability-result-container");
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-10 text-slate-500 bg-white rounded-3xl border border-slate-200">
        <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
        <p class="font-bold text-slate-700">Evaluating clinical suitability against medical specialties...</p>
      </div>
    `;

    try {
      const res = await ApiClient.post("/hospitals/suitability", {
        symptoms,
        location: "Hyderabad"
      });

      const isEmergency = res.urgency_level.includes("Critical") || res.urgency_level.includes("Emergency");

      container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          
          <!-- Recommendation Banner -->
          <div class="p-6 rounded-2xl ${isEmergency ? 'bg-red-50 border-2 border-red-300' : 'bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200'} space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">${isEmergency ? '🚨' : '🩺'}</span>
                <span class="text-xs font-black uppercase tracking-wider ${isEmergency ? 'text-red-700' : 'text-sky-800'}">
                  Recommended Department:
                </span>
                <span class="px-3 py-1 rounded-full ${isEmergency ? 'bg-red-600 text-white' : 'bg-sky-600 text-white'} text-sm font-black">
                  ${res.detected_department}
                </span>
              </div>
              <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase ${isEmergency ? 'bg-red-200 text-red-900' : 'bg-emerald-100 text-emerald-800'}">
                Urgency: ${res.urgency_level}
              </span>
            </div>

            <div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Care Tier:</span>
              <h2 class="text-xl font-black text-slate-900">${res.recommended_care_tier}</h2>
            </div>

            <!-- Factual Clinical Rationale -->
            <div class="p-4 rounded-xl bg-white/80 border border-slate-200 text-sm text-slate-700 leading-relaxed">
              <strong class="text-slate-900 block mb-1">Clinical Rationale & Why This is Relevant:</strong>
              ${res.relevance_explanation}
            </div>

            ${isEmergency ? `
              <div class="pt-2">
                <a href="#/emergency" class="heartbeat-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition">
                  <span>🚨 Trigger Emergency SOS / Trauma Routing</span>
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Matching Facilities List -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900">
              Matching Facilities Providing ${res.detected_department} Services (${res.matching_facilities.length})
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${res.matching_facilities.map(fac => `
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 uppercase">${fac.type.replace('_', ' ')}</span>
                      <span class="text-xs font-bold text-amber-500">⭐ ${fac.rating}</span>
                    </div>
                    <h4 class="text-base font-bold text-slate-900">${fac.name}</h4>
                    <p class="text-xs text-slate-500">📍 ${fac.address}, ${fac.city}</p>
                    <p class="text-xs text-slate-600 line-clamp-2">${fac.description}</p>
                  </div>
                  <div class="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between">
                    <a href="#/navigation?facility_id=${fac.id}" class="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                      <span>🧭</span> Wayfinding
                    </a>
                    <a href="#/book?facility_id=${fac.id}&department=${encodeURIComponent(res.detected_department)}" class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition">
                      Book OP Slot &rarr;
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Available Specialized Doctors -->
          ${res.matching_doctors && res.matching_doctors.length > 0 ? `
            <div class="space-y-4 pt-4 border-t border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">
                Specialized Doctors in ${res.detected_department}
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${res.matching_doctors.map(doc => `
                  <div class="p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition space-y-3">
                    <div class="flex items-center gap-3">
                      <img src="${doc.image_url}" alt="${doc.name}" class="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <h4 class="text-sm font-bold text-slate-900 leading-tight">${doc.name}</h4>
                        <p class="text-xs text-sky-700 font-semibold">${doc.specialty}</p>
                        <p class="text-[10px] text-slate-500">${doc.experience_years} Years Experience</p>
                      </div>
                    </div>
                    <div class="text-xs text-slate-600 flex items-center justify-between">
                      <span>Fee: <strong class="text-emerald-700">₹${doc.fee}</strong></span>
                      <span class="text-slate-400 truncate max-w-[120px]">${doc.facility_name}</span>
                    </div>
                    <a href="#/book?doctor_id=${doc.id}&facility_id=${doc.facility_id}&department=${encodeURIComponent(doc.department)}" class="w-full block text-center py-2 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 font-bold text-xs transition">
                      Book Consultation
                    </a>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Transparent Disclaimer -->
          <div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Platform Guarantee Disclaimer:</strong> ${res.safety_disclaimer}
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm font-semibold">
          Error analyzing suitability: ${err.message || "Please try again later."}
        </div>
      `;
    }
  }
};
