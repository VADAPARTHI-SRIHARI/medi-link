/**
 * MEDI-LINK Unified Footer Component
 */

import { APP_CONFIG } from "../config.js";

export class Footer {
  static render() {
    return `
      <footer class="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800" role="contentinfo">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            <!-- Col 1: Brand & Tagline -->
            <div class="lg:col-span-2 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center">
                  <img src="${APP_CONFIG.logoUrl}" alt="Medi-Link Logo" class="w-full h-full object-contain" />
                </div>
                <div>
                  <span class="text-2xl font-black text-white tracking-tight brand-font">MEDI<span class="text-emerald-400">-LINK</span></span>
                  <p class="text-xs text-emerald-400 font-semibold uppercase tracking-wider">${APP_CONFIG.subtitle}</p>
                </div>
              </div>
              <p class="text-sm text-slate-400 leading-relaxed">
                <strong class="text-white">“${APP_CONFIG.tagline}”</strong><br/>
                Medi-Link connects patients, multi-tier doctors, local clinics, RMP family practitioners, Ayurvedic vaidyas, and tertiary hospitals into one transparent, safety-first digital healthcare ecosystem.
              </p>
              <div class="pt-2 flex items-center gap-3">
                <span class="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">NABH & NOTTO Aligned</span>
                <span class="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-sky-400 border border-slate-700">WCAG AAA Accessible</span>
              </div>
            </div>

            <!-- Col 2: Patient Services -->
            <div>
              <h4 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Care Services</h4>
              <ul class="space-y-2.5 text-sm">
                <li><a href="#/doctors" class="hover:text-emerald-400 transition">Find Specialists & Doctors</a></li>
                <li><a href="#/hospitals" class="hover:text-emerald-400 transition">Hospitals & Local Clinics</a></li>
                <li><a href="#/suitability" class="hover:text-emerald-400 transition">Hospital Suitability Matcher</a></li>
                <li><a href="#/home-visit" class="hover:text-emerald-400 transition">Home Doctor Visits</a></li>
                <li><a href="#/queue" class="hover:text-emerald-400 transition">Live Queue & OPD Tokens</a></li>
                <li><a href="#/navigation" class="hover:text-emerald-400 transition">Hospital Indoor Navigation</a></li>
              </ul>
            </div>

            <!-- Col 3: Community Health -->
            <div>
              <h4 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Health Ecosystem</h4>
              <ul class="space-y-2.5 text-sm">
                <li><a href="#/pharmacy" class="hover:text-emerald-400 transition">Medicine Finder & Pharmacies</a></li>
                <li><a href="#/blood" class="hover:text-emerald-400 transition">Blood Donation & Requests</a></li>
                <li><a href="#/organ" class="hover:text-emerald-400 transition">Organ Pledge & Registry</a></li>
                <li><a href="#/vitals" class="hover:text-emerald-400 transition">Wearable Vitals Monitoring</a></li>
                <li><a href="#/ai" class="hover:text-emerald-400 transition">Medi-Link AI (Jarvis Assistant)</a></li>
                <li><a href="#/staff/login" class="hover:text-emerald-400 transition">Hospital Staff Portal</a></li>
              </ul>
            </div>

            <!-- Col 4: 24x7 Emergency Helplines -->
            <div>
              <h4 class="text-sm font-bold uppercase tracking-wider text-red-400 mb-4 flex items-center gap-1.5">
                <span>🚨</span> 24x7 Helplines
              </h4>
              <ul class="space-y-3 text-sm">
                <li class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div class="text-xs text-slate-400">National Ambulance</div>
                  <a href="tel:108" class="text-lg font-black text-red-400 hover:underline">Dial 108</a>
                </li>
                <li class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div class="text-xs text-slate-400">Universal Emergency SOS</div>
                  <a href="tel:112" class="text-lg font-black text-amber-400 hover:underline">Dial 112</a>
                </li>
                <li class="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div class="text-xs text-slate-400">Medi-Link Patient Support</div>
                  <span class="text-sm font-bold text-white">+91 1800-425-6334</span>
                </li>
              </ul>
            </div>

          </div>

          <!-- Bottom Legal & Safety Disclaimer -->
          <div class="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>
              &copy; ${new Date().getFullYear()} MEDI-LINK Healthcare Ecosystem. All rights reserved.
            </p>
            <p class="max-w-xl text-center md:text-right text-[11px] leading-relaxed text-slate-400">
              <strong>Medical Disclaimer:</strong> MEDI-LINK is a clinical navigation and healthcare coordination platform. It does not replace professional clinical evaluation or emergency medical care. In case of life-threatening emergencies, dial 108 immediately.
            </p>
          </div>
        </div>
      </footer>
    `;
  }
}
