/**
 * MEDI-LINK Hospitals & Facilities Directory View
 * Multi-tier healthcare centers: Tertiary Hospitals, Community Clinics,
 * Neighborhood RMP clinics, and Ayurvedic Chikitsalayas.
 */

import { ApiClient } from "../api.js";
import { store } from "../config.js";

export const HospitalsView = {
  facilities: [],
  activeFilter: "",

  async render() {
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-3xl font-extrabold text-slate-900">Hospitals, Clinics & Wellness Centers</h1>
            <p class="text-slate-500 text-sm">
              Discover accredited medical institutions, local community clinics, RMP practices, and AYUSH healing centers.
            </p>
          </div>
          <a href="#/suitability" class="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition">
            Check Hospital Suitability &rarr;
          </a>
        </div>

        <!-- Filter Chips -->
        <div class="flex flex-wrap items-center gap-2">
          <button class="hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-900 text-white shadow-sm" data-type="">All Facilities</button>
          <button class="hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-type="hospital">Hospitals</button>
          <button class="hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-type="clinic">Community Clinics</button>
          <button class="hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-type="rmp_clinic">RMP Neighborhood Points</button>
          <button class="hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-type="ayurvedic_centre">Ayurvedic Centers</button>
        </div>

        <!-- Facilities Grid -->
        <div id="facilities-grid-container" class="space-y-4">
          <div class="text-center py-12 text-slate-500">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Loading medical facilities...</p>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchAndRenderFacilities();

    document.querySelectorAll(".hosp-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".hosp-filter-btn").forEach(b => {
          b.className = "hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";
        });
        e.target.className = "hosp-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-900 text-white shadow-sm";
        this.activeFilter = e.target.getAttribute("data-type") || "";
        this.fetchAndRenderFacilities();
      });
    });
  },

  async fetchAndRenderFacilities() {
    const container = document.getElementById("facilities-grid-container");
    if (!container) return;

    try {
      const params = {};
      if (this.activeFilter) params.facility_type = this.activeFilter;
      const facilities = await ApiClient.get("/hospitals", params);
      this.facilities = facilities;

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${facilities.map(fac => {
            const isHosp = fac.type === 'hospital';
            const isRMP = fac.type === 'rmp_clinic';
            const isAyur = fac.type === 'ayurvedic_centre';

            const typeLabel = isHosp ? 'Multi-Speciality Hospital' : isRMP ? 'RMP Neighborhood Clinic' : isAyur ? 'Ayurvedic Chikitsalaya' : 'Community Clinic';

            return `
              <div class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div class="relative h-44 overflow-hidden bg-slate-100">
                    <img src="${fac.image_url}" alt="${fac.name}" class="w-full h-full object-cover hover:scale-105 transition transform duration-500" />
                    <div class="absolute top-3 left-3">
                      <span class="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/90 backdrop-blur text-slate-800 shadow-sm">
                        ${typeLabel}
                      </span>
                    </div>
                    ${fac.emergency_available ? `
                      <div class="absolute top-3 right-3">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm flex items-center gap-1">
                          <span>🚨</span> 24x7 ER
                        </span>
                      </div>
                    ` : ''}
                  </div>

                  <div class="p-5 space-y-3">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="text-lg font-bold text-slate-900 leading-snug">${fac.name}</h3>
                      <span class="text-xs text-amber-500 font-bold flex items-center">⭐ ${fac.rating}</span>
                    </div>

                    <p class="text-xs text-slate-500 line-clamp-2">${fac.description}</p>

                    <div class="text-xs text-slate-600 space-y-1">
                      <div>📍 <strong>Address:</strong> ${fac.address}, ${fac.city}</div>
                      <div>📞 <strong>Phone:</strong> ${fac.phone}</div>
                      <div>🕒 <strong>Hours:</strong> ${fac.opd_timings}</div>
                    </div>

                    <div class="pt-2">
                      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Departments:</span>
                      <div class="flex flex-wrap gap-1">
                        ${fac.department_list.slice(0, 4).map(d => `
                          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">${d}</span>
                        `).join('')}
                        ${fac.department_list.length > 4 ? `
                          <span class="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px]">+${fac.department_list.length - 4} more</span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a href="#/navigation?facility_id=${fac.id}" class="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1">
                    <span>🧭</span>
                    <span>Wayfinding</span>
                  </a>
                  <a href="#/book?facility_id=${fac.id}&department=${encodeURIComponent(fac.department_list[0] || 'General Medicine')}" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition">
                    Book OPD Slot &rarr;
                  </a>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm">Failed to load facilities.</div>`;
    }
  }
};
