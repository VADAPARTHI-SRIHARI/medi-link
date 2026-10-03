/**
 * MEDI-LINK Emergency 24x7 Hub View
 * Supports:
 * 1. Emergency Alert (Instant SOS Dispatch Simulation)
 * 2. Emergency ER Appointment Booking
 * 3. Offline Emergency Kit & First-Aid Guides (CPR, Choking, Severe Bleeding)
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const EmergencyView = {
  activeTab: "sos", // sos, er_booking, offline_kit

  async render() {
    return `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- High-Impact Red Emergency Banner -->
        <div class="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-4xl heartbeat-btn">🚨</span>
              <div>
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight">24x7 Emergency Critical Care</h1>
                <p class="text-xs sm:text-sm text-red-100 font-semibold">Immediate medical triage, ambulance coordination & trauma booking</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <a href="tel:108" class="px-5 py-3 rounded-2xl bg-white text-red-700 font-black text-sm sm:text-base hover:bg-red-50 transition shadow-lg flex items-center gap-2">
                <span>📞 Call 108</span>
              </a>
              <a href="tel:112" class="px-4 py-3 rounded-2xl bg-red-950/40 text-white font-bold text-sm sm:text-base hover:bg-red-950/60 transition flex items-center gap-1">
                <span>Dial 112</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 3 Feature Navigation Tabs -->
        <div class="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button class="emerg-tab-btn py-3 rounded-xl font-bold text-xs sm:text-sm transition bg-white text-red-700 shadow-sm" data-tab="sos">
            🚨 Emergency Alert (SOS)
          </button>
          <button class="emerg-tab-btn py-3 rounded-xl font-bold text-xs sm:text-sm transition text-slate-700 hover:bg-white/50" data-tab="er_booking">
            🏥 Emergency ER Booking
          </button>
          <button class="emerg-tab-btn py-3 rounded-xl font-bold text-xs sm:text-sm transition text-slate-700 hover:bg-white/50" data-tab="offline_kit">
            🩹 Offline First-Aid Kit
          </button>
        </div>

        <!-- Tab Content Container -->
        <div id="emerg-tab-content-container" class="space-y-6">
          <!-- Rendered via JS -->
        </div>

      </div>
    `;
  },

  async attachEvents() {
    this.renderCurrentTab();

    document.querySelectorAll(".emerg-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".emerg-tab-btn").forEach(b => {
          b.className = "emerg-tab-btn py-3 rounded-xl font-bold text-xs sm:text-sm transition text-slate-700 hover:bg-white/50";
        });
        e.target.className = "emerg-tab-btn py-3 rounded-xl font-bold text-xs sm:text-sm transition bg-white text-red-700 shadow-sm";
        this.activeTab = e.target.getAttribute("data-tab");
        this.renderCurrentTab();
      });
    });
  },

  renderCurrentTab() {
    const container = document.getElementById("emerg-tab-content-container");
    if (!container) return;

    if (this.activeTab === "sos") {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">One-Touch Emergency SOS Alert</h2>
            <p class="text-xs text-slate-500">Collects minimum critical details to dispatch simulated ambulance and alert emergency trauma units.</p>
          </div>

          <form id="emerg-sos-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Caller / Patient Name *</label>
                <input type="text" id="sos-name" value="Rajesh Kumar" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone *</label>
                <input type="tel" id="sos-phone" value="+919876543210" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Current Precise Location / Address *</label>
              <div class="flex gap-2">
                <input type="text" id="sos-address" value="Road No. 12, Banjara Hills, Near Care Hospital, Hyderabad" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required />
                <button type="button" id="sos-gps-btn" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0">📍 GPS</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Emergency Nature *</label>
                <select id="sos-type" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-red-700">
                  <option value="Cardiac / Severe Chest Pain">Cardiac / Severe Chest Pain</option>
                  <option value="Road Accident / Major Trauma">Road Accident / Major Trauma</option>
                  <option value="Severe Breathlessness / Asthma">Severe Breathlessness / Asthma</option>
                  <option value="Stroke / Sudden Slurred Speech">Stroke / Sudden Slurred Speech</option>
                  <option value="Unconscious / Fainting Collapse">Unconscious / Fainting Collapse</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Family Emergency Contact Phone</label>
                <input type="tel" id="sos-family" value="+919876543211" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed">
              <strong>Simulated Integration Notice:</strong> This triggers an automated emergency dispatch simulation. In actual deployment, this coordinates with 108 Emergency Control Centers and nearest trauma wards.
            </div>

            <button type="submit" id="sos-trigger-btn" class="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-xl shadow-red-500/30 transition flex items-center justify-center gap-2">
              <span class="text-xl">🚨</span>
              <span>TRIGGER EMERGENCY DISPATCH (SOS)</span>
            </button>
          </form>

          <div id="sos-result-container"></div>

        </div>
      `;

      // GPS button
      document.getElementById("sos-gps-btn")?.addEventListener("click", () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const inp = document.getElementById("sos-address");
              if (inp) inp.value = `GPS: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)} (Hyderabad)`;
              Toast.success("GPS Location acquired.");
            },
            () => Toast.warning("GPS access denied. Manual address maintained.")
          );
        }
      });

      // Submit
      document.getElementById("emerg-sos-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user_name = document.getElementById("sos-name")?.value;
        const user_mobile = document.getElementById("sos-phone")?.value;
        const address = document.getElementById("sos-address")?.value;
        const emergency_type = document.getElementById("sos-type")?.value;
        const emergency_contact = document.getElementById("sos-family")?.value;

        try {
          const res = await ApiClient.post("/emergency/sos", {
            user_name,
            user_mobile,
            address,
            emergency_type,
            emergency_contact
          });

          Toast.success("Emergency SOS Dispatch Activated!");

          const resContainer = document.getElementById("sos-result-container");
          if (resContainer) {
            resContainer.innerHTML = `
              <div class="p-6 rounded-2xl bg-red-50 border-2 border-red-400 space-y-4 text-red-950 animate-fade-in mt-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">🚑</span>
                    <strong class="text-lg font-black text-red-900">Ambulance Dispatched!</strong>
                  </div>
                  <span class="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs">ETA: ~${res.eta_minutes} MINS</span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="p-3 bg-white rounded-xl border border-red-200">
                    <span class="text-slate-400 uppercase font-bold block">Vehicle Number</span>
                    <strong class="text-base text-red-900 font-mono">${res.dispatched_vehicle}</strong>
                  </div>
                  <div class="p-3 bg-white rounded-xl border border-red-200">
                    <span class="text-slate-400 uppercase font-bold block">Target Hospital</span>
                    <strong class="text-slate-800">${res.assigned_hospital}</strong>
                  </div>
                </div>

                <div class="space-y-1 text-xs">
                  <strong class="block text-red-900">Immediate First-Aid Instructions:</strong>
                  <ul class="list-disc pl-5 space-y-1 text-red-900">
                    ${res.first_aid_guidance.map(g => `<li>${g}</li>`).join('')}
                  </ul>
                </div>

                <div class="pt-2 text-[11px] text-red-700 italic border-t border-red-200">
                  ${res.simulation_notice}
                </div>
              </div>
            `;
          }
        } catch (err) {
          Toast.error(err.message || "Failed to trigger SOS");
        }
      });

    } else if (this.activeTab === "er_booking") {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Priority Emergency Room (ER) Arrival Booking</h2>
            <p class="text-xs text-slate-500">Alerts the on-duty Trauma Medical Officer so triage is prepared before your arrival.</p>
          </div>

          <form id="emerg-er-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Patient Name *</label>
                <input type="text" id="er-patient" value="Rajesh Kumar" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Mobile Contact *</label>
                <input type="tel" id="er-mobile" value="+919876543210" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Select Nearest Trauma Center *</label>
              <select id="er-hospital" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800">
                <option value="fac-hosp-01">City General Hospital - Level 1 Trauma Center (1.2 km away)</option>
                <option value="fac-hosp-02">Apollo Emergency & Heart Institute (2.8 km away)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Symptoms / Trauma Details *</label>
              <textarea id="er-symptoms" rows="2" placeholder="e.g. Acute severe chest pain radiating to jaw, heavy sweating, unable to lie down" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required></textarea>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition">
              Confirm Priority ER Pre-Arrival Notification &rarr;
            </button>
          </form>

          <div id="er-result-container"></div>
        </div>
      `;

      document.getElementById("emerg-er-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const patient_name = document.getElementById("er-patient")?.value;
        const mobile = document.getElementById("er-mobile")?.value;
        const symptoms = document.getElementById("er-symptoms")?.value;

        try {
          const res = await ApiClient.post("/emergency/appointment", {
            patient_name,
            mobile,
            symptoms,
            severity: "CRITICAL",
            location: "Hyderabad"
          });

          Toast.success("Emergency pre-arrival registered with hospital triage!");

          const resContainer = document.getElementById("er-result-container");
          if (resContainer) {
            resContainer.innerHTML = `
              <div class="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 text-emerald-950 mt-4 animate-fade-in">
                <div class="flex items-center justify-between">
                  <strong class="text-base font-bold">ER Pre-Arrival Confirmed</strong>
                  <span class="font-mono font-bold text-xs bg-emerald-200 px-2.5 py-1 rounded-md">${res.queue_token}</span>
                </div>
                <div class="text-xs space-y-1">
                  <div>🏥 <strong>Hospital:</strong> ${res.hospital}</div>
                  <div>📍 <strong>Entry:</strong> ${res.location}</div>
                  <div>🎯 <strong>Triage Desk:</strong> ${res.counter}</div>
                  <div class="text-emerald-800 font-semibold pt-1">${res.instructions}</div>
                </div>
              </div>
            `;
          }
        } catch (err) {
          Toast.error(err.message || "Failed to book ER");
        }
      });

    } else if (this.activeTab === "offline_kit") {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Offline Emergency Medical Card & First-Aid Guides</h2>
            <p class="text-xs text-slate-500">Accessible locally on your device even without active internet connection.</p>
          </div>

          <!-- Patient ICE Card -->
          <div class="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-red-400 uppercase tracking-widest">In Case of Emergency (ICE)</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-bold">Cached Locally</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span class="text-slate-400 block text-[10px]">Patient</span>
                <strong>Rajesh Kumar</strong>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Blood Group</span>
                <strong class="text-red-400 text-sm">O Positive (O+)</strong>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Allergies</span>
                <strong class="text-amber-400">Penicillin (Mild)</strong>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">ICE Relative Phone</span>
                <strong>+91 98765 43211</strong>
              </div>
            </div>
          </div>

          <!-- First Aid Accordion / Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>🫀</span> CPR for Adults (Cardiac Arrest)
              </h4>
              <p class="text-slate-600 leading-relaxed">
                1. Call 108 immediately.<br/>
                2. Place hands center of chest.<br/>
                3. Push hard and fast (100-120 compressions/minute to the beat of "Stayin' Alive").<br/>
                4. Allow chest to fully recoil between compressions.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>🗣️</span> Choking (Heimlich Maneuver)
              </h4>
              <p class="text-slate-600 leading-relaxed">
                1. Stand behind the person.<br/>
                2. Wrap arms around waist.<br/>
                3. Make a fist above the navel.<br/>
                4. Give quick, upward thrusts until airway obstruction is cleared.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>🩸</span> Severe Bleeding Control
              </h4>
              <p class="text-slate-600 leading-relaxed">
                1. Apply firm, continuous direct pressure with sterile cloth.<br/>
                2. Elevate the injured limb above heart level if no fracture suspected.<br/>
                3. Do NOT remove soaked bandages; add more layers on top.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>🐍</span> Snakebite Management
              </h4>
              <p class="text-slate-600 leading-relaxed">
                1. Keep patient strictly calm and still.<br/>
                2. Immobilize the bitten limb at heart level.<br/>
                3. Remove tight jewelry or rings.<br/>
                4. Do NOT cut, suck venom, or apply tight tourniquets. Transport immediately to hospital with Anti-Snake Venom (ASV).
              </p>
            </div>

          </div>

        </div>
      `;
    }
  }
};
