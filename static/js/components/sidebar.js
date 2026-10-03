/**
 * MEDI-LINK Side Menu Bar Component (.side menu bar)
 * Matching user wireframe sketch with full multi-tier healthcare navigation.
 */

import { store } from "../config.js";

export class Sidebar {
  static isOpen = true;

  static render(currentPath = "/") {
    const isEasy = store.get().easyMode;
    const user = store.get().user;

    const navItems = [
      { path: "#/", label: "Home", icon: "🏠", badge: null },
      { path: "#/dashboard", label: "Patient Dashboard", icon: "📊", badge: null },
      { path: "#/hospitals", label: "Hospitals", icon: "🏥", badge: "Tertiary" },
      { path: "#/doctors?facility_type=clinic", label: "Local Hospitals & Clinics", icon: "🩺", badge: "RMP / AYUSH" },
      { path: "#/doctors", label: "Find Doctors", icon: "👨‍⚕️", badge: null },
      { path: "#/suitability", label: "Hospital Suitability", icon: "🎯", badge: "AI Triage" },
      { path: "#/book", label: "Appointment & (OP) Booking", icon: "📅", badge: "7-Step" },
      { path: "#/appointments", label: "Appointment Management", icon: "📋", badge: null },
      { path: "#/queue", label: "Live OPD Queue", icon: "⏳", badge: "OP-14" },
      { path: "#/pharmacy", label: "Medical Shops & Pharmacy", icon: "💊", badge: "24x7" },
      { path: "#/home-visit", label: "Home Doctor Visits", icon: "🏡", badge: null },
      { path: "#/blood", label: "Blood Services", icon: "🩸", badge: null },
      { path: "#/organ", label: "Organ Donation", icon: "🫀", badge: "NOTTO" },
      { path: "#/navigation", label: "Hospital Wayfinding", icon: "🧭", badge: "Indoor" },
      { path: "#/vitals", label: "Health Vitals Telemetry", icon: "⌚", badge: "BLE" },
      { path: "#/ai", label: "AI Healthcare Chatbot", icon: "🤖", badge: "Jarvis" },
      { path: "#/emergency", label: "Emergency SOS 24x7", icon: "🚨", badge: "SOS", isEmergency: true }
    ];

    if (user && (user.role === "staff" || user.role === "admin")) {
      navItems.splice(2, 0, {
        path: "#/staff/dashboard",
        label: "Staff Admin Console",
        icon: "🛡️",
        badge: "Staff"
      });
    }

    return `
      <!-- Desktop & Mobile Side Menu Bar Container -->
      <aside 
        id="app-sidebar" 
        class="bg-white border-r border-slate-200 w-72 shrink-0 flex flex-col transition-all duration-300 z-30 shadow-sm ${this.isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}"
        aria-label="Side menu bar"
      >
        <!-- Sidebar Header -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <span class="text-xl">📋</span>
            <div class="${this.isOpen ? 'block' : 'md:hidden'}">
              <span class="text-xs font-black uppercase tracking-wider text-slate-800">Side Menu Bar</span>
              <p class="text-[10px] text-slate-400 font-semibold leading-none">Platform Functions</p>
            </div>
          </div>
          <button 
            id="sidebar-collapse-btn" 
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition hidden md:block"
            title="Toggle Sidebar width"
          >
            ${this.isOpen ? '◀' : '▶'}
          </button>
        </div>

        <!-- Navigation Links Scroll Area -->
        <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-sm font-semibold">
          ${navItems.map(item => {
            const isCurrent = currentPath === item.path || (item.path !== '#/' && currentPath.startsWith(item.path.split('?')[0]));

            return `
              <a 
                href="${item.path}" 
                class="flex items-center justify-between px-3 py-2.5 rounded-xl transition group ${
                  item.isEmergency 
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' 
                    : isCurrent 
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
                }"
                title="${item.label}"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <span class="text-xl shrink-0">${item.icon}</span>
                  <span class="truncate ${this.isOpen ? 'block' : 'md:hidden'}">${item.label}</span>
                </div>
                ${item.badge ? `
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    item.isEmergency 
                      ? 'bg-red-600 text-white' 
                      : isCurrent 
                        ? 'bg-sky-200 text-sky-900' 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  } ${this.isOpen ? 'inline-block' : 'md:hidden'}">
                    ${item.badge}
                  </span>
                ` : ''}
              </a>
            `;
          }).join('')}
        </nav>

        <!-- Sidebar Footer Status -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/50 ${this.isOpen ? 'block' : 'md:hidden'}">
          <div class="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span class="text-slate-500">Live Queue Status</span>
              <span class="text-emerald-600 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-700">Token Serving: <strong>OP-11</strong></span>
              <a href="#/queue" class="text-sky-600 font-bold hover:underline">Track &rarr;</a>
            </div>
          </div>
        </div>

      </aside>
    `;
  }

  static attachEvents() {
    const collapseBtn = document.getElementById("sidebar-collapse-btn");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById("app-sidebar");
        if (sidebar) {
          if (this.isOpen) {
            sidebar.classList.remove("md:w-20");
            sidebar.classList.add("w-72");
            sidebar.querySelectorAll(".md\\:hidden").forEach(el => el.classList.remove("md:hidden"));
          } else {
            sidebar.classList.remove("w-72");
            sidebar.classList.add("md:w-20");
          }
        }
      });
    }
  }
}
