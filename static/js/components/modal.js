/**
 * MEDI-LINK Accessible Modal Dialog Helper
 */

export class Modal {
  static open({ title, contentHtml, onConfirm, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) {
    // Remove existing modal if any
    const existing = document.getElementById("active-modal-backdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.id = "active-modal-backdrop";
    backdrop.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in";

    const modal = document.createElement("div");
    modal.className = "bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 transition-all transform scale-95 opacity-0";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "modal-title");

    const confirmBtnClass = isDestructive
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-sky-600 hover:bg-sky-700 text-white";

    modal.innerHTML = `
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 id="modal-title" class="text-xl font-bold text-slate-800">${title}</h3>
        <button id="modal-close-icon" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
      </div>
      <div class="px-6 py-5 text-slate-600 max-h-[70vh] overflow-y-auto" id="modal-body-container">
        ${contentHtml}
      </div>
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
        <button id="modal-cancel-btn" class="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition">
          ${cancelText}
        </button>
        <button id="modal-confirm-btn" class="px-5 py-2.5 rounded-xl font-semibold shadow-md transition ${confirmBtnClass}">
          ${confirmText}
        </button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.remove("scale-95", "opacity-0");
      modal.classList.add("scale-100", "opacity-100");
    });

    const closeModal = () => {
      modal.classList.remove("scale-100", "opacity-100");
      modal.classList.add("scale-95", "opacity-0");
      setTimeout(() => backdrop.remove(), 200);
    };

    backdrop.querySelector("#modal-close-icon").addEventListener("click", closeModal);
    backdrop.querySelector("#modal-cancel-btn").addEventListener("click", closeModal);
    backdrop.querySelector("#modal-confirm-btn").addEventListener("click", async () => {
      if (onConfirm) {
        const canClose = await onConfirm(modal);
        if (canClose !== false) {
          closeModal();
        }
      } else {
        closeModal();
      }
    });

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  static confirm({ title, message, onConfirm, confirmText = "Yes, Proceed", cancelText = "Cancel", isDestructive = false }) {
    this.open({
      title,
      contentHtml: `<p class="text-base text-slate-700">${message}</p>`,
      onConfirm,
      confirmText,
      cancelText,
      isDestructive
    });
  }
}
