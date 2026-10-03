/**
 * MEDI-LINK Health & Wearable Monitoring View
 * Biometric vitals telemetry: Heart Rate (BPM), Blood Oxygen (SpO2),
 * Blood Pressure (mmHg), Body Temperature (°F), and validated clinical threshold alerts.
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const VitalsView = {
  vitals: null,

  async render() {
    return `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-3xl">⌚</span>
              <h1 class="text-3xl font-extrabold text-slate-900">Wearable Health Telemetry</h1>
            </div>
            <p class="text-slate-500 text-sm">
              Continuous physiological monitoring with validated clinical threshold detection.
            </p>
          </div>

          <div class="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Device: <strong>MediWatch-Pro-7X</strong> (BLE Connected)</span>
          </div>
        </div>

        <!-- Telemetry Cards Grid -->
        <div id="vitals-display-container" class="space-y-6">
          <div class="text-center py-12 text-slate-400">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Syncing wearable telemetry data...</p>
          </div>
        </div>

        <!-- Simulation Panel to demonstrate Critical Alerts -->
        <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">🧪</span>
              <h3 class="text-base font-bold">Wearable Telemetry Simulator</h3>
            </div>
            <span class="text-xs text-slate-400">Test clinical threshold response</span>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            In medical device testing, edge scenarios must be verified safely. Click any test scenario below to simulate wearable telemetry changes and observe automated family/hospital emergency notification protocols.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button id="sim-vitals-normal" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition">
              ✓ Simulate Normal Vitals (72 BPM, 98% SpO2)
            </button>
            <button id="sim-vitals-warning" class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition">
              ⚠️ Simulate Elevated Stress (108 BPM, 94% SpO2)
            </button>
            <button id="sim-vitals-critical" class="heartbeat-btn px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/30 transition">
              🚨 Trigger Critical Anomaly (142 BPM, 88% SpO2)
            </button>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchVitals();

    document.getElementById("sim-vitals-normal")?.addEventListener("click", () => {
      this.sendReading(72, 98, 120, 80, 98.6);
    });

    document.getElementById("sim-vitals-warning")?.addEventListener("click", () => {
      this.sendReading(108, 94, 138, 88, 99.1);
    });

    document.getElementById("sim-vitals-critical")?.addEventListener("click", () => {
      this.sendReading(142, 88, 168, 102, 101.4);
    });
  },

  async sendReading(hr, spo2, sys, dia, temp) {
    try {
      await ApiClient.post("/vitals/log", {
        heart_rate: hr,
        spo2,
        blood_pressure_sys: sys,
        blood_pressure_dia: dia,
        temperature: temp,
        steps: 7200,
        device_id: "MediWatch-Pro-7X"
      });
      Toast.info("Wearable telemetry synced.");
      await this.fetchVitals();
    } catch (err) {
      Toast.error("Failed to sync reading");
    }
  },

  async fetchVitals() {
    const container = document.getElementById("vitals-display-container");
    if (!container) return;

    try {
      const data = await ApiClient.get("/vitals/latest");
      this.vitals = data;

      const isCritical = data.alert.level === "CRITICAL";
      const isWarning = data.alert.level === "WARNING";

      container.innerHTML = `
        <div class="space-y-6">
          
          <!-- Alert Banner -->
          <div class="p-5 rounded-2xl ${
            isCritical ? 'bg-red-50 border-2 border-red-400 text-red-900 animate-pulse' :
            isWarning ? 'bg-amber-50 border-2 border-amber-300 text-amber-900' :
            'bg-emerald-50 border border-emerald-200 text-emerald-900'
          } flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <span class="text-2xl">${isCritical ? '🚨' : isWarning ? '⚠️' : '✅'}</span>
              <div>
                <strong class="font-black text-sm block">System Vitals Status: ${data.alert.level}</strong>
                <p class="text-xs mt-0.5">${data.alert.message}</p>
                ${isCritical ? `
                  <p class="text-xs font-bold mt-2 text-red-700">
                    Auto-Alert Protocol: Family emergency contact (+919876543211) notified. Trauma center dispatch simulated.
                  </p>
                ` : ''}
              </div>
            </div>
            ${isCritical ? `
              <a href="#/emergency" class="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs shrink-0 shadow-md">
                Open Emergency SOS &rarr;
              </a>
            ` : ''}
          </div>

          <!-- 4 Biometric Metric Tiles -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Heart Rate -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Heart Rate</span>
                <span class="text-xl">❤️</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black ${data.metrics.heart_rate.value > 130 ? 'text-red-600' : 'text-slate-900'}">${data.metrics.heart_rate.value}</span>
                <span class="text-xs font-bold text-slate-500">BPM</span>
              </div>
              <div class="text-[11px] font-semibold ${data.metrics.heart_rate.value > 130 ? 'text-red-600 font-bold' : 'text-emerald-600'}">
                ● ${data.metrics.heart_rate.status.toUpperCase()} (Target: 60-100)
              </div>
            </div>

            <!-- SpO2 -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Blood Oxygen</span>
                <span class="text-xl">🫁</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black ${data.metrics.spo2.value < 90 ? 'text-red-600' : 'text-slate-900'}">${data.metrics.spo2.value}</span>
                <span class="text-xs font-bold text-slate-500">%</span>
              </div>
              <div class="text-[11px] font-semibold ${data.metrics.spo2.value < 90 ? 'text-red-600 font-bold' : 'text-emerald-600'}">
                ● ${data.metrics.spo2.status.toUpperCase()} (Target: 95-100%)
              </div>
            </div>

            <!-- Blood Pressure -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Blood Pressure</span>
                <span class="text-xl">🩸</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-slate-900">${data.metrics.blood_pressure.value}</span>
                <span class="text-xs font-bold text-slate-500">mmHg</span>
              </div>
              <div class="text-[11px] font-semibold text-slate-500">
                ● Resting Baseline: 120/80
              </div>
            </div>

            <!-- Body Temperature -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Body Temp</span>
                <span class="text-xl">🌡️</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-slate-900">${data.metrics.temperature.value}</span>
                <span class="text-xs font-bold text-slate-500">°F</span>
              </div>
              <div class="text-[11px] font-semibold text-emerald-600">
                ● Normothermic Range
              </div>
            </div>

          </div>

          <!-- Historical Trends Table -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 class="text-base font-bold text-slate-800">24-Hour Telemetry Log</h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              ${data.trends.map(t => `
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                  <span class="text-[11px] text-slate-400 font-bold">${t.time}</span>
                  <div class="text-sm font-bold text-slate-800">${t.hr} <span class="text-[10px] text-slate-400 font-normal">BPM</span></div>
                  <div class="text-xs font-semibold text-sky-700">${t.spo2}% SpO2</div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-4 bg-red-50 text-red-800 rounded-xl text-xs">Failed to load vitals.</div>`;
    }
  }
};
