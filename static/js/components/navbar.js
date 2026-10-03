/**
 * MEDI-LINK Unified Navbar Component
 * Features Official Logo, Location Selector, Emergency Button, Easy Mode Toggle, and User Session.
 */

import { APP_CONFIG, store } from "../config.js";
import { AuthManager } from "../auth.js";
import { EasyModeController } from "./easyMode.js";

export class Navbar {
  static render() {
    const user = store.get().user;
    const isEasy = store.get().easyMode;
    const currentLocation = store.get().location;

    return `
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all" role="banner">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            
            <!-- Left: Logo & Brand -->
            <a href="#/" class="flex items-center gap-3 group focus:outline-none" aria-label="MEDI-LINK Home">
              <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white border border-slate-100 group-hover:scale-105 transition transform">
                <img src="${APP_CONFIG.logoUrl}" alt="Medi-Link Logo" class="w-full h-full object-contain p-0.5" />
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-black tracking-tight text-sky-800 brand-font">MEDI<span class="text-emerald-700">-LINK</span></span>
                  <span class="bg-sky-100 text-sky-800 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-sky-200">24x7 Care</span>
                </div>
                <span class="text-[11px] font-semibold text-slate-500 tracking-tight leading-none hidden sm:inline">
                  ${APP_CONFIG.tagline}
                </span>
              </div>
            </a>

            <!-- Center: Main Navigation (Desktop) -->
            <nav class="hidden xl:flex items-center gap-1 text-sm font-semibold text-slate-700" role="navigation" aria-label="Primary Navigation">
              <a href="#/dashboard" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Dashboard</a>
              <a href="#/doctors" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Find Doctors</a>
              <a href="#/hospitals" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Hospitals & Clinics</a>
              <a href="#/suitability" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Suitability</a>
              <a href="#/appointments" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Appointments</a>
              <a href="#/queue" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Live Queue</a>
              <a href="#/pharmacy" class="px-3 py-2 rounded-lg hover:text-sky-600 hover:bg-sky-50 transition">Pharmacy</a>
              <a href="#/ai" class="px-3 py-2 rounded-lg text-emerald-800 hover:bg-emerald-50 transition flex items-center gap-1 font-bold">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Jarvis
              </a>
            </nav>

            <!-- Right: Actions, Easy Mode, Emergency, Auth -->
            <div class="flex items-center gap-2 sm:gap-3">
              
              <!-- Location Selector -->
              <div class="relative hidden md:block">
                <button id="nav-location-btn" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition">
                  <span>📍</span>
                  <span id="nav-location-text">${currentLocation}</span>
                </button>
              </div>

              <!-- Easy Mode Toggle -->
              <button id="nav-easy-mode-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${isEasy ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}" title="Toggle Elderly & Accessible Easy Mode">
                <span>👓</span>
                <span class="hidden sm:inline">${isEasy ? "Easy Mode: ON" : "Easy Mode"}</span>
              </button>

              <!-- High Visibility 24x7 Emergency SOS Button -->
              <a href="#/emergency" class="heartbeat-btn flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full shadow-lg shadow-red-500/30 transition transform focus:ring-4 focus:ring-red-300" aria-label="Emergency 24x7 Support">
                <span class="text-base sm:text-lg">🚨</span>
                <span class="tracking-wide">EMERGENCY</span>
              </a>

              <!-- User Session / Login -->
              ${user ? `
                <div class="relative">
                  <button id="nav-user-dropdown-btn" class="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition">
                    <div class="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                      ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="hidden lg:flex flex-col text-left">
                      <span class="text-xs font-bold text-slate-800 leading-tight">${user.name.split(' ')[0]}</span>
                      <span class="text-[10px] font-semibold text-emerald-600 uppercase">${user.role}</span>
                    </div>
                  </button>

                  <div id="nav-user-menu" class="hidden absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div class="px-4 py-2 border-b border-slate-100">
                      <p class="text-xs text-slate-500">Signed in as</p>
                      <p class="text-sm font-bold text-slate-800 truncate">${user.name}</p>
                      <span class="inline-block mt-1 px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-semibold rounded-md uppercase">${user.role}</span>
                    </div>
                    ${user.role === 'staff' || user.role === 'admin' ? `
                      <a href="#/staff/dashboard" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">Hospital Staff Portal</a>
                    ` : ''}
                    <a href="#/dashboard" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Patient Dashboard</a>
                    <a href="#/appointments" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Appointments</a>
                    <a href="#/vitals" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Wearable Health Vitals</a>
                    <div class="border-t border-slate-100 mt-1 pt-1">
                      <button id="nav-logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">Sign Out</button>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="hidden sm:flex items-center gap-2">
                  <a href="#/login" class="px-3 py-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 transition">Log In</a>
                  <a href="#/register" class="px-3.5 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-full transition shadow-sm">Sign Up</a>
                </div>
              `}

              <!-- Mobile Hamburger Toggle -->
              <button id="nav-mobile-toggle" class="xl:hidden p-2 text-slate-700 hover:text-sky-600 focus:outline-none" aria-label="Toggle Navigation Menu">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>

            </div>
          </div>
        </div>

        <!-- Mobile Drawer Navigation -->
        <div id="nav-mobile-menu" class="hidden xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <div class="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <a href="#/dashboard" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">📊 Dashboard</a>
            <a href="#/doctors" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🩺 Doctors</a>
            <a href="#/hospitals" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🏥 Hospitals</a>
            <a href="#/suitability" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🎯 Suitability</a>
            <a href="#/appointments" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">📅 Appointments</a>
            <a href="#/queue" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">⏳ Live Queue</a>
            <a href="#/pharmacy" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">💊 Pharmacy</a>
            <a href="#/home-visit" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🏠 Home Visit</a>
            <a href="#/blood" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🩸 Blood Bank</a>
            <a href="#/organ" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🫀 Organ Pledge</a>
            <a href="#/navigation" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">🧭 Wayfinding</a>
            <a href="#/vitals" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">📈 Health Vitals</a>
          </div>

          <a href="#/ai" class="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm">
            <span class="flex items-center gap-2">🤖 MEDI-LINK AI Healthcare Assistant</span>
            <span class="text-xs bg-emerald-200 px-2 py-0.5 rounded-full">Voice & Text</span>
          </a>

          <div class="pt-2 flex flex-col gap-2">
            ${user ? `
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-100">
                <span class="text-xs font-bold text-slate-800">${user.name} (${user.role})</span>
                <button id="nav-mobile-logout-btn" class="text-xs font-bold text-red-600">Sign Out</button>
              </div>
            ` : `
              <div class="grid grid-cols-2 gap-2 pt-2">
                <a href="#/login" class="text-center py-2.5 rounded-xl border border-sky-600 text-sky-700 font-bold text-sm">Patient Login</a>
                <a href="#/register" class="text-center py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm">Sign Up</a>
              </div>
              <div class="text-center pt-2">
                <a href="#/staff/login" class="text-xs text-slate-500 hover:text-slate-800 underline">Hospital Staff / Clinic Login &rarr;</a>
              </div>
            `}
          </div>
        </div>
      </header>
    `;
  }

