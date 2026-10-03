/**
 * MEDI-LINK Global Config & State Store
 * Tagline: "Right Care. Right Doctor. Right Place. Right Time."
 */

export const APP_CONFIG = {
  name: "MEDI-LINK",
  tagline: "Right Care. Right Doctor. Right Place. Right Time.",
  subtitle: "Your Health • Our Priority",
  apiBase: "/api",
  logoUrl: "/static/assets/logo.jpg",
  defaultLocation: "Hyderabad"
};

class StateStore {
  constructor() {
    this.subscribers = [];
    this.state = {
      user: JSON.parse(localStorage.getItem("medilink_user") || "null"),
      token: localStorage.getItem("medilink_token") || null,
      easyMode: localStorage.getItem("medilink_easy_mode") === "true",
      location: localStorage.getItem("medilink_location") || "Hyderabad",
      offlineMode: !navigator.onLine,
      currentQueueToken: "OP-14",
      bookingDraft: null
    };

    // Apply easyMode to DOM on load
    if (this.state.easyMode) {
      document.body.classList.add("easy-mode");
    }

    window.addEventListener("online", () => this.set({ offlineMode: false }));
    window.addEventListener("offline", () => this.set({ offlineMode: true }));
  }

  get() {
    return this.state;
  }

  set(partial) {
    this.state = { ...this.state, ...partial };
    if ("user" in partial) {
      if (this.state.user) {
        localStorage.setItem("medilink_user", JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem("medilink_user");
      }
    }
    if ("token" in partial) {
      if (this.state.token) {
        localStorage.setItem("medilink_token", this.state.token);
      } else {
        localStorage.removeItem("medilink_token");
      }
    }
    if ("easyMode" in partial) {
      localStorage.setItem("medilink_easy_mode", this.state.easyMode);
      if (this.state.easyMode) {
        document.body.classList.add("easy-mode");
      } else {
        document.body.classList.remove("easy-mode");
      }
    }
    if ("location" in partial) {
      localStorage.setItem("medilink_location", this.state.location);
    }

    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    for (const cb of this.subscribers) {
      try {
        cb(this.state);
      } catch (err) {
        console.error("State listener error:", err);
      }
    }
  }
}

export const store = new StateStore();
