/**
 * MEDI-LINK Blood Services View
 * Voluntary blood donor registration, emergency blood request submission,
 * and certified blood bank unit availability.
 */

import { ApiClient } from "../api.js";
import { Modal } from "../components/modal.js";
import { Toast } from "../components/toast.js";

export const BloodView = {
  requests: [],
  stock: {},

  async render() {
    return `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-3xl">🩸</span>
              <h1 class="text-3xl font-extrabold text-slate-900">Blood Bank & Donation Services</h1>
            </div>
            <p class="text-slate-500 text-sm">
              Connecting voluntary life-saving blood donors with emergency trauma and surgical needs in your city.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="blood-request-open-btn" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-500/20 transition flex items-center gap-1.5">
              <span>🚨</span> Request Blood
            </button>
            <button id="blood-donor-register-btn" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition">
              Register as Donor
            </button>
          </div>
        </div>

        <!-- Regional Stock Units Grid -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700">Regional Blood Bank Units (Demo Feed)</h3>
            <span class="text-[11px] text-slate-400">Sync: 10 mins ago</span>
          </div>

          <div id="blood-stock-container" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <!-- Populated via JS -->
            <div class="p-3 bg-slate-50 rounded-xl text-center">Loading units...</div>
          </div>
        </div>

        <!-- Active Emergency Blood Requests -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900">Active Emergency Blood Requirements</h2>
          <div id="blood-requests-container" class="space-y-3">
            <div class="text-center py-10 text-slate-400">Loading active requests...</div>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.loadData();

    document.getElementById("blood-donor-register-btn")?.addEventListener("click", () => {
      Modal.open({
        title: "Voluntary Blood Donor Registration",
        confirmText: "Submit Donor Pledge",
        contentHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Donor Name *</label>
              <input type="text" id="bd-name" value="Rajesh Kumar" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Group *</label>
                <select id="bd-group" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold">
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Age (18-65) *</label>
                <input type="number" id="bd-age" value="28" min="18" max="65" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Gender *</label>
                <select id="bd-gender" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                <input type="text" id="bd-city" value="Hyderabad" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Mobile Contact *</label>
              <input type="tel" id="bd-phone" value="+919876543210" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
            </div>
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
              ✓ I declare that I am medically healthy, above 50 kg weight, and have not donated blood in the past 90 days.
            </div>
          </div>
        `,
        onConfirm: async () => {
          const name = document.getElementById("bd-name")?.value;
          const group = document.getElementById("bd-group")?.value;
          const age = parseInt(document.getElementById("bd-age")?.value || "25");
          const gender = document.getElementById("bd-gender")?.value;
          const city = document.getElementById("bd-city")?.value;
          const mobile = document.getElementById("bd-phone")?.value;

          try {
            await ApiClient.post("/blood/donors", {
              name,
              blood_group: group,
              age,
              gender,
              city,
              mobile,
              medical_declaration: true
            });
            Toast.success("You are registered as a life-saving blood donor!");
            return true;
          } catch (err) {
            Toast.error(err.message || "Failed to register donor");
            return false;
          }
        }
      });
    });

    document.getElementById("blood-request-open-btn")?.addEventListener("click", () => {
      Modal.open({
        title: "Submit Emergency Blood Requirement",
        isDestructive: true,
        confirmText: "Broadcast Urgent Request",
        contentHtml: `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Patient Name *</label>
              <input type="text" id="br-patient" placeholder="e.g. Ramesh Chandra" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Blood Group Needed *</label>
                <select id="br-group" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold">
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Units (Bags) *</label>
                <input type="number" id="br-units" value="2" min="1" max="10" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Hospital Name *</label>
                <input type="text" id="br-hospital" value="City General Hospital" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Urgency Level *</label>
                <select id="br-urgency" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-red-600">
                  <option value="CRITICAL">Critical &bull; Needed Immediately</option>
                  <option value="URGENT">Urgent &bull; Within 4 Hours</option>
                  <option value="SCHEDULED">Scheduled Surgery</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Attendant *</label>
                <input type="text" id="br-contact" placeholder="Name of relative" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Attendant Phone *</label>
                <input type="tel" id="br-phone" placeholder="+91 98765 00000" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Clinical Notes</label>
              <input type="text" id="br-notes" placeholder="e.g. ICU cardiac procedure scheduled" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
            </div>
          </div>
        `,
        onConfirm: async () => {
          const patient_name = document.getElementById("br-patient")?.value;
          const blood_group = document.getElementById("br-group")?.value;
          const units_needed = parseInt(document.getElementById("br-units")?.value || "2");
          const hospital_name = document.getElementById("br-hospital")?.value;
          const urgency = document.getElementById("br-urgency")?.value;
          const contact_name = document.getElementById("br-contact")?.value;
          const contact_mobile = document.getElementById("br-phone")?.value;
          const notes = document.getElementById("br-notes")?.value;

          if (!patient_name || !contact_mobile) {
            Toast.warning("Please fill in patient name and contact phone.");
            return false;
          }

          try {
            await ApiClient.post("/blood/requests", {
              patient_name,
              blood_group,
              units_needed,
              hospital_name,
              city: "Hyderabad",
              urgency,
              contact_name,
              contact_mobile,
              notes
            });
            Toast.success("Urgent blood broadcast dispatched to regional network!");
            await BloodView.loadData();
            return true;
          } catch (err) {
            Toast.error(err.message || "Failed to submit request");
            return false;
          }
        }
      });
    });
  },

  async loadData() {
    try {
      const [stock, reqs] = await Promise.all([
        ApiClient.get("/blood/stock"),
        ApiClient.get("/blood/requests")
      ]);
      this.stock = stock || {};
      this.requests = reqs || [];

      // Render stock
      const stockContainer = document.getElementById("blood-stock-container");
      if (stockContainer) {
        stockContainer.innerHTML = Object.entries(this.stock).map(([grp, info]) => `
          <div class="p-3 rounded-2xl ${info.status.includes('CRITICAL') ? 'bg-red-50 border-2 border-red-300' : 'bg-slate-50 border border-slate-200'} text-center space-y-0.5">
            <span class="text-base font-black text-slate-800">${grp}</span>
            <div class="text-xl font-black ${info.status.includes('CRITICAL') ? 'text-red-700' : 'text-emerald-700'}">${info.units}</div>
            <span class="text-[9px] uppercase font-bold text-slate-400 block">${info.status.replace('_', ' ')}</span>
          </div>
        `).join('');
      }

      // Render requests
      const reqContainer = document.getElementById("blood-requests-container");
      if (reqContainer) {
        if (this.requests.length === 0) {
          reqContainer.innerHTML = `<p class="text-sm text-slate-400 py-6 text-center">No active emergency blood requests.</p>`;
          return;
        }

        reqContainer.innerHTML = this.requests.map(r => `
          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-red-100 text-red-700 font-black text-xl flex items-center justify-center border border-red-200 shrink-0">
                ${r.blood_group}
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-bold text-slate-900">${r.patient_name} (${r.units_needed} Units)</h4>
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    r.urgency === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900'
                  }">${r.urgency}</span>
                </div>
                <p class="text-xs text-slate-500">🏥 ${r.hospital_name}, ${r.city} &bull; Attendant: <strong>${r.contact_name}</strong></p>
                ${r.notes ? `<p class="text-[11px] text-slate-600">${r.notes}</p>` : ''}
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                ● ${r.status}
              </span>
              <a href="tel:${r.contact_mobile}" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition">
                Call Attendant
              </a>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.warn("Failed to load blood data:", e);
    }
  }
};
