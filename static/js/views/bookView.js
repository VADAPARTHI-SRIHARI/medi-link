/**
 * MEDI-LINK 7-Step Interactive Booking Wizard
 * Flow: Provider/Hospital → Department → Doctor → Date → Available Slot → Eligibility Check → Review & Confirm.
 */

import { ApiClient } from "../api.js";
import { store } from "../config.js";
import { Toast } from "../components/toast.js";

export const BookView = {
  currentStep: 1,
  facilities: [],
  doctors: [],
  bookingData: {
    facility_id: "",
    facility_name: "",
    facility_type: "",
    department: "",
    doctor_id: "",
    doctor_name: "",
    appointment_type: "doctor",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time_slot: "10:30 AM - 11:00 AM",
    patient_name: "",
    patient_mobile: "",
    symptoms: "",
    reason: "",
    home_address: "",
    is_elderly: false,
    wheelchair_needed: false
  },

  async render(queryParams = {}) {
    const user = store.get().user;
    if (user) {
      this.bookingData.patient_name = user.name || "";
      this.bookingData.patient_mobile = user.mobile || "";
    }

    if (queryParams.doctor_id) this.bookingData.doctor_id = queryParams.doctor_id;
    if (queryParams.facility_id) this.bookingData.facility_id = queryParams.facility_id;
    if (queryParams.department) this.bookingData.department = decodeURIComponent(queryParams.department);
    if (queryParams.appointment_type) this.bookingData.appointment_type = queryParams.appointment_type;

    return `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header & Stepper -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-extrabold text-slate-900">Book Care Appointment</h1>
            <span class="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              7-Step Clinical Workflow
            </span>
          </div>

          <!-- Stepper Progress Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
              <span class="${this.currentStep >= 1 ? 'text-sky-600' : ''}">1. Facility</span>
              <span class="${this.currentStep >= 2 ? 'text-sky-600' : ''}">2. Dept</span>
              <span class="${this.currentStep >= 3 ? 'text-sky-600' : ''}">3. Doctor</span>
              <span class="${this.currentStep >= 4 ? 'text-sky-600' : ''}">4. Date</span>
              <span class="${this.currentStep >= 5 ? 'text-sky-600' : ''}">5. Slot</span>
              <span class="${this.currentStep >= 6 ? 'text-sky-600' : ''}">6. Eligibility</span>
              <span class="${this.currentStep >= 7 ? 'text-sky-600' : ''}">7. Confirm</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div id="booking-progress-bar" class="h-full bg-sky-600 transition-all duration-300" style="width: ${(this.currentStep / 7) * 100}%"></div>
            </div>
          </div>
        </div>

        <!-- Wizard Step Container -->
        <div id="wizard-step-container" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div class="text-center py-10">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></span>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents(queryParams = {}) {
    try {
      const [facs, docs] = await Promise.all([
        ApiClient.get("/hospitals"),
        ApiClient.get("/doctors")
      ]);
      this.facilities = facs || [];
      this.doctors = docs || [];

      // If prefilled params exist, advance intelligently
      if (this.bookingData.facility_id && this.bookingData.doctor_id) {
        const d = this.doctors.find(x => x.id === this.bookingData.doctor_id);
        const f = this.facilities.find(x => x.id === this.bookingData.facility_id);
        if (d) this.bookingData.doctor_name = d.name;
        if (f) this.bookingData.facility_name = f.name;
        this.currentStep = 4; // Skip straight to Date picker
      }

      this.renderCurrentStep();
    } catch (e) {
      Toast.error("Failed to load booking parameters");
    }
  },

  renderCurrentStep() {
    const container = document.getElementById("wizard-step-container");
    const bar = document.getElementById("booking-progress-bar");
    if (bar) bar.style.width = `${(this.currentStep / 7) * 100}%`;
    if (!container) return;

    if (this.currentStep === 1) {
      // Step 1: Select Facility / Provider Tier
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 1: Choose Facility or Care Tier</h2>
            <p class="text-xs text-slate-500">Select an accredited multi-speciality hospital, local community clinic, RMP family clinic, or Ayurvedic centre.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${this.facilities.map(fac => `
              <div class="facility-choice-card p-4 rounded-2xl border ${this.bookingData.facility_id === fac.id ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-400' : 'border-slate-200 hover:border-sky-300'} cursor-pointer transition flex items-start gap-3" data-id="${fac.id}" data-name="${fac.name}" data-type="${fac.type}">
                <img src="${fac.image_url}" class="w-14 h-14 rounded-xl object-cover" />
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold uppercase text-sky-800">${fac.type.replace('_', ' ')}</span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 leading-snug">${fac.name}</h4>
                  <p class="text-xs text-slate-500">📍 ${fac.address}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button id="step-1-next-btn" class="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition" ${!this.bookingData.facility_id ? 'disabled class="px-6 py-3 rounded-xl bg-slate-300 text-slate-500 font-bold text-sm cursor-not-allowed"' : ''}>
              Next: Select Department &rarr;
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll(".facility-choice-card").forEach(card => {
        card.addEventListener("click", () => {
          this.bookingData.facility_id = card.getAttribute("data-id");
          this.bookingData.facility_name = card.getAttribute("data-name");
          this.bookingData.facility_type = card.getAttribute("data-type");
          this.renderCurrentStep();
        });
      });

      const nextBtn = document.getElementById("step-1-next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (!this.bookingData.facility_id) {
            Toast.warning("Please choose a facility to proceed.");
            return;
          }
          this.currentStep = 2;
          this.renderCurrentStep();
        });
      }

    } else if (this.currentStep === 2) {
      // Step 2: Select Department
      const fac = this.facilities.find(f => f.id === this.bookingData.facility_id);
      const depts = fac ? fac.department_list : ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Ayurvedic Medicine"];

      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 2: Select Clinical Department</h2>
            <p class="text-xs text-slate-500">At <strong>${this.bookingData.facility_name}</strong></p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${depts.map(dept => `
              <button class="dept-choice-btn p-4 rounded-2xl border text-left transition ${this.bookingData.department === dept ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-400 font-bold' : 'border-slate-200 text-slate-700 hover:border-sky-300 font-medium'}" data-dept="${dept}">
                <span class="text-2xl block mb-1">🩺</span>
                <span class="text-sm">${dept}</span>
              </button>
            `).join('')}
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="step-back-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50">&larr; Back</button>
            <button id="step-2-next-btn" class="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition">
              Next: Select Doctor &rarr;
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll(".dept-choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.bookingData.department = btn.getAttribute("data-dept");
          this.renderCurrentStep();
        });
      });

      document.getElementById("step-back-btn")?.addEventListener("click", () => { this.currentStep = 1; this.renderCurrentStep(); });
      document.getElementById("step-2-next-btn")?.addEventListener("click", () => {
        if (!this.bookingData.department) {
          Toast.warning("Please choose a department.");
          return;
        }
        this.currentStep = 3;
        this.renderCurrentStep();
      });

    } else if (this.currentStep === 3) {
      // Step 3: Choose Doctor
      const filteredDocs = this.doctors.filter(d => 
        (d.facility_id === this.bookingData.facility_id) || 
        (d.department.toLowerCase().includes(this.bookingData.department.toLowerCase()))
      );

      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 3: Select Practitioner</h2>
            <p class="text-xs text-slate-500">Practicing in <strong>${this.bookingData.department}</strong></p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${filteredDocs.length > 0 ? filteredDocs.map(doc => `
              <div class="doc-choice-card p-4 rounded-2xl border ${this.bookingData.doctor_id === doc.id ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-400' : 'border-slate-200 hover:border-sky-300'} cursor-pointer transition flex items-center gap-3" data-id="${doc.id}" data-name="${doc.name}">
                <img src="${doc.image_url}" class="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h4 class="text-sm font-bold text-slate-900">${doc.name}</h4>
                  <p class="text-xs text-sky-700 font-medium">${doc.specialty}</p>
                  <p class="text-[11px] text-slate-500">Exp: ${doc.experience_years}y &bull; Fee: ₹${doc.fee}</p>
                </div>
              </div>
            `).join('') : `
              <div class="col-span-2 p-6 bg-slate-50 rounded-2xl text-center text-slate-500">
                <p>No specific doctor assigned to this filter. Medi-Link will assign the On-Duty Duty Medical Officer.</p>
              </div>
            `}
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="step-back-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50">&larr; Back</button>
            <button id="step-3-next-btn" class="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition">
              Next: Select Date &rarr;
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll(".doc-choice-card").forEach(card => {
        card.addEventListener("click", () => {
          this.bookingData.doctor_id = card.getAttribute("data-id");
          this.bookingData.doctor_name = card.getAttribute("data-name");
          this.renderCurrentStep();
        });
      });

      document.getElementById("step-back-btn")?.addEventListener("click", () => { this.currentStep = 2; this.renderCurrentStep(); });
      document.getElementById("step-3-next-btn")?.addEventListener("click", () => {
        if (!this.bookingData.doctor_name) {
          this.bookingData.doctor_name = "Assigned Department Consultant";
        }
        this.currentStep = 4;
        this.renderCurrentStep();
      });

    } else if (this.currentStep === 4) {
      // Step 4: Pick Date
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 4: Select Appointment Date</h2>
            <p class="text-xs text-slate-500">Consultation with <strong>${this.bookingData.doctor_name}</strong></p>
          </div>

          <div class="max-w-md space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Appointment Date *</label>
              <input 
                type="date" 
                id="booking-date-input" 
                min="${today}"
                value="${this.bookingData.date}" 
                class="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800 text-base focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div class="flex gap-2">
              <button class="date-quick-btn px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-xs font-bold text-slate-700" data-date="${today}">Today</button>
              <button class="date-quick-btn px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-xs font-bold text-slate-700" data-date="${tomorrow}">Tomorrow</button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="step-back-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50">&larr; Back</button>
            <button id="step-4-next-btn" class="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition">
              Next: Select Time Slot &rarr;
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll(".date-quick-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.bookingData.date = btn.getAttribute("data-date");
          const inp = document.getElementById("booking-date-input");
          if (inp) inp.value = this.bookingData.date;
        });
      });

      document.getElementById("step-back-btn")?.addEventListener("click", () => { this.currentStep = 3; this.renderCurrentStep(); });
      document.getElementById("step-4-next-btn")?.addEventListener("click", () => {
        const inp = document.getElementById("booking-date-input");
        if (inp && inp.value) this.bookingData.date = inp.value;
        this.currentStep = 5;
        this.renderCurrentStep();
      });

    } else if (this.currentStep === 5) {
      // Step 5: Select Slot
      const slots = [
        "09:30 AM - 10:00 AM",
        "10:00 AM - 10:30 AM",
        "10:30 AM - 11:00 AM",
        "11:30 AM - 12:00 PM",
        "04:00 PM - 04:30 PM",
        "05:00 PM - 05:30 PM",
        "06:00 PM - 06:30 PM"
      ];

      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 5: Pick Available Time Slot</h2>
            <p class="text-xs text-slate-500">Date: <strong>${this.bookingData.date}</strong> &bull; Tokens generated automatically</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${slots.map(slot => `
              <button class="slot-choice-btn p-3.5 rounded-xl border text-center transition ${this.bookingData.time_slot === slot ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold ring-2 ring-sky-400' : 'border-slate-200 text-slate-700 hover:border-sky-300 font-medium'}" data-slot="${slot}">
                ⏰ ${slot}
              </button>
            `).join('')}
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="step-back-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50">&larr; Back</button>
            <button id="step-5-next-btn" class="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition">
              Next: Eligibility & Details &rarr;
            </button>
          </div>
        </div>
      `;

      container.querySelectorAll(".slot-choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.bookingData.time_slot = btn.getAttribute("data-slot");
          this.renderCurrentStep();
        });
      });

      document.getElementById("step-back-btn")?.addEventListener("click", () => { this.currentStep = 4; this.renderCurrentStep(); });
      document.getElementById("step-5-next-btn")?.addEventListener("click", () => {
        this.currentStep = 6;
        this.renderCurrentStep();
      });

    } else if (this.currentStep === 6) {
      // Step 6: Eligibility Check & Details
      const isHome = this.bookingData.appointment_type === "home_visit";

      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 6: Patient Details & Eligibility Check</h2>
            <p class="text-xs text-slate-500">Provide clinical context and accessibility requirements.</p>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Patient Name *</label>
                <input type="text" id="bk-pat-name" value="${this.bookingData.patient_name}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Mobile Number *</label>
                <input type="tel" id="bk-pat-mobile" value="${this.bookingData.patient_mobile}" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Main Health Concern / Symptoms *</label>
              <textarea id="bk-symptoms" rows="2" placeholder="e.g. Mild chest pain during walking, or routine checkup" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">${this.bookingData.symptoms}</textarea>
            </div>

            ${isHome ? `
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Patient Home Address for Doctor Visit *</label>
                <textarea id="bk-home-address" rows="2" placeholder="House/Flat No, Landmark, Locality, Pincode" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">${this.bookingData.home_address}</textarea>
              </div>
            ` : ''}

            <!-- Accessibility & Eligibility Checklist -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span class="text-xs font-bold uppercase text-slate-700 block">Accessibility & Special Assistance:</span>
              <label class="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                <input type="checkbox" id="bk-elderly" ${this.bookingData.is_elderly ? 'checked' : ''} class="w-4 h-4 rounded text-sky-600" />
                <span>Patient is senior citizen (Age 60+) &mdash; Request ground floor / priority escort</span>
              </label>
              <label class="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                <input type="checkbox" id="bk-wheelchair" ${this.bookingData.wheelchair_needed ? 'checked' : ''} class="w-4 h-4 rounded text-sky-600" />
                <span>Wheelchair assistance needed upon hospital arrival</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="step-back-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50">&larr; Back</button>
            <button id="step-6-next-btn" class="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition">
              Review & Confirm &rarr;
            </button>
          </div>
        </div>
      `;

      document.getElementById("step-back-btn")?.addEventListener("click", () => { this.currentStep = 5; this.renderCurrentStep(); });
      document.getElementById("step-6-next-btn")?.addEventListener("click", () => {
        this.bookingData.patient_name = document.getElementById("bk-pat-name")?.value.trim() || "Patient";
        this.bookingData.patient_mobile = document.getElementById("bk-pat-mobile")?.value.trim() || "+919876543210";
        this.bookingData.symptoms = document.getElementById("bk-symptoms")?.value.trim() || "";
        this.bookingData.is_elderly = document.getElementById("bk-elderly")?.checked || false;
        this.bookingData.wheelchair_needed = document.getElementById("bk-wheelchair")?.checked || false;
        const addrInp = document.getElementById("bk-home-address");
        if (addrInp) this.bookingData.home_address = addrInp.value.trim();

        this.currentStep = 7;
        this.renderCurrentStep();
      });

    } else if (this.currentStep === 7) {
      // Step 7: Review & Confirm
      container.innerHTML = `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-xl font-bold text-slate-900">Step 7: Review & Confirm Booking</h2>
            <p class="text-xs text-slate-500">Please verify your clinical visit summary before issuing the appointment ID.</p>
          </div>

          <div class="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 space-y-4 text-sm text-slate-700">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-sky-100">
              <div>
                <span class="text-xs text-slate-400 font-bold uppercase block">Provider / Doctor:</span>
                <strong class="text-slate-900 text-base">${this.bookingData.doctor_name}</strong>
                <p class="text-xs text-sky-700 font-medium">${this.bookingData.department}</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 font-bold uppercase block">Facility / Location:</span>
                <strong class="text-slate-900 text-base">${this.bookingData.facility_name}</strong>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-3 bg-white rounded-xl border border-sky-100">
                <span class="text-[11px] text-slate-400 font-semibold block">Date</span>
                <strong class="text-slate-800">${this.bookingData.date}</strong>
              </div>
              <div class="p-3 bg-white rounded-xl border border-sky-100">
                <span class="text-[11px] text-slate-400 font-semibold block">Time Slot</span>
                <strong class="text-slate-800">${this.bookingData.time_slot}</strong>
              </div>
              <div class="p-3 bg-white rounded-xl border border-sky-100">
                <span class="text-[11px] text-slate-400 font-semibold block">Patient</span>
                <strong class="text-slate-800">${this.bookingData.patient_name}</strong>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-white border border-sky-100 space-y-1 text-xs">
              <div><strong>Symptoms / Reason:</strong> ${this.bookingData.symptoms || 'General clinical consultation'}</div>
              ${this.bookingData.is_elderly ? '<div>♿ <strong>Assistance:</strong> Elderly priority escort requested</div>' : ''}
              ${this.bookingData.wheelchair_needed ? '<div>🦽 <strong>Wheelchair:</strong> Assistance requested at main entrance</div>' : ''}
              ${this.bookingData.home_address ? `<div>🏠 <strong>Home Address:</strong> ${this.bookingData.home_address}</div>` : ''}
            </div>

            <div class="text-[11px] text-slate-500">
              By confirming, a verified appointment token will be reserved in the OPD queue system.
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button id="step-back-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50">&larr; Back</button>
            <button id="step-confirm-btn" class="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2">
              <span id="confirm-spinner" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Confirm Appointment & Generate Token</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById("step-back-btn")?.addEventListener("click", () => { this.currentStep = 6; this.renderCurrentStep(); });
      
      const confirmBtn = document.getElementById("step-confirm-btn");
      confirmBtn?.addEventListener("click", async () => {
        confirmBtn.disabled = true;
        document.getElementById("confirm-spinner")?.classList.remove("hidden");

        try {
          const res = await ApiClient.post("/appointments", this.bookingData);
          Toast.success("Appointment Confirmed Successfully!");
          this.renderSuccessReceipt(res);
        } catch (err) {
          Toast.error(err.message || "Failed to create appointment");
          confirmBtn.disabled = false;
          document.getElementById("confirm-spinner")?.classList.add("hidden");
        }
      });
    }
  },

  renderSuccessReceipt(appt) {
    const container = document.getElementById("wizard-step-container");
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-6 space-y-6 animate-fade-in">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black">
          ✓
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Appointment Confirmed!</h2>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Appointment ID: <strong class="text-sky-700 font-mono text-base">${appt.id}</strong>
          </p>
        </div>

        <!-- Token Badge -->
        <div class="inline-block p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 shadow-md">
          <span class="text-xs font-bold uppercase text-sky-800 tracking-wider">Your OPD Queue Token</span>
          <div class="text-4xl sm:text-5xl font-black text-sky-900 tracking-tight my-1">${appt.queue_token}</div>
          <span class="text-xs font-bold text-emerald-600">● Status: ${appt.status}</span>
        </div>

        <!-- Receipt Details -->
        <div class="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700">
          <div>👨‍⚕️ <strong>Doctor:</strong> ${appt.doctor_name} (${appt.department})</div>
          <div>🏥 <strong>Facility:</strong> ${appt.facility_name}</div>
          <div>📅 <strong>Date & Time:</strong> ${appt.date} at ${appt.time_slot}</div>
          <div>📋 <strong>Preparation Instructions:</strong> ${appt.preparation_notes}</div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href="#/queue" class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition">
            Track Live Queue &rarr;
          </a>
          <a href="#/navigation?facility_id=${appt.facility_id}" class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition">
            Hospital Navigation Map
          </a>
          <a href="#/appointments" class="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition">
            View All Appointments
          </a>
        </div>
      </div>
    `;
  }
};
