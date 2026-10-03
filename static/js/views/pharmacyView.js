/**
 * MEDI-LINK Medicine & Nearby Pharmacy Finder View
 * Search certified pharmaceuticals, Ayurvedic formulations, check live inventory,
 * verify prescription requirements, and reserve for counter pickup.
 */

import { ApiClient } from "../api.js";
import { Modal } from "../components/modal.js";
import { Toast } from "../components/toast.js";

export const PharmacyView = {
  medicines: [],
  searchQuery: "",
  prescriptionOnly: null,

  async render() {
    return `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-3xl font-extrabold text-slate-900">Medicine & Pharmacy Finder</h1>
            <p class="text-slate-500 text-sm">
              Locate genuine medications across certified 24x7 retail chemists, hospital pharmacies, and Ayurvedic stores.
            </p>
          </div>
          <span class="px-3 py-1.5 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            📍 Geo-Discovery: Hyderabad
          </span>
        </div>

        <!-- Safety Notice Banner -->
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <span class="text-xl">⚠️</span>
          <div class="leading-relaxed">
            <strong>Prescription & Patient Safety Policy:</strong>
            Schedule H and antibiotic medications strictly require a valid physical or digital prescription signed by a registered medical practitioner. Medi-Link prohibits illegal self-medication. All inventory levels are displayed from verified regional partner feeds (Simulated Inventory Demo).
          </div>
        </div>

        <!-- Search Bar & Filters -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            <div class="md:col-span-8">
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Search Medicine or Generic Drug</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="pharm-search-input" 
                  placeholder="e.g. Dolo 650, Augmentin, Pan 40, Telma, Ashwagandha..." 
                  class="w-full px-4 py-2.5 pl-9 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span class="absolute left-3 top-3 text-slate-400 text-sm">💊</span>
              </div>
            </div>

            <div class="md:col-span-4 flex items-center justify-end gap-3 pt-4 md:pt-6">
              <select id="pharm-rx-filter" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700">
                <option value="">All Medications</option>
                <option value="rx">Prescription Required Only</option>
                <option value="otc">Over-The-Counter (OTC)</option>
              </select>
            </div>

          </div>

          <!-- Quick Drug Chips -->
          <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span class="text-slate-400 font-bold">Popular:</span>
            <button class="med-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold" data-name="Dolo">Dolo 650mg</button>
            <button class="med-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold" data-name="Augmentin">Augmentin 625</button>
            <button class="med-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold" data-name="Pan 40">Pan 40</button>
            <button class="med-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold" data-name="Telma">Telma 40</button>
            <button class="med-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold" data-name="Ashwagandha">Ashwagandha</button>
            <button class="med-chip px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold" data-name="Asthalin">Asthalin Inhaler</button>
          </div>
        </div>

        <!-- Medicines Grid -->
        <div id="medicines-grid-container" class="space-y-4">
          <div class="text-center py-12 text-slate-400">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Searching pharmacy inventory...</p>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchMedicines();

    const input = document.getElementById("pharm-search-input");
    const rxFilter = document.getElementById("pharm-rx-filter");

    const update = () => {
      this.searchQuery = input?.value?.trim() || "";
      const rxVal = rxFilter?.value;
      this.prescriptionOnly = rxVal === "rx" ? true : rxVal === "otc" ? false : null;
      this.fetchMedicines();
    };

    if (input) input.addEventListener("input", update);
    if (rxFilter) rxFilter.addEventListener("change", update);

    document.querySelectorAll(".med-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        if (input) {
          input.value = e.target.getAttribute("data-name");
          update();
        }
      });
    });
  },

  async fetchMedicines() {
    const container = document.getElementById("medicines-grid-container");
    if (!container) return;

    try {
      const params = {};
      if (this.searchQuery) params.query = this.searchQuery;
      if (this.prescriptionOnly !== null) params.prescription_only = this.prescriptionOnly;

      const meds = await ApiClient.get("/pharmacy/medicines", params);
      this.medicines = meds || [];

      if (meds.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <span class="text-4xl">💊</span>
            <h3 class="text-lg font-bold text-slate-800">No medicines found</h3>
            <p class="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't match any drugs with that query. Try searching by generic name like Paracetamol or Pantoprazole.
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${meds.map(med => `
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
              
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="text-base font-bold text-slate-900 leading-snug">${med.name}</h3>
                    <p class="text-xs text-sky-700 font-semibold">${med.generic_name}</p>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    med.prescription_required ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }">
                    ${med.prescription_required ? 'Rx Required' : 'OTC Friendly'}
                  </span>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div class="flex justify-between text-slate-500">
                    <span>Dosage & Form:</span>
                    <strong class="text-slate-800">${med.dosage} (${med.form})</strong>
                  </div>
                  <div class="flex justify-between text-slate-500">
                    <span>Price (MRP):</span>
                    <strong class="text-emerald-700 text-sm">₹${med.price.toFixed(2)}</strong>
                  </div>
                  <div class="flex justify-between text-slate-500">
                    <span>Stock Status:</span>
                    <span class="font-bold text-emerald-600">● In Stock (${med.stock_quantity} available)</span>
                  </div>
                </div>

                <!-- Pharmacy Detail -->
                <div class="text-xs text-slate-600 space-y-1">
                  <div class="font-bold text-slate-800">🏪 ${med.pharmacy_name}</div>
                  <p class="text-slate-500 truncate">📍 ${med.pharmacy_address}</p>
                  <p class="text-[11px] text-slate-400">Distance: <strong>~${med.distance_km} km</strong> &bull; 🕒 ${med.open_hours}</p>
                </div>

                <p class="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  Instruction: ${med.instructions}
                </p>
              </div>

              <!-- Action -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a href="tel:${med.pharmacy_phone}" class="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  <span>📞</span> Call Store
                </a>
                <button class="reserve-med-btn px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition" data-id="${med.id}" data-name="${med.name}" data-ph-id="${med.pharmacy_id}" data-ph-name="${med.pharmacy_name}">
                  Reserve for Pickup &rarr;
                </button>
              </div>

            </div>
          `).join('')}
        </div>
      `;

      this.attachReserveButtons();
    } catch (err) {
      container.innerHTML = `<div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm">Failed to search medicines.</div>`;
    }
  },

  attachReserveButtons() {
    document.querySelectorAll(".reserve-med-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const medId = e.target.getAttribute("data-id");
        const medName = e.target.getAttribute("data-name");
        const phId = e.target.getAttribute("data-ph-id");
        const phName = e.target.getAttribute("data-ph-name");

        Modal.open({
          title: `Reserve Medication: ${medName}`,
          confirmText: "Confirm Pickup Reservation",
          contentHtml: `
            <div class="space-y-4">
              <p class="text-sm text-slate-600">
                Reserve <strong>${medName}</strong> at <strong>${phName}</strong> for convenient in-store collection.
              </p>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Your Full Name *</label>
                <input type="text" id="modal-reserve-name" value="Rajesh Kumar" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Mobile Contact *</label>
                <input type="tel" id="modal-reserve-phone" value="+919876543210" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Quantity Needed</label>
                <input type="number" id="modal-reserve-qty" min="1" max="5" value="1" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                ⚠️ <strong>Note:</strong> Original prescription must be presented physically to the pharmacist upon counter collection.
              </div>
            </div>
          `,
          onConfirm: async () => {
            const name = document.getElementById("modal-reserve-name")?.value;
            const phone = document.getElementById("modal-reserve-phone")?.value;
            const qty = parseInt(document.getElementById("modal-reserve-qty")?.value || "1");

            try {
              const res = await ApiClient.post("/pharmacy/reserve", {
                medicine_id: medId,
                pharmacy_id: phId,
                quantity: qty,
                patient_name: name,
                patient_phone: phone
              });

              Toast.success(`Reserved! Pickup Token: ${res.reservation_token}`);
              return true;
            } catch (err) {
              Toast.error(err.message || "Failed to reserve");
              return false;
            }
          }
        });
      });
    });
  }
};