  static attachEvents() {
    // Easy mode button
    const easyBtn = document.getElementById("nav-easy-mode-btn");
    if (easyBtn) {
      easyBtn.addEventListener("click", () => {
        EasyModeController.toggle();
      });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById("nav-mobile-toggle");
    const mobileMenu = document.getElementById("nav-mobile-menu");
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // User dropdown
    const userBtn = document.getElementById("nav-user-dropdown-btn");
    const userMenu = document.getElementById("nav-user-menu");
    if (userBtn && userMenu) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userMenu.classList.toggle("hidden");
      });
      document.addEventListener("click", () => {
        userMenu.classList.add("hidden");
      });
    }

    // Logout
    const logoutBtn = document.getElementById("nav-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => AuthManager.logout());
    }
    const mobileLogoutBtn = document.getElementById("nav-mobile-logout-btn");
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener("click", () => AuthManager.logout());
    }

    // Location changer
    const locBtn = document.getElementById("nav-location-btn");
    if (locBtn) {
      locBtn.addEventListener("click", () => {
        const cities = ["Hyderabad", "Secunderabad", "Bengaluru", "Mumbai", "Delhi", "Vijayawada", "Visakhapatnam", "Chennai"];
        const current = store.get().location;
        const nextIdx = (cities.indexOf(current) + 1) % cities.length;
        const nextCity = cities[nextIdx];
        store.set({ location: nextCity });
        const txt = document.getElementById("nav-location-text");
        if (txt) txt.textContent = nextCity;
      });
    }
  }
}
