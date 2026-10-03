/**
 * MEDI-LINK Client-Side Router
 * Matches URL hashes and pathnames to clean, modular view components.
 */

import { Navbar } from "./components/navbar.js";
import { Footer } from "./components/footer.js";
import { HomeView } from "./views/homeView.js";
import { DashboardView } from "./views/dashboardView.js";
import { AuthView } from "./views/authView.js";
import { DoctorsView } from "./views/doctorsView.js";
import { HospitalsView } from "./views/hospitalsView.js";
import { SuitabilityView } from "./views/suitabilityView.js";
import { BookView } from "./views/bookView.js";
import { AppointmentsView } from "./views/appointmentsView.js";
import { QueueView } from "./views/queueView.js";
import { NavigationView } from "./views/navigationView.js";
import { PharmacyView } from "./views/pharmacyView.js";
import { BloodView } from "./views/bloodView.js";
import { OrganView } from "./views/organView.js";
import { HomeVisitView } from "./views/homeVisitView.js";
import { AIView } from "./views/aiView.js";
import { VitalsView } from "./views/vitalsView.js";
import { EmergencyView } from "./views/emergencyView.js";
import { StaffDashboardView } from "./views/staffDashboardView.js";
import { store } from "./config.js";

export class Router {
  static routes = {
    "/": HomeView,
    "/dashboard": DashboardView,
    "/login": { view: AuthView, mode: "login" },
    "/register": { view: AuthView, mode: "register" },
    "/staff/login": { view: AuthView, mode: "staff_login" },
    "/staff/register": { view: AuthView, mode: "staff_register" },
    "/staff/dashboard": StaffDashboardView,
    "/doctors": DoctorsView,
    "/hospitals": HospitalsView,
    "/suitability": SuitabilityView,
    "/book": BookView,
    "/appointments": AppointmentsView,
    "/queue": QueueView,
    "/navigation": NavigationView,
    "/pharmacy": PharmacyView,
    "/blood": BloodView,
    "/organ": OrganView,
    "/home-visit": HomeVisitView,
    "/ai": AIView,
    "/vitals": VitalsView,
    "/emergency": EmergencyView
  };

  static init() {
    window.addEventListener("hashchange", () => Router.handleRoute());
    window.addEventListener("load", () => Router.handleRoute());

    // Intercept standard internal links if clicked
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#/']");
      if (link) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    // Re-render navbar if state changes
    store.subscribe(() => {
      const navContainer = document.getElementById("navbar-container");
      if (navContainer) {
        navContainer.innerHTML = Navbar.render();
        Navbar.attachEvents();
      }
    });
  }

  static async handleRoute() {
    const hash = window.location.hash || "#/";
    const rawPath = hash.replace("#", "") || "/";
    const [pathOnly, queryString] = rawPath.split("?");

    const queryParams = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        queryParams[key] = val;
      });
    }

    const appContainer = document.getElementById("app");
    if (!appContainer) return;

    // Render Navbar & Footer shell
    let navContainer = document.getElementById("navbar-container");
    let mainContent = document.getElementById("main-content");
    let footerContainer = document.getElementById("footer-container");

    if (!navContainer) {
      appContainer.innerHTML = `
        <div id="navbar-container"></div>
        <main id="main-content" class="flex-1" role="main"></main>
        <div id="footer-container"></div>
      `;
      navContainer = document.getElementById("navbar-container");
      mainContent = document.getElementById("main-content");
      footerContainer = document.getElementById("footer-container");

      navContainer.innerHTML = Navbar.render();
      Navbar.attachEvents();
      footerContainer.innerHTML = Footer.render();
    } else {
      navContainer.innerHTML = Navbar.render();
      Navbar.attachEvents();
    }

    // Match route
    let matched = Router.routes[pathOnly];
    let mode = null;

    if (matched && matched.view) {
      mode = matched.mode;
      matched = matched.view;
    }

    if (!matched) {
      matched = HomeView;
    }

    // Render matched view
    mainContent.innerHTML = `
      <div class="py-20 text-center text-slate-400">
        <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></span>
      </div>
    `;

    try {
      const viewHtml = await matched.render(mode || queryParams);
      mainContent.innerHTML = viewHtml;
      if (typeof matched.attachEvents === "function") {
        await matched.attachEvents(mode || queryParams);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Route render error:", err);
      mainContent.innerHTML = `
        <div class="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4">
          <span class="text-4xl">⚠️</span>
          <h2 class="text-xl font-bold text-slate-800">Unable to load this section</h2>
          <p class="text-sm text-slate-500">${err.message || 'Please verify connection and retry.'}</p>
          <a href="#/" class="inline-block px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs">Return to Home</a>
        </div>
      `;
    }
  }
}
