/**
 * MEDI-LINK Doctor & Healthcare Provider Discovery View
 * Multi-tier provider directory: Super-specialists, Hospital Consultants,
 * Local Clinic GPs, Registered Medical Practitioners (RMP), and Ayurvedic Vaidyas.
 */

import { ApiClient } from "../api.js";
import { store } from "../config.js";

export const DoctorsView = {
  doctors: [],
  filters: {
    search: "",
    specialty: "",
    facility_type: "",
    home_visit: false,
    location: ""
  },

  async render(queryParams = {}) {
    this.filters.specialty = queryParams.specialty || "";
    this.filters.facility_type = queryParams.facility_type || "";
    if (queryParams.home_visit === "true") this.filters.home_visit = true;

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-3xl font-extrabold text-slate-900">Verified Healthcare Providers</h1>
            <p class="text-slate-500 text-sm">
              Transparent, factual directory comparing specialists, local clinic doctors, RMPs, and Ayurvedic vaidyas without arbitrary "best" rankings.
            </p>
          </div>
          <a href="#/suitability" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-sm border border-sky-200 hover:bg-sky-100 transition">
            <span>🎯 Not sure which doctor?</span>
            <span class="underline">Use Suitability Matcher</span>
          </a>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            
            <!-- Search Query -->
            <div class="lg:col-span-4">
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Search Doctor or Condition</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="doc-search-input" 
                  value="${this.filters.search}"
                  placeholder="e.g. Cardiologist, Dr. Venkat, Fever, Joint pain..." 
                  class="w-full px-4 py-2.5 pl-9 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span class="absolute left-3 top-3 text-slate-400 text-sm">🔍</span>
              </div>
            </div>

            <!-- Specialty Filter -->
            <div class="lg:col-span-3">
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Specialty</label>
              <select id="doc-specialty-filter" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none">
                <option value="">All Specialties</option>
                <option value="Cardiology" ${this.filters.specialty === 'Cardiology' ? 'selected' : ''}>Cardiology (Heart)</option>
                <option value="Orthopedics" ${this.filters.specialty === 'Orthopedics' ? 'selected' : ''}>Orthopedics (Bones & Joints)</option>
                <option value="Pediatrics" ${this.filters.specialty === 'Pediatrics' ? 'selected' : ''}>Pediatrics (Child Health)</option>
                <option value="General Practice (RMP)" ${this.filters.specialty.includes('RMP') ? 'selected' : ''}>General Practice (RMP)</option>
                <option value="Ayurvedic" ${this.filters.specialty.includes('Ayurvedic') ? 'selected' : ''}>Ayurvedic Medicine (AYUSH)</option>
                <option value="General Medicine" ${this.filters.specialty === 'General Medicine' ? 'selected' : ''}>General Medicine</option>
              </select>
            </div>

            <!-- Care Facility Tier Filter -->
            <div class="lg:col-span-3">
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Provider Type</label>
              <select id="doc-facility-type-filter" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none">
                <option value="">All Provider Tiers</option>
                <option value="hospital" ${this.filters.facility_type === 'hospital' ? 'selected' : ''}>Multi-Speciality Hospitals</option>
                <option value="clinic" ${this.filters.facility_type === 'clinic' ? 'selected' : ''}>Community Clinics</option>
                <option value="rmp_clinic" ${this.filters.facility_type === 'rmp_clinic' ? 'selected' : ''}>RMP Doctors (Local Family)</option>
                <option value="ayurvedic_centre" ${this.filters.facility_type === 'ayurvedic_centre' ? 'selected' : ''}>Ayurvedic Vaidyas / Centres</option>
              </select>
            </div>

            <!-- Home Visit Checkbox & Reset -->
            <div class="lg:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-6">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input type="checkbox" id="doc-home-visit-filter" ${this.filters.home_visit ? 'checked' : ''} class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500" />
                <span>Home Visit</span>
              </label>
              <button id="doc-reset-filters-btn" class="text-xs text-sky-600 hover:text-sky-800 font-bold underline">Reset</button>
            </div>

          </div>
        </div>

        <!-- Doctor Cards Grid Container -->
        <div id="doctors-list-container" class="space-y-4">
          <div class="text-center py-12 text-slate-500">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Loading verified healthcare practitioners...</p>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchAndRenderDoctors();

    const searchInput = document.getElementById("doc-search-input");
    const specialtyFilter = document.getElementById("doc-specialty-filter");
    const facilityTypeFilter = document.getElementById("doc-facility-type-filter");
    const homeVisitFilter = document.getElementById("doc-home-visit-filter");
    const resetBtn = document.getElementById("doc-reset-filters-btn");

    const update = () => {
      this.filters.search = searchInput?.value?.trim() || "";
      this.filters.specialty = specialtyFilter?.value || "";
      this.filters.facility_type = facilityTypeFilter?.value || "";
      this.filters.home_visit = homeVisitFilter?.checked || false;
      this.fetchAndRenderDoctors();
    };

    if (searchInput) searchInput.addEventListener("input", () => update());
    if (specialtyFilter) specialtyFilter.addEventListener("change", () => update());
    if (facilityTypeFilter) facilityTypeFilter.addEventListener("change", () => update());
    if (homeVisitFilter) homeVisitFilter.addEventListener("change", () => update());

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (specialtyFilter) specialtyFilter.value = "";
        if (facilityTypeFilter) facilityTypeFilter.value = "";
        if (homeVisitFilter) homeVisitFilter.checked = false;
        this.filters = { search: "", specialty: "", facility_type: "", home_visit: false, location: "" };
        this.fetchAndRenderDoctors();
      });
    }
  },

  async fetchAndRenderDoctors() {
    const container = document.getElementById("doctors-list-container");
    if (!container) return;

    try {
      const params = {};
      if (this.filters.search) params.search = this.filters.search;
      if (this.filters.specialty) params.specialty = this.filters.specialty;
      if (this.filters.facility_type) params.facility_type = this.filters.facility_type;
      if (this.filters.home_visit) params.home_visit = true;

      const docs = await ApiClient.get("/doctors", params);
      this.doctors = docs;

      if (!docs || docs.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <span class="text-4xl">🔍</span>
            <h3 class="text-lg font-bold text-slate-800">No matching providers found</h3>
            <p class="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't find any doctor matching your active filters. Try clearing specific keywords or searching for general medicine.
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${docs.map(doc => {
            const isRMP = doc.facility_type === 'rmp_clinic' || doc.specialty.includes('RMP');
            const isAyur = doc.facility_type === 'ayurvedic_centre' || doc.specialty.includes('Ayurvedic');

            const tierBadge = isRMP
              ? '<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">RMP / Family GP</span>'
              : isAyur
              ? '<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300">Ayurvedic Vaidya</span>'
              : '<span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">Hospital Consultant</span>';

            return `
              <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <img src="${doc.image_url}" alt="${doc.name}" class="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="text-lg font-bold text-slate-900 leading-tight">${doc.name}</h3>
                          <span class="text-xs text-amber-500 font-bold flex items-center">⭐ ${doc.rating}</span>
                        </div>
                        <p class="text-xs text-sky-700 font-bold">${doc.specialty}</p>
                        <p class="text-[11px] text-slate-500 truncate max-w-xs">${doc.qualification}</p>
                      </div>
                    </div>
                    ${tierBadge}
                  </div>

                  <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    ${doc.bio}
                  </p>

                  <!-- Verified Credentials Pill -->
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">Registration:</span>
                      <span class="font-semibold text-slate-800">${doc.reg_number} (${doc.reg_council})</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">Experience:</span>
                      <span class="font-semibold text-slate-800">${doc.experience_years} Years Practice</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">Consultation Fee:</span>
                      <span class="font-bold text-emerald-700">₹${doc.fee}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">Facility / Clinic:</span>
                      <span class="font-medium text-slate-700 truncate max-w-[200px]">${doc.facility_name}</span>
                    </div>
                  </div>

                  <!-- Consultation Badges -->
                  <div class="flex flex-wrap gap-1.5 text-[11px]">
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">In-Person OPD</span>
                    ${doc.home_visit_available ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">🏠 Home Visit Available</span>' : ''}
                    <span class="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">Teleconsult</span>
                  </div>
                </div>

                <!-- Action Button -->
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div class="text-[11px] text-emerald-600 font-semibold">
                    ● Next: ${doc.next_available_slot}
                  </div>
                  <div class="flex items-center gap-2">
                    ${doc.home_visit_available ? `
                      <a href="#/home-visit?doctor_id=${doc.id}" class="px-3 py-2 rounded-xl border border-emerald-600 text-emerald-700 font-bold text-xs hover:bg-emerald-50 transition">
                        Home Visit
                      </a>
                    ` : ''}
                    <a href="#/book?doctor_id=${doc.id}&facility_id=${doc.facility_id}&department=${encodeURIComponent(doc.department)}" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition">
                      Book Slot &rarr;
                    </a>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm">
          Failed to load healthcare providers. Please check server connection.
        </div>
      `;
    }
  }
};
