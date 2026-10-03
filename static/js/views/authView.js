/**
 * MEDI-LINK Authentication View
 * Supports:
 * - /login (Patient & universal login)
 * - /register (Patient registration)
 * - /staff/login (Hospital & clinic staff login)
 * - /staff/register (Hospital staff registration)
 * Includes thorough client-side validations, error alerts, and demo quick-fill buttons.
 */

import { AuthManager } from "../auth.js";
import { Toast } from "../components/toast.js";
import { APP_CONFIG } from "../config.js";

export const AuthView = {
  render(routeMode = "login") {
    const isRegister = routeMode.includes("register");
    const isStaff = routeMode.includes("staff");

    return `
      <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
          
          <!-- Logo & Header -->
          <div class="text-center space-y-2">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm">
              <img src="${APP_CONFIG.logoUrl}" alt="Medi-Link Logo" class="w-full h-full object-contain" />
            </div>
            <h1 class="text-2xl font-black text-slate-800 brand-font">
              ${isStaff ? "Hospital Staff Portal" : "Patient Portal"}
            </h1>
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              ${isRegister ? (isStaff ? "Register Employee Credentials" : "Create Patient Account") : (isStaff ? "Staff / Doctor Authentication" : "Sign In to Access Your Health Records")}
            </p>
          </div>

          <!-- Quick Demo Credential Pill -->
          <div class="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-800 flex items-center justify-between">
            <div>
              <span class="font-bold">Demo Quick Fill:</span>
              <p class="text-[11px] text-sky-700">
                ${isStaff ? "staff@cityhospital.com / staff123" : "patient@medilink.com / patient123"}
              </p>
            </div>
            <button id="auth-quick-fill-btn" class="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-sm">
              Fill Demo
            </button>
          </div>

          <!-- Validation Error Container -->
          <div id="auth-error-alert" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium"></div>

          <!-- Form Body -->
          <form id="auth-form" class="space-y-4">
            
            ${isRegister ? `
              <!-- Name / Employee Name -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ${isStaff ? "Employee Full Name" : "Full Name"} *
                </label>
                <input 
                  type="text" 
                  id="auth-name" 
                  required 
                  placeholder="${isStaff ? 'e.g. Priya Sharma' : 'e.g. Rajesh Kumar'}"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
                />
              </div>
            ` : ''}

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address / Gmail *</label>
              <input 
                type="email" 
                id="auth-email" 
                required 
                placeholder="name@example.com"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
              />
            </div>

            ${isRegister ? `
              <!-- Mobile Number -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Contact Number (10 digits) *</label>
                <input 
                  type="tel" 
                  id="auth-mobile" 
                  required 
                  placeholder="+91 98765 43210"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
                />
              </div>

              <!-- Location -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">City / Locality *</label>
                <input 
                  type="text" 
                  id="auth-location" 
                  required 
                  placeholder="e.g. Hyderabad, Banjara Hills"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
                />
              </div>
            ` : ''}

            ${isStaff && isRegister ? `
              <!-- Hospital Affiliation -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Hospital / Clinic Affiliation *</label>
                <input 
                  type="text" 
                  id="auth-hospital" 
                  required 
                  placeholder="e.g. City General Hospital"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
                />
              </div>

              <!-- Department -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Department / Wing *</label>
                <input 
                  type="text" 
                  id="auth-dept" 
                  required 
                  placeholder="e.g. OPD Reception, Cardiology, ER Triage"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
                />
              </div>
            ` : ''}

            <!-- Password -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password (min 6 characters) *</label>
              <input 
                type="password" 
                id="auth-password" 
                required 
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
              />
            </div>

            ${isRegister ? `
              <!-- Confirm Password -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm Password *</label>
                <input 
                  type="password" 
                  id="auth-confirm-password" 
                  required 
                  placeholder="••••••••"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-medium"
                />
              </div>
            ` : ''}

            <!-- Submit Button with Loading State -->
            <button 
              type="submit" 
              id="auth-submit-btn" 
              class="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span id="auth-btn-spinner" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span id="auth-btn-text">${isRegister ? "Complete Registration" : "Sign In"}</span>
            </button>

          </form>

          <!-- Switch Links -->
          <div class="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
            ${isRegister ? `
              <p class="text-slate-600">
                Already registered? 
                <a href="${isStaff ? '#/staff/login' : '#/login'}" class="font-bold text-sky-600 hover:underline">Log in here</a>
              </p>
            ` : `
              <p class="text-slate-600">
                Don't have an account yet? 
                <a href="${isStaff ? '#/staff/register' : '#/register'}" class="font-bold text-sky-600 hover:underline">Create an account</a>
              </p>
            `}

            <div class="pt-2">
              ${isStaff ? `
                <a href="#/login" class="text-slate-500 hover:text-slate-800 underline">Switch to Patient Portal &rarr;</a>
              ` : `
                <a href="#/staff/login" class="text-slate-500 hover:text-slate-800 underline">Hospital Staff / Clinic Administration Login &rarr;</a>
              `}
            </div>
          </div>

        </div>
      </div>
    `;
  },

  attachEvents(routeMode = "login") {
    const isRegister = routeMode.includes("register");
    const isStaff = routeMode.includes("staff");

    // Quick demo fill
    const fillBtn = document.getElementById("auth-quick-fill-btn");
    if (fillBtn) {
      fillBtn.addEventListener("click", () => {
        const emailInput = document.getElementById("auth-email");
        const pwInput = document.getElementById("auth-password");
        if (isStaff) {
          if (emailInput) emailInput.value = "staff@cityhospital.com";
          if (pwInput) pwInput.value = "staff123";
          if (isRegister) {
            const nameInput = document.getElementById("auth-name");
            const mobInput = document.getElementById("auth-mobile");
            const locInput = document.getElementById("auth-location");
            const hospInput = document.getElementById("auth-hospital");
            const deptInput = document.getElementById("auth-dept");
            const cpwInput = document.getElementById("auth-confirm-password");
            if (nameInput) nameInput.value = "Priya Sharma";
            if (mobInput) mobInput.value = "+919876543211";
            if (locInput) locInput.value = "Secunderabad";
            if (hospInput) hospInput.value = "City General Hospital";
            if (deptInput) deptInput.value = "OPD Administration";
            if (cpwInput) cpwInput.value = "staff123";
          }
        } else {
          if (emailInput) emailInput.value = "patient@medilink.com";
          if (pwInput) pwInput.value = "patient123";
          if (isRegister) {
            const nameInput = document.getElementById("auth-name");
            const mobInput = document.getElementById("auth-mobile");
            const locInput = document.getElementById("auth-location");
            const cpwInput = document.getElementById("auth-confirm-password");
            if (nameInput) nameInput.value = "Rajesh Kumar";
            if (mobInput) mobInput.value = "+919876543210";
            if (locInput) locInput.value = "Hyderabad, Banjara Hills";
            if (cpwInput) cpwInput.value = "patient123";
          }
        }
      });
    }

    // Submit handler
    const form = document.getElementById("auth-form");
    const errorAlert = document.getElementById("auth-error-alert");
    const submitBtn = document.getElementById("auth-submit-btn");
    const spinner = document.getElementById("auth-btn-spinner");
    const btnText = document.getElementById("auth-btn-text");

    const showError = (msg) => {
      if (errorAlert) {
        errorAlert.textContent = msg;
        errorAlert.classList.remove("hidden");
      }
    };

    const hideError = () => {
      if (errorAlert) {
        errorAlert.classList.add("hidden");
      }
    };

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById("auth-email")?.value.trim();
        const password = document.getElementById("auth-password")?.value;

        // Basic validation
        if (!email || !email.includes("@")) {
          showError("Please enter a valid email or Gmail address.");
          return;
        }

        if (!password || password.length < 6) {
          showError("Password must be at least 6 characters long.");
          return;
        }

        // Start loading
        if (submitBtn) submitBtn.disabled = true;
        if (spinner) spinner.classList.remove("hidden");
        if (btnText) btnText.textContent = "Processing...";

        try {
          if (isRegister) {
            const name = document.getElementById("auth-name")?.value.trim();
            const mobile = document.getElementById("auth-mobile")?.value.trim();
            const location = document.getElementById("auth-location")?.value.trim();
            const confirmPassword = document.getElementById("auth-confirm-password")?.value;

            if (password !== confirmPassword) {
              throw new Error("Passwords do not match. Please verify.");
            }

            if (isStaff) {
              const hospital = document.getElementById("auth-hospital")?.value.trim();
              const dept = document.getElementById("auth-dept")?.value.trim();

              await AuthManager.registerStaff({
                employee_name: name,
                email,
                mobile,
                location,
                hospital_affiliation: hospital,
                department: dept,
                password,
                confirm_password: confirmPassword
              });
              window.location.hash = "#/staff/dashboard";
            } else {
              await AuthManager.registerPatient({
                name,
                email,
                mobile,
                location,
                password,
                confirm_password: confirmPassword
              });
              window.location.hash = "#/dashboard";
            }
          } else {
            // Login
            const role = isStaff ? "staff" : "patient";
            await AuthManager.login(email, password, role);
            if (isStaff) {
              window.location.hash = "#/staff/dashboard";
            } else {
              window.location.hash = "#/dashboard";
            }
          }
        } catch (err) {
          showError(err.message || "Authentication failed. Please verify credentials.");
        } finally {
          if (submitBtn) submitBtn.disabled = false;
          if (spinner) spinner.classList.add("hidden");
          if (btnText) btnText.textContent = isRegister ? "Complete Registration" : "Sign In";
        }
      });
    }
  }
};
