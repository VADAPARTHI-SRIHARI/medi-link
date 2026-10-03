/**
 * MEDI-LINK Live Queue & Waiting Time View
 * Real-time OPD and clinic token tracking, estimated waiting times,
 * delay broadcasts, and interactive token advance simulator.
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const QueueView = {
  queueData: null,
  pollTimer: null,

  async render(queryParams = {}) {
    const userToken = queryParams.token || "OP-14";

    return `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-3xl font-extrabold text-slate-900">Live OPD Queue Tracking</h1>
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <p class="text-slate-500 text-sm">
              Live token progression, estimated wait times, and emergency delay notifications.
            </p>
          </div>

          <!-- Token Switcher -->
          <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-400 font-bold uppercase">Token:</span>
            <input type="text" id="queue-token-input" value="${userToken}" class="w-20 font-black text-sky-800 text-sm border-none focus:outline-none" />
            <button id="queue-token-apply-btn" class="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition">Sync</button>
          </div>
        </div>

        <!-- Integration Notice Badge -->
        <div class="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs text-sky-900">
          <div class="flex items-center gap-2">
            <span class="text-base">📡</span>
            <span><strong>Integration Mode:</strong> Medi-Link Live OPD Queue Sync (Real-time Simulation Stream)</span>
          </div>
          <span class="px-2 py-0.5 rounded bg-sky-200 text-sky-800 font-bold text-[10px] uppercase">Active</span>
        </div>

        <!-- Live Queue Display Card -->
        <div id="queue-card-container" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div class="text-center py-12 text-slate-400">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Syncing OPD department queue stream...</p>
          </div>
        </div>

        <!-- Interactive Simulation Controls for Demo & Hospital Staff -->
        <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">⚙️</span>
              <h3 class="text-base font-bold">Interactive Queue Simulator</h3>
            </div>
            <span class="text-xs text-slate-400">Simulate hospital OPD desk actions</span>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            Test the live queue responsiveness! Advance to the next token, or simulate a doctor emergency delay to observe automatic wait time recalculation.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <button id="sim-next-token-btn" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
              <span>🔔</span>
              <span>Call Next Token</span>
            </button>
            <button id="sim-delay-btn" class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Broadcast 15-min Delay</span>
            </button>
            <button id="sim-reset-delay-btn" class="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition">
              Clear Delay
            </button>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents(queryParams = {}) {
    const token = queryParams.token || "OP-14";
    await this.fetchQueue(token);

    const applyBtn = document.getElementById("queue-token-apply-btn");
    const tokenInput = document.getElementById("queue-token-input");

    if (applyBtn && tokenInput) {
      applyBtn.addEventListener("click", () => {
        const val = tokenInput.value.trim();
        if (val) this.fetchQueue(val);
      });
    }

    // Simulation controls
    document.getElementById("sim-next-token-btn")?.addEventListener("click", async () => {
      try {
        await ApiClient.post("/queue/advance", {
          facility_id: "fac-hosp-01",
          department_id: "Cardiology",
          action: "next"
        });
        Toast.success("Next token called by OPD desk.");
        await this.fetchQueue(tokenInput?.value || "OP-14");
      } catch (err) {
        Toast.error("Failed to advance queue");
      }
    });

    document.getElementById("sim-delay-btn")?.addEventListener("click", async () => {
      try {
        await ApiClient.post("/queue/advance", {
          facility_id: "fac-hosp-01",
          department_id: "Cardiology",
          action: "delay",
          delay_minutes: 15,
          delay_reason: "Consultant attending an urgent ICU code alert."
        });
        Toast.warning("15-minute emergency delay broadcasted.");
        await this.fetchQueue(tokenInput?.value || "OP-14");
      } catch (err) {
        Toast.error("Failed to set delay");
      }
    });

    document.getElementById("sim-reset-delay-btn")?.addEventListener("click", async () => {
      try {
        await ApiClient.post("/queue/advance", {
          facility_id: "fac-hosp-01",
          department_id: "Cardiology",
          action: "delay",
          delay_minutes: 0,
          delay_reason: ""
        });
        Toast.info("Delay cleared. Consultations resuming on schedule.");
        await this.fetchQueue(tokenInput?.value || "OP-14");
      } catch (err) {
        Toast.error("Failed to reset delay");
      }
    });
  },

  async fetchQueue(token) {
    const container = document.getElementById("queue-card-container");
    if (!container) return;

    try {
      const q = await ApiClient.get("/queue/status", {
        facility_id: "fac-hosp-01",
        department: "Cardiology",
        token
      });
      this.queueData = q;

      const isServingYou = q.people_ahead === 0;

      container.innerHTML = `
        <div class="space-y-6">
          
          <!-- Top Row: Department Info & Status -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 class="text-xl font-bold text-slate-800">City General Hospital &bull; Cardiology OPD</h2>
              <p class="text-xs text-slate-500">Cabin 104 &bull; Dr. Arvind Sharma</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${isServingYou ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-sky-100 text-sky-800'}">
              ${isServingYou ? '🔔 YOUR TURN NOW' : 'WAITING IN QUEUE'}
            </span>
          </div>

          <!-- Big Metric Tiles -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div class="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 text-center space-y-1">
              <span class="text-xs font-bold uppercase text-sky-700 tracking-wider">Your Assigned Token</span>
              <div class="text-4xl sm:text-5xl font-black text-sky-900">${q.your_token}</div>
              <span class="text-xs text-sky-700 font-medium">Please be seated in Waiting Area</span>
            </div>

            <div class="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center space-y-1">
              <span class="text-xs font-bold uppercase text-emerald-700 tracking-wider">Currently Serving</span>
              <div class="text-4xl sm:text-5xl font-black text-emerald-900">${q.current_serving_token}</div>
              <span class="text-xs text-emerald-700 font-semibold">Active In Consultation</span>
            </div>

            <div class="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center space-y-1">
              <span class="text-xs font-bold uppercase text-amber-700 tracking-wider">Estimated Waiting Time</span>
              <div class="text-3xl sm:text-4xl font-black text-amber-900">${q.wait_time_display}</div>
              <span class="text-xs text-amber-700 font-semibold">${q.people_ahead} Patients Ahead</span>
            </div>

          </div>

          <!-- Delay Update Banner (if any) -->
          ${q.delay_minutes > 0 ? `
            <div class="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <strong class="font-bold text-sm block">OPD Delay Alert (+${q.delay_minutes} minutes)</strong>
                <p class="text-xs text-amber-800 mt-0.5">${q.delay_reason || 'Doctor briefly engaged in urgent emergency consultation.'}</p>
              </div>
            </div>
          ` : `
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <span class="text-emerald-500 font-bold">✓</span>
              <span>OPD running on time. Average pace: <strong>${q.average_time_per_patient}</strong> per consultation.</span>
            </div>
          `}

          <!-- Hospital Navigation Callout -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              Need assistance reaching the consultation room?
            </div>
            <a href="#/navigation?facility_id=fac-hosp-01&dept=Cardiology" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2">
              <span>🧭 Open Hospital Navigation Guide</span>
            </a>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm">Error updating queue metrics.</div>`;
    }
  }
};
