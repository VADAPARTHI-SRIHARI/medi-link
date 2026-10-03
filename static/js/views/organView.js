/**
 * MEDI-LINK Organ Donation & Transplant Registry View
 * Voluntary organ donor pledges and transparent hospital-authorized waiting list requests.
 * Complies strictly with the Transplantation of Human Organs and Tissues Act (THOTA).
 */

import { ApiClient } from "../api.js";
import { Modal } from "../components/modal.js";
import { Toast } from "../components/toast.js";

export const OrganView = {
  requests: [],

  async render() {
    return `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-3xl">🫀</span>
              <h1 class="text-3xl font-extrabold text-slate-900">Organ Donation & Transplant Registry</h1>
            </div>
            <p class="text-slate-500 text-sm">
              Informed legal donor pledge registration and authorized hospital waiting list coordination.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="organ-pledge-btn" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition">
              + Pledge Organs as Donor
            </button>
            <button id="organ-request-btn" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition">
              Hospital Waiting List Request
            </button>
          </div>
        </div>

        <!-- Strict Legal & Safety Notice -->
        <div class="p-5 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2 text-xs leading-relaxed">
          <div class="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <span>⚖️</span>
            <span>National Regulatory Compliance (THOTA & NOTTO)</span>
          </div>
          <p>
            Under the Transplantation of Human Organs and Tissues Act, 1994 (amended 2011), the commercial sale or purchase of human organs is a punishable federal crime. Organ allocation in India is governed strictly on transparent clinical matching (HLA/ABO compatibility, waiting time, and medical urgency) verified by state and national authorization committees. Medi-Link acts solely as an educational and verified digital registry facilitator.
          </p>
        </div>

        <!-- Organs that can be pledged -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
            <span class="text-3xl">🫀</span>
            <div class="text-xs font-bold text-slate-800">Heart</div>
            <span class="text-[10px] text-slate-400">Post-humous</span>
          </div>
          <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
            <span class="text-3xl">🫘</span>
            <div class="text-xs font-bold text-slate-800">Kidneys (2)</div>
            <span class="text-[10px] text-slate-400">Living / Deceased</span>
          </div>
          <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
            <span class="text-3xl">🩸</span>
            <div class="text-xs font-bold text-slate-800">Liver</div>
            <span class="text-[10px] text-slate-400">Living / Deceased</span>
          </div>
          <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
            <span class="text-3xl">👁️</span>
            <div class="text-xs font-bold text-slate-800">Corneas (Eyes)</div>
            <span class="text-[10px] text-slate-400">Within 6h post-death</span>
          </div>
          <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
            <span class="text-3xl">🫁</span>
            <div class="text-xs font-bold text-slate-800">Lungs</div>
            <span class="text-[10px] text-slate-400">Deceased</span>
          </div>
          <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
            <span class="text-3xl">🧬</span>
            <div class="text-xs font-bold text-slate-800">Pancreas</div>
            <span class="text-[10px] text-slate-400">Deceased</span>
          </div>
        </div>

        <!-- Active Transplant Waiting Registry Entries -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-900">Hospital Transplant Waiting Registry Entries</h2>
            <span class="text-xs text-slate-400">NOTTO Aligned Verification</span>
          </div>

          <div id="organ-requests-container" class="space-y-3">
            <div class="text-center py-8 text-slate-400">Loading transplant list...</div>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchRequests();

    document.getElementById("organ-pledge-btn")?.addEventListener("click", () => {
      Modal.open({
        title: "Official Organ Donor Pledge",
        confirmText: "Submit Pledge & Consent",
        contentHtml: `
          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-700 mb-1">Full Legal Name *</label>
              <input type="text" id="op-name" value="Rajesh Kumar" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Mobile Contact *</label>
                <input type="tel" id="op-phone" value="+919876543210" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Email *</label>
                <input type="email" id="op-email" value="patient@medilink.com" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">City *</label>
                <input type="text" id="op-city" value="Hyderabad" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Age *</label>
                <input type="number" id="op-age" value="30" min="18" max="100" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>

            <!-- Organs Selection -->
            <div>
              <label class="block font-bold uppercase text-slate-700 mb-1">Select Organs you wish to pledge *</label>
              <div class="grid grid-cols-2 gap-2 text-slate-700">
                <label class="flex items-center gap-1.5"><input type="checkbox" name="op-organs" value="Kidneys" checked /> Kidneys</label>
                <label class="flex items-center gap-1.5"><input type="checkbox" name="op-organs" value="Liver" checked /> Liver</label>
                <label class="flex items-center gap-1.5"><input type="checkbox" name="op-organs" value="Heart" checked /> Heart</label>
                <label class="flex items-center gap-1.5"><input type="checkbox" name="op-organs" value="Cornea" checked /> Corneas (Eyes)</label>
                <label class="flex items-center gap-1.5"><input type="checkbox" name="op-organs" value="Lungs" /> Lungs</label>
                <label class="flex items-center gap-1.5"><input type="checkbox" name="op-organs" value="Pancreas" /> Pancreas</label>
              </div>
            </div>

            <!-- Emergency Family Contact -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Next of Kin / Relative *</label>
                <input type="text" id="op-kin-name" placeholder="Spouse / Parent Name" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Relative Contact Phone *</label>
                <input type="tel" id="op-kin-phone" placeholder="+91 98765 00000" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>

            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 leading-relaxed">
              ✓ I hereby express my wish that, after my death, my selected organs and tissues be used for transplantation to save lives. I have informed my family members about this decision.
            </div>
          </div>
        `,
        onConfirm: async () => {
          const full_name = document.getElementById("op-name")?.value;
          const mobile = document.getElementById("op-phone")?.value;
          const email = document.getElementById("op-email")?.value;
          const city = document.getElementById("op-city")?.value;
          const age = parseInt(document.getElementById("op-age")?.value || "25");
          const emergency_contact_name = document.getElementById("op-kin-name")?.value || "Family";
          const emergency_contact_phone = document.getElementById("op-kin-phone")?.value || mobile;

          const checkedOrgans = [];
          document.querySelectorAll("input[name='op-organs']:checked").forEach(cb => checkedOrgans.push(cb.value));

          if (checkedOrgans.length === 0) {
            Toast.warning("Please select at least one organ to pledge.");
            return false;
          }

          try {
            const res = await ApiClient.post("/organ/pledge", {
              full_name,
              mobile,
              email,
              city,
              age,
              pledged_organs: checkedOrgans,
              emergency_contact_name,
              emergency_contact_phone,
              consent_agreed: true
            });
            Toast.success(`Thank you! Your pledge has been registered. ID: ${res.pledge_id}`);
            return true;
          } catch (err) {
            Toast.error(err.message || "Failed to submit pledge");
            return false;
          }
        }
      });
    });

    document.getElementById("organ-request-btn")?.addEventListener("click", () => {
      Modal.open({
        title: "Transplant Waiting List Application",
        confirmText: "Submit Clinical Application",
        contentHtml: `
          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-bold uppercase text-slate-700 mb-1">Patient Full Name *</label>
              <input type="text" id="or-patient" placeholder="e.g. S. Narayana" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Organ Needed *</label>
                <select id="or-organ" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold">
                  <option value="Kidney">Kidney (Renal)</option>
                  <option value="Liver">Liver (Hepatic)</option>
                  <option value="Heart">Heart (Cardiac)</option>
                  <option value="Cornea">Cornea (Ophthalmic)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold uppercase text-slate-700 mb-1">Supervising Hospital *</label>
                <input type="text" id="or-hospital" value="City General Hospital" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
            <div>
              <label class="block font-bold uppercase text-slate-700 mb-1">Clinical Diagnosis / Physician Notes</label>
              <textarea id="or-notes" rows="2" placeholder="e.g. End-stage renal disease stage 5 on maintenance hemodialysis" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"></textarea>
            </div>
          </div>
        `,
        onConfirm: async () => {
          const patient_name = document.getElementById("or-patient")?.value;
          const organ_type = document.getElementById("or-organ")?.value;
          const hospital_name = document.getElementById("or-hospital")?.value;
          const notes = document.getElementById("or-notes")?.value;

          if (!patient_name) {
            Toast.warning("Please provide patient name.");
            return false;
          }

          try {
            const res = await ApiClient.post("/organ/requests", {
              patient_name,
              organ_type,
              hospital_name,
              city: "Hyderabad",
              urgency: "HIGH",
              notes
            });
            Toast.success(`Application Submitted. Reference: ${res.registry_ref}`);
            await OrganView.fetchRequests();
            return true;
          } catch (err) {
            Toast.error(err.message || "Failed to record request");
            return false;
          }
        }
      });
    });
  },

  async fetchRequests() {
    const container = document.getElementById("organ-requests-container");
    if (!container) return;

    try {
      const list = await ApiClient.get("/organ/requests");
      this.requests = list || [];

      if (list.length === 0) {
        container.innerHTML = `<p class="text-sm text-slate-400 py-6 text-center">No active transplant registry records.</p>`;
        return;
      }

      container.innerHTML = list.map(r => `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-900">${r.patient_name} &bull; Needs: <strong class="text-sky-700">${r.organ_type}</strong></span>
              <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">${r.status}</span>
            </div>
            <p class="text-slate-500">🏥 ${r.hospital_name}, ${r.city} &bull; Ref: <code class="font-mono text-slate-700">${r.registry_ref}</code></p>
            ${r.notes ? `<p class="text-slate-600 italic">${r.notes}</p>` : ''}
          </div>
          <div class="text-left sm:text-right">
            <span class="text-[10px] text-slate-400 block font-semibold">Allocated via NOTTO</span>
            <span class="text-emerald-700 font-bold">Standard Waiting List</span>
          </div>
        </div>
      `).join('');
    } catch (e) {
      container.innerHTML = `<div class="p-4 bg-red-50 text-red-800 rounded-xl text-xs">Failed to load registry list.</div>`;
    }
  }
};
