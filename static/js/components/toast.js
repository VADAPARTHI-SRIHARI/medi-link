/**
 * MEDI-LINK Toast Notification Component
 */

export class Toast {
  static container = null;

  static init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none";
      document.body.appendChild(this.container);
    }
  }

  static show(message, type = "info", duration = 4000) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border text-sm font-medium transition-all transform translate-y-2 opacity-0 animate-fade-in ${this.getTypeStyles(type)}`;

    const icon = this.getTypeIcon(type);

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xl">${icon}</span>
        <div class="leading-snug">${message}</div>
      </div>
      <button class="ml-4 text-slate-400 hover:text-slate-700 transition" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector("button");
    const removeToast = () => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener("click", removeToast);
    this.container.appendChild(toast);

    // Trigger animate in
    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-2");
    });

    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  }

  static success(msg, duration) { this.show(msg, "success", duration); }
  static error(msg, duration) { this.show(msg, "error", duration); }
  static info(msg, duration) { this.show(msg, "info", duration); }
  static warning(msg, duration) { this.show(msg, "warning", duration); }

  static getTypeStyles(type) {
    switch (type) {
      case "success": return "bg-emerald-50 border-emerald-200 text-emerald-900";
      case "error": return "bg-red-50 border-red-200 text-red-900";
      case "warning": return "bg-amber-50 border-amber-200 text-amber-900";
      default: return "bg-sky-50 border-sky-200 text-sky-900";
    }
  }

  static getTypeIcon(type) {
    switch (type) {
      case "success": return "✅";
      case "error": return "⚠️";
      case "warning": return "🔔";
      default: return "ℹ️";
    }
  }
}
