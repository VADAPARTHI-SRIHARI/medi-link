/**
 * MEDI-LINK Hospital Indoor Navigation & Wayfinding View
 * Visual step-by-step route guidance designed for elderly and first-time hospital visitors:
 * Hospital → Building/Block → Floor → Room/Counter → Route landmarks.
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const NavigationView = {
  facilityId: "fac-hosp-01",
  selectedDept: "Cardiology",
  facilityData: null,

  async render(queryParams = {}) {
    if (queryParams.facility_id) this.facilityId = queryParams.facility_id;
    if (queryParams.dept) this.selectedDept = decodeURIComponent(queryParams.dept);

    return `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-3xl">🧭</span>
              <h1 class="text-3xl font-extrabold text-slate-900">Hospital Indoor Wayfinding</h1>
            </div>
            <p class="text-slate-500 text-sm">
              Designed for senior citizens and first-time hospital visitors with clear floor landmarks and elevator directions.
            </p>
          </div>
          <span class="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            ♿ Wheelchair Accessible Routes
          </span>
        </div>

        <!-- Controls: Hospital & Department Selector -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Select Hospital</label>
              <select id="nav-facility-select" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800">
                <option value="fac-hosp-01" ${this.facilityId === 'fac-hosp-01' ? 'selected' : ''}>City General Hospital (Main Campus)</option>
                <option value="fac-hosp-02" ${this.facilityId === 'fac-hosp-02' ? 'selected' : ''}>Apollo Care & Heart Institute</option>
                <option value="fac-ayur-01" ${this.facilityId === 'fac-ayur-01' ? 'selected' : ''}>Ayush Sanjeevani Ayurvedic Chikitsalaya</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Target Department / Destination</label>
              <select id="nav-dept-select" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800">
                <option value="Cardiology" ${this.selectedDept === 'Cardiology' ? 'selected' : ''}>Cardiology OPD</option>
                <option value="Emergency & Trauma" ${this.selectedDept.includes('Emergency') ? 'selected' : ''}>Emergency & Trauma Care</option>
                <option value="Orthopedics" ${this.selectedDept === 'Orthopedics' ? 'selected' : ''}>Orthopedics & Fracture Clinic</option>
                <option value="Pediatrics" ${this.selectedDept === 'Pediatrics' ? 'selected' : ''}>Pediatrics & Child Care</option>
                <option value="General Medicine" ${this.selectedDept === 'General Medicine' ? 'selected' : ''}>General Medicine OPD</option>
                <option value="Pharmacy & Diagnostic Lab" ${this.selectedDept.includes('Pharmacy') ? 'selected' : ''}>Central Pharmacy & Lab</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Wayfinding Result Container -->
        <div id="wayfinding-details-container" class="space-y-6">
          <div class="text-center py-12 text-slate-400">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Loading hospital floor plan and route directions...</p>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchWayfinding();

    const facSelect = document.getElementById("nav-facility-select");
    const deptSelect = document.getElementById("nav-dept-select");

    const update = () => {
      this.facilityId = facSelect?.value || "fac-hosp-01";
      this.selectedDept = deptSelect?.value || "Cardiology";
      this.fetchWayfinding();
    };

    if (facSelect) facSelect.addEventListener("change", update);
    if (deptSelect) deptSelect.addEventListener("change", update);
  },

  async fetchWayfinding() {
    const container = document.getElementById("wayfinding-details-container");
    if (!container) return;

    try {
      const fac = await ApiClient.get(`/hospitals/${this.facilityId}`);
      this.facilityData = fac;

      const nodes = fac.wayfinding_nodes || [];
      const targetNode = nodes.find(n => n.department.toLowerCase().includes(this.selectedDept.toLowerCase())) || nodes[0];

      container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8 animate-fade-in">
          
          <!-- Destination Summary Card -->
          <div class="p-6 rounded-2xl bg-gradient-to-r from-sky-900 to-slate-900 text-white shadow-md space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-sky-400/30">
                Destination Target
              </span>
              <span class="text-xs text-emerald-400 font-bold flex items-center gap-1">
                ♿ Ramp & Elevator Ready
              </span>
            </div>

            <div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">${targetNode.department}</h2>
              <p class="text-sky-200 text-sm font-semibold">${fac.name}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
              <div class="p-3 bg-white/10 rounded-xl">
                <span class="text-slate-300 block text-[10px] font-semibold uppercase">Building / Block</span>
                <strong class="text-white text-sm">${targetNode.building}</strong>
              </div>
              <div class="p-3 bg-white/10 rounded-xl">
                <span class="text-slate-300 block text-[10px] font-semibold uppercase">Floor Level</span>
                <strong class="text-amber-300 text-sm">${targetNode.floor}</strong>
              </div>
              <div class="p-3 bg-white/10 rounded-xl">
                <span class="text-slate-300 block text-[10px] font-semibold uppercase">Room / Counter</span>
                <strong class="text-emerald-300 text-sm">${targetNode.room_counter}</strong>
              </div>
            </div>
          </div>

          <!-- Step-by-Step Wayfinding Guidance -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900">Step-by-Step Walking Route</h3>
            
            <div class="space-y-4">
              
              <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="w-10 h-10 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center shrink-0">1</div>
                <div class="space-y-1">
                  <h4 class="text-sm font-bold text-slate-800">Hospital Main Gate Arrival</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Enter through Main Entrance Gate 1 on Main Road. Wheelchairs and patient support attendants are stationed directly inside the glass double doors.
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="w-10 h-10 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center shrink-0">2</div>
                <div class="space-y-1">
                  <h4 class="text-sm font-bold text-slate-800">Central Atrium & Floor Indicator</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Walk past the Main Reception desk towards the central illuminated floor directory. Follow the <strong>${targetNode.floor}</strong> indicator.
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 rounded-2xl bg-sky-50 border-2 border-sky-300">
                <div class="w-10 h-10 rounded-xl bg-sky-800 text-white font-black text-base flex items-center justify-center shrink-0">3</div>
                <div class="space-y-1">
                  <h4 class="text-sm font-bold text-sky-950">Specific Room Directions</h4>
                  <p class="text-xs text-sky-900 leading-relaxed font-semibold">
                    ${targetNode.directions}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <!-- Elderly Assistance Callout -->
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
            <span class="text-2xl">👴</span>
            <div>
              <strong class="font-bold text-sm block">Elderly & Low-Mobility Assistance</strong>
              If you or an accompanying family member require escort assistance or a wheelchair, please speak to the "May I Help You" desk at the ground floor entrance, or call the hospital concierge at <strong>${fac.phone}</strong>.
            </div>
          </div>

        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm">Error loading wayfinding map.</div>`;
    }
  }
};
