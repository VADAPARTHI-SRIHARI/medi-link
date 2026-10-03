/**
 * MEDI-LINK Hospital Staff & Clinical Administration Portal
 * Features:
 * - Live OPD Queue Control: call next token, broadcast emergency delays
 * - Manage incoming patient visits and update statuses: WAITING → IN_PROGRESS → COMPLETED
 * - Emergency room triage monitor
 */

import { ApiClient } from "../api.js";
import { store } from "../config.js";
import { Toast } from "../components/toast.js";

export const StaffDashboardView = {
  queue: null,
  appointments: [],

  async render() {
    const user = store.get().user || {
      name: "Priya Sharma",
      role: "staff",
      hospital_affiliation: "City General Hospital",
      department: "OPD Front Desk & Queue"
    };

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800">
                Staff Console: <span class="text-sky-600">${user.name}</span>
              </h1>
              <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">Staff Admin</span>
            </div>
            <p class="text-slate-500 text-sm">
              🏥 <strong>${user.hospital_affiliation || 'City General Hospital'}</strong> &bull; Dept: <strong>${user.department || 'Cardiology OPD'}</strong>
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="staff-refresh-btn" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
              🔄 Refresh List
            </button>
            <a href="#/queue" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition">
              Patient Queue View &rarr;
            </a>
          </div>
        </div>

        <!-- OPD Queue Command Center -->
        <div class="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-xs text-sky-400 uppercase font-black tracking-wider block">OPD Live Queue Dispatcher</span>
              <h2 class="text-2xl sm:text-3xl font-black">City General &bull; Cardiology Wing</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-xs font-bold text-emerald-400 uppercase">Calling Active</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span class="text-xs text-slate-300 font-semibold block uppercase">Currently Serving</span>
              <div id="staff-serving-token" class="text-4xl sm:text-5xl font-black text-emerald-400 my-1">OP-11</div>
              <span class="text-xs text-slate-300">In Doctor Cabin</span>
            </div>

            <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span class="text-xs text-slate-300 font-semibold block uppercase">Total Registered Tokens</span>
              <div class="text-4xl sm:text-5xl font-black text-sky-300 my-1">24</div>
              <span class="text-xs text-slate-300">13 Waiting in lobby</span>
            </div>

            <div class="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span class="text-xs text-slate-300 font-semibold block uppercase">Active Delay Status</span>
              <div id="staff-delay-display" class="text-2xl font-bold text-amber-300 my-2">10 mins</div>
              <span class="text-xs text-slate-300">Emergency ECG review</span>
            </div>
          </div>

          <!-- Queue Control Buttons -->
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <button id="staff-call-next-btn" class="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg transition flex items-center gap-2">
              <span>🔔</span>
              <span>Call Next Token</span>
            </button>
            <button id="staff-add-delay-btn" class="px-5 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2">
              <span>⚠️</span>
              <span>Broadcast 15m Delay</span>
            </button>
            <button id="staff-clear-delay-btn" class="px-4 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm transition">
              Clear Delay
            </button>
          </div>
        </div>

        <!-- Arriving Patients Management Table -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-900">Arriving & In-Clinic Patients</h3>
            <span class="text-xs text-slate-400 font-medium">Click buttons to update clinical workflow state</span>
          </div>

          <div id="staff-appts-table" class="space-y-3">
            <div class="text-center py-8 text-slate-400">Loading scheduled patients...</div>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.loadStaffData();

    document.getElementById("staff-refresh-btn")?.addEventListener("click", () => this.loadStaffData());

    document.getElementById("staff-call-next-btn")?.addEventListener("click", async () => {
      try {
        const res = await ApiClient.post("/queue/advance", {
          facility_id: "fac-hosp-01",
          department_id: "Cardiology",
          action: "next"
        });
        Toast.success(`Next Token Called: ${res.current_serving_token}`);
        const el = document.getElementById("staff-serving-token");
        if (el) el.textContent = res.current_serving_token;
      } catch (e) {
        Toast.error("Failed to advance queue");
      }
    });

    document.getElementById("staff-add-delay-btn")?.addEventListener("click", async () => {
      try {
        await ApiClient.post("/queue/advance", {
          facility_id: "fac-hosp-01",
          department_id: "Cardiology",
          action: "delay",
          delay_minutes: 15,
          delay_reason: "Consultant attending an urgent inpatient cardiac arrest code."
        });
        Toast.warning("Delay broadcasted to all patient devices.");
        const el = document.getElementById("staff-delay-display");
        if (el) el.textContent = "15 mins";
      } catch (e) {
        Toast.error("Failed to post delay");
      }
    });

    document.getElementById("staff-clear-delay-btn")?.addEventListener("click", async () => {
      try {
        await ApiClient.post("/queue/advance", {
          facility_id: "fac-hosp-01",
          department_id: "Cardiology",
          action: "delay",
          delay_minutes: 0,
          delay_reason: ""
        });
        Toast.info("Delay cleared.");
        const el = document.getElementById("staff-delay-display");
        if (el) el.textContent = "On Time";
      } catch (e) {
        Toast.error("Failed to clear delay");
      }
    });
  },

  async loadStaffData() {
    try {
      const [q, appts] = await Promise.all([
        ApiClient.get("/queue/status", { facility_id: "fac-hosp-01", department: "Cardiology" }),
        ApiClient.get("/appointments")
      ]);
      this.queue = q;
      this.appointments = appts || [];

      const tokenEl = document.getElementById("staff-serving-token");
      if (tokenEl && q) tokenEl.textContent = q.current_serving_token;

      const delayEl = document.getElementById("staff-delay-display");
      if (delayEl && q) delayEl.textContent = q.delay_minutes > 0 ? `${q.delay_minutes} mins` : "On Time";

      const table = document.getElementById("staff-appts-table");
      if (table) {
        table.innerHTML = this.appointments.map(a => `
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-900">${a.patient_name}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  a.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                  a.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                }">${a.status}</span>
                <span class="font-mono font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-slate-200">Token: ${a.queue_token || 'N/A'}</span>
              </div>
              <p class="text-slate-500">
                Doctor: <strong>${a.doctor_name}</strong> &bull; Slot: ${a.time_slot} &bull; Phone: ${a.patient_mobile}
              </p>
              <p class="text-slate-600 italic">Concern: ${a.symptoms || 'General clinical review'}</p>
            </div>

            <!-- Staff Status Action Buttons -->
            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
              <button class="staff-status-btn px-2.5 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-[11px] hover:bg-sky-700 transition" data-id="${a.id}" data-status="WAITING">
                In Waiting
              </button>
              <button class="staff-status-btn px-2.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition" data-id="${a.id}" data-status="IN_PROGRESS">
                In Cabin
              </button>
              <button class="staff-status-btn px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition" data-id="${a.id}" data-status="COMPLETED">
                Complete
              </button>
            </div>
          </div>
        `).join('');

        table.querySelectorAll(".staff-status-btn").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            const newStatus = e.target.getAttribute("data-status");

            try {
              await ApiClient.patch(`/appointments/${id}/status`, {
                status: newStatus,
                notes: `Status updated by OPD receptionist to ${newStatus}`
              });
              Toast.success(`Patient marked as ${newStatus}`);
              await StaffDashboardView.loadStaffData();
            } catch (err) {
              Toast.error(err.message || "Failed to update status");
            }
          });
        });
      }
    } catch (e) {
      console.warn("Failed to load staff data:", e);
    }
  }
};
