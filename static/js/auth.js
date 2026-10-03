/**
 * MEDI-LINK Auth Controller
 * Coordinates registration, login, logout, and role-based permissions.
 */

import { ApiClient } from "./api.js";
import { store } from "./config.js";
import { Toast } from "./components/toast.js";

export class AuthManager {
  static async registerPatient(data) {
    try {
      const res = await ApiClient.post("/auth/register", data);
      store.set({ user: res.user, token: res.access_token });
      Toast.success(`Welcome to MEDI-LINK, ${res.user.name}!`);
      return res;
    } catch (error) {
      Toast.error(error.message);
      throw error;
    }
  }

  static async registerStaff(data) {
    try {
      const res = await ApiClient.post("/auth/staff/register", data);
      store.set({ user: res.user, token: res.access_token });
      Toast.success(`Staff account registered: ${res.user.name}`);
      return res;
    } catch (error) {
      Toast.error(error.message);
      throw error;
    }
  }

  static async login(email, password, role = "patient") {
    try {
      const endpoint = role === "staff" ? "/auth/staff/login" : "/auth/login";
      const res = await ApiClient.post(endpoint, { email, password, role });
      store.set({ user: res.user, token: res.access_token });
      Toast.success(`Welcome back, ${res.user.name}!`);
      return res;
    } catch (error) {
      Toast.error(error.message);
      throw error;
    }
  }

  static logout() {
    const user = store.get().user;
    store.set({ user: null, token: null });
    Toast.info("You have been signed out.");
    window.location.hash = "#/login";
  }

  static getCurrentUser() {
    return store.get().user;
  }

  static isAuthenticated() {
    return !!store.get().token;
  }

  static isStaffOrAdmin() {
    const user = store.get().user;
    return user && (user.role === "staff" || user.role === "admin" || user.role === "doctor");
  }
}
