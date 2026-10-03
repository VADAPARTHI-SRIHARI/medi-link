/**
 * MEDI-LINK Patient Dashboard View
 * Comprehensive health portal consolidating upcoming appointments, live OPD queue,
 * multi-tier discovery, emergency, AI Jarvis assistant, and vital stats.
 */

import { APP_CONFIG, store } from "../config.js";
import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const DashboardView = {
  async render() {
    const user = store.get().user || {
      name: "Rajesh Kumar",
      email: "patient@medilink.com",
      mobile: "+919876543210",
      location: "Hyderabad, Banjara Hills",
      role: "patient"
    };

    let appointments = [];
    let queueStatus = null;
    let vitals = null;

    try {
      const [apptsRes, qRes, vitRes] = await Promise.all([
        ApiClient.get("/appointments"),
        ApiClient.get("/queue/status"),
        ApiClient.get("/vitals/latest")
      ]);
      appointments = apptsRes || [];
      queueStatus = qRes;
      vitals = vitRes;
    } catch (e) {
      console.warn("Error loading dashboard data:", e);
    }

    const upcomingAppt = appointments.find(a => a.status === "CONFIRMED" || a.status === "WAITING" || a.status === "PENDING");

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Welcome Greeting & Easy Mode Prompt -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800">
                Welcome, <span class="text-sky-600">${user.name}</span>
              </h1>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">Patient Profile</span>
            </div>
            <p class="text-slate-500 text-sm">
              📍 Registered Locality: <strong>${user.location}</strong> &bull; Emergency Contact Active
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <a href="#/book" class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition flex items-center gap-1.5">
              <span>+</span>
              <span>Book Appointment</span>
            </a>
            <a href="#/emergency" class="heartbeat-btn px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-500/20 transition flex items-center gap-1.5">
              <span>🚨</span>
              <span>Emergency 24x7</span>
            </a>
          </div>
        </div>

        <!-- Live Status & Upcoming Queue Banner -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Upcoming Appointment & Queue Live Card -->
          <div class="lg:col-span-8 bg-gradient-to-br from-sky-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold tracking-wide uppercase border border-sky-400/30">
                  Next Scheduled Care Visit
                </span>
                <span class="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Sync
                </span>
              </div>

              ${upcomingAppt ? `
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-white">${upcomingAppt.doctor_name}</h2>
                    <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      upcomingAppt.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    }">${upcomingAppt.status}</span>
                  </div>
                  <p class="text-sky-200 text-sm font-medium">
                    ${upcomingAppt.department} &bull; ${upcomingAppt.facility_name}
                  </p>
                  <p class="text-xs text-slate-300">
                    📅 <strong>${upcomingAppt.date}</strong> &bull; ⏰ <strong>${upcomingAppt.time_slot}</strong>
                  </p>
                </div>

                <!-- Queue Token & Waiting Time Module -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 mt-4">
                  <div class="p-3 rounded-xl bg-white/10 backdrop-blur">
                    <span class="text-[11px] text-slate-300 uppercase font-semibold">Your Token</span>
                    <div class="text-2xl font-black text-amber-300">${upcomingAppt.queue_token || 'OP-14'}</div>
                  </div>
                  <div class="p-3 rounded-xl bg-white/10 backdrop-blur">
                    <span class="text-[11px] text-slate-300 uppercase font-semibold">Serving Token</span>
                    <div class="text-2xl font-black text-emerald-400">${queueStatus?.current_serving_token || 'OP-11'}</div>
                  </div>
                  <div class="p-3 rounded-xl bg-white/10 backdrop-blur">
                    <span class="text-[11px] text-slate-300 uppercase font-semibold">Est. Wait</span>
                    <div class="text-2xl font-black text-sky-300">${queueStatus?.wait_time_display || '24 mins'}</div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-3 pt-2">
                  <a href="#/queue" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition">
                    View Full Live Queue &rarr;
                  </a>
                  <a href="#/navigation" class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-1.5">
                    <span>🧭</span>
                    <span>Hospital Navigation Map</span>
                  </a>
                  <a href="#/appointments" class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition">
                    Manage / Reschedule
                  </a>
                </div>
              ` : `
                <div class="py-8 text-center space-y-3">
                  <p class="text-slate-300 text-base">You have no upcoming appointments scheduled right now.</p>
                  <a href="#/book" class="inline-block px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition">
                    Find Doctors & Book Now
                  </a>
                </div>
              `}
            </div>
          </div>

          <!-- Wearable Telemetry Vitals Widget -->
          <div class="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="text-xl">⌚</span>
                  <h3 class="text-base font-bold text-slate-800">Biometric Vitals</h3>
                </div>
                <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">BLE Connected</span>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-4">
                <div class="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <span class="text-xs font-semibold text-rose-700">Heart Rate</span>
                  <div class="text-2xl font-black text-rose-900">${vitals?.metrics?.heart_rate?.value || 74} <span class="text-xs font-normal text-slate-500">BPM</span></div>
                  <span class="text-[10px] text-emerald-700 font-bold">● Normal Rhythm</span>
                </div>
                <div class="p-3 rounded-2xl bg-sky-50/70 border border-sky-100">
                  <span class="text-xs font-semibold text-sky-700">Blood Oxygen</span>
                  <div class="text-2xl font-black text-sky-900">${vitals?.metrics?.spo2?.value || 98} <span class="text-xs font-normal text-slate-500">%</span></div>
                  <span class="text-[10px] text-emerald-700 font-bold">● Optimal SpO2</span>
                </div>
                <div class="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <span class="text-xs font-semibold text-amber-700">Resting BP</span>
                  <div class="text-xl font-black text-amber-900">${vitals?.metrics?.blood_pressure?.value || "120/80"}</div>
                  <span class="text-[10px] text-slate-500 font-medium">mmHg</span>
                </div>
                <div class="p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <span class="text-xs font-semibold text-teal-700">Daily Steps</span>
                  <div class="text-xl font-black text-teal-900">${vitals?.metrics?.steps?.value || 6800}</div>
                  <span class="text-[10px] text-slate-500 font-medium">Goal: 10k</span>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <a href="#/vitals" class="w-full block text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                Detailed Telemetry & History &rarr;
              </a>
            </div>
          </div>

        </div>

        <!-- Primary Action Navigation Grid (All required modules) -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-800">Quick Healthcare Access</h2>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            
            <a href="#/doctors" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">👨‍⚕️</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Find Doctor</h3>
              <p class="text-xs text-slate-500 mt-1">Specialists, experience, and fee comparison</p>
            </a>

            <a href="#/hospitals" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🏥</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Find Hospital</h3>
              <p class="text-xs text-slate-500 mt-1">Multi-speciality & government centres</p>
            </a>

            <a href="#/suitability" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🎯</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Suitability Matcher</h3>
              <p class="text-xs text-slate-500 mt-1">Find the right department for your symptoms</p>
            </a>

            <a href="#/doctors?specialty=Ayurvedic" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🌿</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Clinics / RMP / Ayur</h3>
              <p class="text-xs text-slate-500 mt-1">Local practitioners & holistic doctors</p>
            </a>

            <a href="#/ai" class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🤖</span>
              <h3 class="text-base font-bold text-emerald-900">AI Assistant (Jarvis)</h3>
              <p class="text-xs text-emerald-700 mt-1">Voice & text triage, prescription advisor</p>
            </a>

            <a href="#/emergency" class="p-5 rounded-2xl bg-red-50/80 border border-red-200 hover:border-red-400 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🚨</span>
              <h3 class="text-base font-bold text-red-900">Emergency 24x7</h3>
              <p class="text-xs text-red-700 mt-1">Instant SOS, ER booking & offline kit</p>
            </a>

            <a href="#/pharmacy" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">💊</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Medicine Finder</h3>
              <p class="text-xs text-slate-500 mt-1">Stock checker & nearby pharmacies</p>
            </a>

            <a href="#/home-visit" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🏠</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Home Visit Doctor</h3>
              <p class="text-xs text-slate-500 mt-1">Registered doctors visit your home</p>
            </a>

            <a href="#/blood" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🩸</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Blood Donation</h3>
              <p class="text-xs text-slate-500 mt-1">Emergency requests & donor pledge</p>
            </a>

            <a href="#/organ" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🫀</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Organ Services</h3>
              <p class="text-xs text-slate-500 mt-1">Pledge registry & transplant requests</p>
            </a>

            <a href="#/navigation" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">🧭</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Hospital Navigation</h3>
              <p class="text-xs text-slate-500 mt-1">Indoor wayfinding for elderly visitors</p>
            </a>

            <a href="#/appointments" class="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left group">
              <span class="text-3xl block mb-2 group-hover:scale-110 transition transform">📋</span>
              <h3 class="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">Appointment History</h3>
              <p class="text-xs text-slate-500 mt-1">Completed visits, audits & receipts</p>
            </a>

          </div>
        </div>

        <!-- Recent Appointments History List -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-800">Recent Appointments</h3>
            <a href="#/appointments" class="text-xs font-bold text-sky-600 hover:underline">View All &rarr;</a>
          </div>

          <div class="space-y-3">
            ${appointments.length > 0 ? appointments.slice(0, 3).map(a => `
              <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100 gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-slate-800">${a.doctor_name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-800' :
                      a.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }">${a.status}</span>
                  </div>
                  <p class="text-xs text-slate-500">${a.department} &bull; ${a.facility_name} &bull; Token: <strong>${a.queue_token || 'N/A'}</strong></p>
                </div>
                <div class="text-left sm:text-right">
                  <div class="text-xs font-bold text-slate-700">${a.date}</div>
                  <div class="text-xs text-slate-500">${a.time_slot}</div>
                </div>
              </div>
            `).join('') : `
              <p class="text-sm text-slate-400 py-4 text-center">No appointment records found.</p>
            `}
          </div>
        </div>

      </div>
    `;
  },

  attachEvents() {
    // Events handled via routing
  }
};
