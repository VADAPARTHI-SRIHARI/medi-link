/**
 * MEDI-LINK Centralized API Client
 * Manages REST requests, bearer token injection, and response parsing.
 */

import { APP_CONFIG, store } from "./config.js";

export class ApiClient {
  static async request(endpoint, options = {}) {
    const url = `${APP_CONFIG.apiBase}${endpoint}`;
    const token = store.get().token;

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle non-JSON or empty response
      const contentType = response.headers.get("content-type");
      let data = null;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  static get(endpoint, params = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    }
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request(`${endpoint}${qs}`, { method: "GET" });
  }

  static post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  static patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}
