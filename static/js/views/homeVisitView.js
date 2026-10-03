/**
 * MEDI-LINK Home Doctor Visit View
 * Dedicated booking flow for bedside clinical visits by registered practitioners,
 * RMP family doctors, and Ayurvedic Vaidyas for senior citizens and bedridden patients.
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const HomeVisitView = {
  doctors: [],

  async render(queryParams = {}) {
    const prefillDocId = queryParams.doctor_id || "";

    return `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
            <span>🏠 Bedside Care at Your Doorstep</span>
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900">Book a Doctor Home Visit</h1>
          <p class="text-slate-600 text-sm leading-relaxed max-w-2xl">
            Designed for elderly parents, immobile patients, post-surgical recovery, or acute fevers. Verified Registered Medical Practitioners (RMPs), General Physicians, and Ayurvedic Vaidyas visit your home.
          </p>
        </div>

        <!-- Home Visit Form Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          
          <form id="home-visit-form" class="space-y-5">
            
            <!-- Step 1: Patient Locality & City -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Locality / Area *</label>
                <input type="text" id="hv-location" value="Hyderabad, Banjara Hills" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Health Problem Category *</label>
                <select id="hv-category" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
                  <option value="General Acute Viral / High Fever">General Acute Viral / High Fever</option>
                  <option value="Elderly Bedridden Routine Checkup">Elderly Bedridden Routine Checkup</option>
                  <option value="Ayurvedic Joint Pain & Mobility">Ayurvedic Joint Pain & Mobility</option>
                  <option value="Pediatric Home Consultation">Pediatric Home Consultation</option>
                  <option value="Post-Surgical Dressing & Vitals">Post-Surgical Dressing & Vitals</option>
                </select>
              </div>
            </div>

            <!-- Step 2: Select Home Visit Doctor -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-2">Select Verified Home Visit Practitioner *</label>
              <div id="hv-doctors-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">Loading available home visit doctors...</div>
              </div>
            </div>

            <!-- Step 3: Date & Slot -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Preferred Visit Date *</label>
                <input type="date" id="hv-date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Preferred Time Window *</label>
                <select id="hv-slot" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
                  <option value="11:00 AM - 12:30 PM">Morning: 11:00 AM - 12:30 PM</option>
                  <option value="03:00 PM - 04:30 PM">Afternoon: 03:00 PM - 04:30 PM</option>
                  <option value="06:00 PM - 07:30 PM">Evening: 06:00 PM - 07:30 PM</option>
                </select>
              </div>
            </div>

            <!-- Step 4: Patient Details & Home Address -->
            <div class="space-y-4 pt-2 border-t border-slate-100">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Patient Name *</label>
                  <input type="text" id="hv-pat-name" value="Rajesh Kumar" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" />
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone *</label>
                  <input type="tel" id="hv-pat-phone" value="+919876543210" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Complete Home Address & Landmark *</label>
                <textarea id="hv-address" rows="2" placeholder="House / Flat number, Apartment name, Street, Landmark, Pincode" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" required>Flat 302, Green Meadows, Banjara Hills Road No. 12, Near Care Hospital</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Symptoms & Clinical Notes for Doctor</label>
                <input type="text" id="hv-notes" placeholder="e.g. 82-year-old patient with severe knee pain, difficulty walking down stairs" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div class="text-xs text-slate-500">
                Doctor arrival confirmed via SMS & tracking link
              </div>
              <button type="submit" id="hv-submit-btn" class="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2">
                <span>Confirm Home Doctor Visit</span>
                <span>&rarr;</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    `;
  },

  async attachEvents(queryParams = {}) {
    const prefillDocId = queryParams.doctor_id || "";

    try {
      const docs = await ApiClient.get("/doctors", { home_visit: true });
      this.doctors = docs || [];

      const docContainer = document.getElementById("hv-doctors-list");
      if (docContainer) {
        docContainer.innerHTML = this.doctors.map((d, idx) => `
          <label class="p-3.5 rounded-2xl border ${prefillDocId === d.id || (!prefillDocId && idx === 0) ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-400' : 'border-slate-200'} cursor-pointer transition flex items-center gap-3">
            <input type="radio" name="hv-selected-doc" value="${d.id}" data-name="${d.name}" data-dept="${d.department}" data-fac="${d.facility_id}" data-facname="${d.facility_name}" ${prefillDocId === d.id || (!prefillDocId && idx === 0) ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
            <img src="${d.image_url}" class="w-12 h-12 rounded-xl object-cover border border-slate-200" />
            <div>
              <h4 class="text-sm font-bold text-slate-900">${d.name}</h4>
              <p class="text-xs text-emerald-700 font-semibold">${d.specialty}</p>
              <p class="text-[11px] text-slate-500">Home Visit Fee: ₹${d.fee + 150}</p>
            </div>
          </label>
        `).join('');

        // Listen for clicks to style active radio
        docContainer.querySelectorAll("input[type='radio']").forEach(radio => {
          radio.addEventListener("change", () => {
            docContainer.querySelectorAll("label").forEach(lbl => {
              lbl.className = "p-3.5 rounded-2xl border border-slate-200 cursor-pointer transition flex items-center gap-3";
            });
            radio.closest("label").className = "p-3.5 rounded-2xl border border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-400 cursor-pointer transition flex items-center gap-3";
          });
        });
      }
    } catch (e) {
      console.warn("Failed to load home visit doctors:", e);
    }

    // Form submit
    const form = document.getElementById("home-visit-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const selectedRadio = document.querySelector("input[name='hv-selected-doc']:checked");
        if (!selectedRadio) {
          Toast.warning("Please select a home visit doctor.");
          return;
        }

        const doctor_id = selectedRadio.value;
        const doctor_name = selectedRadio.getAttribute("data-name");
        const department = selectedRadio.getAttribute("data-dept");
        const facility_id = selectedRadio.getAttribute("data-fac");
        const facility_name = selectedRadio.getAttribute("data-facname");

        const date = document.getElementById("hv-date")?.value;
        const time_slot = document.getElementById("hv-slot")?.value;
        const patient_name = document.getElementById("hv-pat-name")?.value;
        const patient_mobile = document.getElementById("hv-pat-phone")?.value;
        const home_address = document.getElementById("hv-address")?.value;
        const symptoms = document.getElementById("hv-notes")?.value;

        try {
          const res = await ApiClient.post("/appointments", {
            doctor_id,
            doctor_name,
            facility_id,
            facility_name,
            department,
            appointment_type: "home_visit",
            date,
            time_slot,
            patient_name,
            patient_mobile,
            home_address,
            symptoms: symptoms || "Home consultation requested"
          });

          Toast.success(`Home visit confirmed with ${doctor_name}! ID: ${res.id}`);
          window.location.hash = "#/appointments";
        } catch (err) {
          Toast.error(err.message || "Failed to book home visit");
        }
      });
    }
  }
};
