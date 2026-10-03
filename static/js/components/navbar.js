/**
 * MEDI-LINK Header & Top Menu Bar Component
 * Matches the user wireframe sketch:
 * - Top: menu bar
 * - Header: logo (left) | App name (center) | user profile icon (right)
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
      <!-- TOP MENU BAR ("menu" from sketch) -->
      <div id="top-menu-bar" class="bg-slate-900 text-slate-300 text-[11px] font-semibold py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <!-- Left: 24x7 Helpline numbers -->
          <div class="flex items-center gap-3">
            <span class="text-amber-400 flex items-center gap-1 font-bold">
              <span>🚨</span> 24x7 Helpline:
            </span>
            <a href="tel:108" class="text-white hover:text-red-400 font-bold underline transition">108 (Ambulance)</a>
            <span class="text-slate-600">|</span>
            <a href="tel:112" class="text-white hover:text-amber-400 font-bold transition">112 (Universal)</a>
            <span class="text-slate-600 hidden sm:inline">|</span>
            <span class="hidden sm:inline text-slate-400">Toll Free: 1800-425-6334</span>
          </div>

          <!-- Center Tagline (Hidden on mobile) -->
          <div class="hidden lg:block text-slate-300 italic font-medium">
            “${APP_CONFIG.tagline}”
          </div>

          <!-- Right: Location, Easy Mode & System Status -->
          <div class="flex items-center gap-3">
            
            <!-- Location -->
            <button id="nav-location-btn" class="flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer">
              <span>📍</span>
              <span id="nav-location-text" class="font-bold underline">${currentLocation}</span>
            </button>

            <span class="text-slate-600">|</span>

            <!-- Easy Mode -->
            <button id="nav-easy-mode-btn" class="flex items-center gap-1 cursor-pointer transition ${isEasy ? 'text-amber-400 font-black' : 'text-slate-300 hover:text-white'}">
              <span>👓</span>
              <span>${isEasy ? 'Easy Mode: ON' : 'Easy Mode'}</span>
            </button>

            <span class="text-slate-600 hidden sm:inline">|</span>

            <span class="text-emerald-400 hidden sm:flex items-center gap-1 font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              24x7 Online
            </span>
          </div>

        </div>
      </div>

      <!-- MAIN HEADER BAR (logo [left] | App name [center] | User Profile [right]) -->
      <header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm" role="banner">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            
            <!-- Left: Sidebar Toggle + Official Logo -->
            <div class="flex items-center gap-3">
              <!-- Sidebar Toggle Hamburger -->
              <button 
                id="sidebar-toggle-btn" 
                class="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-sky-600 transition flex items-center justify-center cursor-pointer shadow-2xs"
                aria-label="Toggle Side Menu Bar"
                title="Toggle Side Menu Bar"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>

              <!-- Logo -->
              <a href="#/" class="flex items-center gap-2 group" aria-label="MEDI-LINK Home">
                <div class="w-12 h-12 rounded-xl overflow-hidden shadow-xs flex items-center justify-center bg-white border border-slate-200 group-hover:scale-105 transition transform p-0.5">
                  <img src="${APP_CONFIG.logoUrl}" alt="Medi-Link Logo" class="w-full h-full object-contain" />
                </div>
              </a>
            </div>

            <!-- Center: App Name ("App name" from sketch) -->
            <div class="flex flex-col items-center text-center justify-center">
              <a href="#/" class="flex items-center gap-2 group">
                <span class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-sky-800 brand-font group-hover:opacity-95 transition">
                  MEDI<span class="text-emerald-700">-LINK</span>
                </span>
                <span class="hidden md:inline-block bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-300">
                  HEALTHCARE ECOSYSTEM
                </span>
              </a>
              <span class="text-[11px] font-semibold text-slate-500 tracking-tight hidden sm:block">
                ${APP_CONFIG.subtitle}
              </span>
            </div>

            <!-- Right: Emergency SOS + User Profile Icon ("👤" from sketch) -->
            <div class="flex items-center gap-3">
              
              <!-- Quick Emergency SOS Button -->
              <a href="#/emergency" class="heartbeat-btn hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-full shadow-md shadow-red-500/20 transition">
                <span>🚨</span>
                <span class="tracking-wide uppercase">SOS</span>
              </a>

              <!-- User Profile Icon (👤 from sketch) -->
              <div class="relative">
                <button 
                  id="nav-user-dropdown-btn" 
                  class="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border-2 border-slate-200 hover:border-sky-500 bg-slate-50 hover:bg-sky-50 transition cursor-pointer shadow-2xs group"
                  aria-label="User Account Profile Menu"
                  title="User Account"
                >
                  <!-- Circular Profile Avatar -->
                  <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition">
                    ${user ? user.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  
                  <div class="hidden md:flex flex-col text-left">
                    <span class="text-xs font-bold text-slate-800 leading-tight">
                      ${user ? user.name.split(' ')[0] : 'Sign In / Account'}
                    </span>
                    <span class="text-[10px] font-semibold text-emerald-600 uppercase">
                      ${user ? user.role : 'Guest Patient'}
                    </span>
                  </div>

                  <span class="text-slate-400 text-xs hidden md:inline">▼</span>
                </button>

                <!-- Profile Dropdown Menu -->
                <div id="nav-user-menu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fade-in">
                  ${user ? `
                    <div class="px-4 py-2 border-b border-slate-100">
                      <p class="text-[11px] text-slate-400 font-semibold uppercase">Signed In As</p>
                      <p class="text-sm font-bold text-slate-900 truncate">${user.name}</p>
                      <p class="text-xs text-slate-500 truncate">${user.email}</p>
                      <span class="inline-block mt-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                        ${user.role} profile
                      </span>
                    </div>

                    <div class="py-1 text-sm font-medium text-slate-700">
                      <a href="#/dashboard" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                        <span>📊</span> Patient Dashboard
                      </a>
                      <a href="#/appointments" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                        <span>📅</span> My Appointments
                      </a>
                      <a href="#/vitals" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                        <span>⌚</span> Wearable Vitals Log
                      </a>
                      ${user.role === 'staff' || user.role === 'admin' ? `
                        <a href="#/staff/dashboard" class="flex items-center gap-2 px-4 py-2 text-purple-700 font-bold hover:bg-purple-50">
                          <span>🛡️</span> Hospital Staff Console
                        </a>
                      ` : ''}
                    </div>

                    <div class="border-t border-slate-100 pt-2 px-2">
                      <button id="nav-logout-btn" class="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition">
                        Sign Out
                      </button>
                    </div>
                  ` : `
                    <div class="p-4 space-y-3">
                      <div class="text-center space-y-1 pb-2 border-b border-slate-100">
                        <p class="text-sm font-bold text-slate-800">Welcome to MEDI-LINK</p>
                        <p class="text-xs text-slate-500">Sign in to manage appointments & records</p>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <a href="#/login" class="text-center py-2.5 rounded-xl border border-sky-600 text-sky-700 font-bold text-xs hover:bg-sky-50 transition">
                          Patient Log In
                        </a>
                        <a href="#/register" class="text-center py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition shadow-sm">
                          Register
                        </a>
                      </div>
                      <div class="pt-2 text-center border-t border-slate-100">
                        <a href="#/staff/login" class="text-xs text-slate-600 hover:text-slate-900 font-semibold underline">
                          Hospital Staff & Clinic Log In &rarr;
                        </a>
                      </div>
                    </div>
                  `}
                </div>
              </div>

            </div>

          </div>
        </div>
      </header>
    `;
  }

  static attachEvents() {
    // Easy mode toggle
    const easyBtn = document.getElementById("nav-easy-mode-btn");
    if (easyBtn) {
      easyBtn.addEventListener("click", () => {
        EasyModeController.toggle();
      });
    }

    // Sidebar toggle button
    const sidebarToggle = document.getElementById("sidebar-toggle-btn");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        const sidebar = document.getElementById("app-sidebar");
        if (sidebar) {
          sidebar.classList.toggle("-translate-x-full");
          sidebar.classList.toggle("hidden");
        }
      });
    }

    // User profile dropdown
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
