/**
 * MEDI-LINK Appointment Management View (/appointments)
 * Features complete appointment lifecycle management:
 * - Status filters (PENDING, CONFIRMED, WAITING, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED)
 * - Cancellation with reason and confirmation dialog
 * - Rescheduling with new date/slot picker and confirmation modal
 * - Live clinical audit trail modal
 */

import { ApiClient } from "../api.js";
import { Modal } from "../components/modal.js";
import { Toast } from "../components/toast.js";

export const AppointmentsView = {
  appointments: [],
  activeFilter: "ALL",

  async render() {
    return `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-3xl font-extrabold text-slate-900">Appointment Management</h1>
            <p class="text-slate-500 text-sm">
              Track, reschedule, or cancel your consultations with full clinical audit trails.
            </p>
          </div>
          <a href="#/book" class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5">
            <span>+</span>
            <span>Book New Appointment</span>
          </a>
        </div>

        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button class="appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-900 text-white shadow-sm" data-status="ALL">All Visits</button>
          <button class="appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-status="CONFIRMED">Confirmed / Upcoming</button>
          <button class="appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-status="WAITING">In Queue / Waiting</button>
          <button class="appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-status="COMPLETED">Completed</button>
          <button class="appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-status="CANCELLED">Cancelled</button>
          <button class="appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-status="RESCHEDULED">Rescheduled</button>
        </div>

        <!-- Appointments List Container -->
        <div id="appointments-list-container" class="space-y-4">
          <div class="text-center py-12 text-slate-500">
            <span class="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></span>
            <p>Loading appointments and audit history...</p>
          </div>
        </div>

      </div>
    `;
  },

  async attachEvents() {
    await this.fetchAndRenderAppointments();

    document.querySelectorAll(".appt-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".appt-tab-btn").forEach(b => {
          b.className = "appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";
        });
        e.target.className = "appt-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-900 text-white shadow-sm";
        this.activeFilter = e.target.getAttribute("data-status") || "ALL";
        this.renderFilteredList();
      });
    });
  },

  async fetchAndRenderAppointments() {
    try {
      const appts = await ApiClient.get("/appointments");
      this.appointments = appts || [];
      this.renderFilteredList();
    } catch (e) {
      const container = document.getElementById("appointments-list-container");
      if (container) {
        container.innerHTML = `<div class="p-6 bg-red-50 text-red-800 rounded-2xl text-center text-sm">Error loading appointments.</div>`;
      }
    }
  },

  renderFilteredList() {
    const container = document.getElementById("appointments-list-container");
    if (!container) return;

    let list = this.appointments;
    if (this.activeFilter !== "ALL") {
      list = list.filter(a => a.status.toUpperCase() === this.activeFilter);
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <span class="text-4xl">📅</span>
          <h3 class="text-lg font-bold text-slate-800">No appointments in this category</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto">
            You do not currently have any appointments matching the "${this.activeFilter}" filter.
          </p>
          <div class="pt-2">
            <a href="#/book" class="inline-block px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold">Book a Consultation &rarr;</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${list.map(appt => {
          const isCancelled = appt.status === "CANCELLED";
          const isCompleted = appt.status === "COMPLETED";

          return `
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
              
              <!-- Top Row: Doctor, Status, Token -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-black text-slate-900">${appt.doctor_name}</h3>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${this.getStatusBadgeClass(appt.status)}">
                      ${appt.status}
                    </span>
                  </div>
                  <p class="text-xs text-sky-700 font-bold">${appt.department} &bull; ${appt.facility_name}</p>
                </div>

                <div class="flex items-center gap-3">
                  <div class="text-left sm:text-right">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Token Number</span>
                    <span class="text-xl font-black text-sky-900">${appt.queue_token || 'N/A'}</span>
                  </div>
                  <div class="text-left sm:text-right border-l pl-3 border-slate-100">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Visit ID</span>
                    <span class="text-xs font-mono font-bold text-slate-700">${appt.id}</span>
                  </div>
                </div>
              </div>

              <!-- Middle: Timing, Symptoms, Notes -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Schedule</span>
                  <div class="font-bold text-slate-800 text-sm">📅 ${appt.date}</div>
                  <div class="text-slate-600 font-medium">⏰ ${appt.time_slot}</div>
                  <div class="text-emerald-700 font-semibold capitalize">Type: ${appt.appointment_type.replace('_', ' ')}</div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Clinical Context</span>
                  <div class="font-medium text-slate-800">Reason: ${appt.reason || 'General checkup'}</div>
                  <div class="text-slate-500">Symptoms: ${appt.symptoms || 'None specified'}</div>
                  ${appt.home_address ? `<div class="text-amber-800">🏠 Home: ${appt.home_address}</div>` : ''}
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span class="text-slate-400 font-bold uppercase block text-[10px]">Preparation & Instructions</span>
                  <p class="text-slate-600 leading-relaxed">${appt.preparation_notes || 'Bring past prescription slips and valid ID proof.'}</p>
                  ${appt.cancel_reason ? `<p class="text-red-600 font-bold">Cancellation Reason: ${appt.cancel_reason}</p>` : ''}
                </div>
              </div>

              <!-- Actions Bottom Bar -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                
                <div class="flex items-center gap-2">
                  <a href="#/navigation?facility_id=${appt.facility_id}&dept=${encodeURIComponent(appt.department)}" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1">
                    <span>🧭</span> Wayfinding Map
                  </a>
                  <a href="#/queue?token=${appt.queue_token}" class="px-3 py-1.5 rounded-xl border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-bold transition flex items-center gap-1">
                    <span>⏳</span> Track Queue
                  </a>
                  <button class="view-audit-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold" data-id="${appt.id}">
                    Audit Trail
                  </button>
                </div>

                <!-- Reschedule & Cancel actions -->
                <div class="flex items-center gap-2">
                  ${!isCancelled && !isCompleted ? `
                    <button class="reschedule-btn px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition" data-id="${appt.id}" data-date="${appt.date}" data-slot="${appt.time_slot}">
                      Reschedule
                    </button>
                    <button class="cancel-btn px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition" data-id="${appt.id}">
                      Cancel
                    </button>
                  ` : `
                    <span class="text-xs text-slate-400 italic">No further actions available</span>
                  `}
                </div>

              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;

    // Attach actions
    this.attachCardActions();
  },

  attachCardActions() {
    // Cancel action
    document.querySelectorAll(".cancel-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        Modal.open({
          title: "Cancel Appointment",
          isDestructive: true,
          confirmText: "Confirm Cancellation",
          contentHtml: `
            <div class="space-y-4">
              <p class="text-sm text-slate-600">
                Are you sure you want to cancel appointment <strong>${id}</strong>? This slot will be released back into the queue.
              </p>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Reason for cancellation *</label>
                <select id="modal-cancel-reason" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium">
                  <option value="Schedule conflict / Personal emergency">Schedule conflict / Personal emergency</option>
                  <option value="Symptoms resolved / Feeling better">Symptoms resolved / Feeling better</option>
                  <option value="Booked another specialist">Booked another specialist</option>
                  <option value="Transportation / Travel difficulty">Transportation / Travel difficulty</option>
                </select>
              </div>
            </div>
          `,
          onConfirm: async () => {
            const reason = document.getElementById("modal-cancel-reason")?.value || "Patient requested cancellation";
            try {
              await ApiClient.post(`/appointments/${id}/cancel`, { cancel_reason: reason });
              Toast.success("Appointment successfully cancelled.");
              await AppointmentsView.fetchAndRenderAppointments();
              return true;
            } catch (err) {
              Toast.error(err.message || "Failed to cancel");
              return false;
            }
          }
        });
      });
    });

    // Reschedule action
    document.querySelectorAll(".reschedule-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const currentDate = e.target.getAttribute("data-date");
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        Modal.open({
          title: "Reschedule Appointment",
          confirmText: "Confirm New Slot",
          contentHtml: `
            <div class="space-y-4">
              <p class="text-sm text-slate-600">Select a new date and time slot for visit <strong>${id}</strong>.</p>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">New Date *</label>
                <input type="date" id="modal-resched-date" min="${tomorrow}" value="${tomorrow}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">New Available Slot *</label>
                <select id="modal-resched-slot" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium">
                  <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                  <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                  <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-slate-700 mb-1">Reason for Rescheduling</label>
                <input type="text" id="modal-resched-reason" placeholder="e.g. Work commitment conflict" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium" />
              </div>
            </div>
          `,
          onConfirm: async () => {
            const newDate = document.getElementById("modal-resched-date")?.value;
            const newSlot = document.getElementById("modal-resched-slot")?.value;
            const reason = document.getElementById("modal-resched-reason")?.value || "Patient requested reschedule";

            try {
              await ApiClient.post(`/appointments/${id}/reschedule`, {
                new_date: newDate,
                new_time_slot: newSlot,
                reschedule_reason: reason
              });
              Toast.success("Appointment rescheduled successfully.");
              await AppointmentsView.fetchAndRenderAppointments();
              return true;
            } catch (err) {
              Toast.error(err.message || "Failed to reschedule");
              return false;
            }
          }
        });
      });
    });

    // Audit trail view
    document.querySelectorAll(".view-audit-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        try {
          const appt = await ApiClient.get(`/appointments/${id}`);
          const audits = appt.audit_trail || [];

          Modal.open({
            title: `Audit Trail: ${id}`,
            cancelText: "Close",
            confirmText: "OK",
            contentHtml: `
              <div class="space-y-4">
                <div class="text-xs text-slate-500">
                  Patient: <strong>${appt.patient_name}</strong> &bull; Doctor: <strong>${appt.doctor_name}</strong>
                </div>
                <div class="space-y-3">
                  ${audits.map(a => `
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800">${a.new_status}</span>
                        <span class="text-slate-400">${a.timestamp}</span>
                      </div>
                      <p class="text-slate-600">${a.action_note || 'Status updated.'}</p>
                      <p class="text-[10px] text-slate-400">Changed By: <strong>${a.changed_by}</strong></p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          });
        } catch (err) {
          Toast.error("Failed to load audit history");
        }
      });
    });
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case "CONFIRMED": return "bg-sky-100 text-sky-800 border border-sky-300";
      case "WAITING": return "bg-amber-100 text-amber-800 border border-amber-300";
      case "IN_PROGRESS": return "bg-purple-100 text-purple-800 border border-purple-300";
      case "COMPLETED": return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "CANCELLED": return "bg-red-100 text-red-800 border border-red-300";
      case "RESCHEDULED": return "bg-orange-100 text-orange-800 border border-orange-300";
      default: return "bg-slate-100 text-slate-800 border border-slate-300";
    }
  }
};
