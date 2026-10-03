/**
 * MEDI-LINK AI Healthcare Assistant View (Jarvis-style)
 * Supports voice input (Web Speech Recognition API), text-to-speech audio feedback,
 * interactive prescription explanation, clinical triage, and red-flag emergency interception.
 */

import { ApiClient } from "../api.js";
import { Toast } from "../components/toast.js";

export const AIView = {
  chatHistory: [],
  speechRecognition: null,
  isListening: false,
  voiceOutputEnabled: true,

  async render() {
    return `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
              🤖
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-black text-slate-900 brand-font">MEDI-LINK AI</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Jarvis Care Assistant</span>
              </div>
              <p class="text-xs text-slate-500 font-medium">
                Clinical triage, prescription guide, nutrition counselor & department router.
              </p>
            </div>
          </div>

          <!-- Voice Output Toggle -->
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <input type="checkbox" id="ai-voice-toggle" checked class="w-4 h-4 text-emerald-600 rounded" />
              <span>🔊 Voice Readout</span>
            </label>
          </div>
        </div>

        <!-- AI Safety & Clinical Disclaimer Card -->
        <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <span class="text-lg">🛡️</span>
          <div class="leading-relaxed">
            <strong>Clinical Safety Protocol:</strong> Medi-Link AI is a healthcare navigation assistant, not a licensed physician. It cannot prescribe prescription drugs, modify clinical dosages, or provide guaranteed diagnoses. For sudden emergencies, dial <strong>108</strong> or tap Emergency SOS.
          </div>
        </div>

        <!-- Quick Action Chips -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="text-slate-400 font-bold">Quick Actions:</span>
          <button class="ai-chip px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-semibold transition" data-msg="Which department should I consult for severe knee pain?">Which department?</button>
          <button class="ai-chip px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-semibold transition" data-msg="Explain prescription for Dolo 650mg and Pan 40">Explain prescription</button>
          <button class="ai-chip px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-semibold transition" data-msg="Suggest a heart-healthy diet for high blood pressure">Diet guidance</button>
          <button class="ai-chip px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-semibold transition" data-msg="Find an Ayurvedic doctor for chronic arthritis">Ayurvedic care</button>
          <button class="ai-chip px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-bold transition" data-msg="I have sudden acute chest pain and breathlessness">🚨 Emergency help</button>
        </div>

        <!-- Chat Container -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[520px]">
          
          <!-- Message Feed -->
          <div id="ai-messages-feed" class="flex-1 p-6 overflow-y-auto space-y-4">
            
            <!-- Welcome message from Jarvis -->
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0 font-bold">AI</div>
              <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-slate-800 text-sm max-w-[85%] space-y-2 leading-relaxed">
                <p class="font-bold text-emerald-950">Hello! I am your Medi-Link AI Healthcare Assistant.</p>
                <p>I can help you identify the right medical department, interpret prescription medications, guide nutritional therapy, or connect you with local clinics and Ayurvedic doctors.</p>
                <p class="text-xs text-slate-500 italic">How can I assist your health journey today?</p>
              </div>
            </div>

          </div>

          <!-- Input Footer with Voice Mic -->
          <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
            
            <!-- Voice Input Button -->
            <button id="ai-voice-mic-btn" class="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 font-bold transition shadow-sm flex items-center justify-center text-lg" title="Click to speak (Voice Recognition)">
              <span id="ai-mic-icon">🎙️</span>
            </button>

            <!-- Text Input Field -->
            <div class="flex-1 relative">
              <input 
                type="text" 
                id="ai-text-input" 
                placeholder="Ask Medi-Link AI or tap microphone to speak..." 
                class="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <!-- Send Button -->
            <button id="ai-send-btn" class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center gap-1.5">
              <span>Send</span>
              <span>&rarr;</span>
            </button>
          </div>

        </div>

      </div>
    `;
  },

  attachEvents() {
    const input = document.getElementById("ai-text-input");
    const sendBtn = document.getElementById("ai-send-btn");
    const micBtn = document.getElementById("ai-voice-mic-btn");
    const voiceToggle = document.getElementById("ai-voice-toggle");

    if (voiceToggle) {
      voiceToggle.addEventListener("change", (e) => {
        this.voiceOutputEnabled = e.target.checked;
      });
    }

    const doSend = () => {
      const msg = input?.value?.trim();
      if (msg) {
        input.value = "";
        this.handleUserMessage(msg);
      }
    };

    if (sendBtn) sendBtn.addEventListener("click", doSend);
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSend();
      });
    }

    // Quick chips
    document.querySelectorAll(".ai-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        const msg = e.target.getAttribute("data-msg");
        if (msg) this.handleUserMessage(msg);
      });
    });

    // Voice recognition setup (Web Speech API)
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = "en-US";

      this.speechRecognition.onstart = () => {
        this.isListening = true;
        const icon = document.getElementById("ai-mic-icon");
        if (icon) icon.textContent = "🔴 Listening...";
        micBtn?.classList.add("bg-red-50", "border-red-400", "animate-pulse");
      };

      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (input) input.value = transcript;
        this.handleUserMessage(transcript);
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        const icon = document.getElementById("ai-mic-icon");
        if (icon) icon.textContent = "🎙️";
        micBtn?.classList.remove("bg-red-50", "border-red-400", "animate-pulse");
      };

      this.speechRecognition.onerror = (e) => {
        this.isListening = false;
        const icon = document.getElementById("ai-mic-icon");
        if (icon) icon.textContent = "🎙️";
        micBtn?.classList.remove("bg-red-50", "border-red-400", "animate-pulse");
      };

      if (micBtn) {
        micBtn.addEventListener("click", () => {
          if (this.isListening) {
            this.speechRecognition.stop();
          } else {
            this.speechRecognition.start();
          }
        });
      }
    } else {
      if (micBtn) {
        micBtn.title = "Speech recognition not supported in this browser";
        micBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  },

  async handleUserMessage(message) {
    const feed = document.getElementById("ai-messages-feed");
    if (!feed) return;

    // Append user message
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "flex items-start justify-end gap-3";
    userMsgDiv.innerHTML = `
      <div class="p-4 rounded-2xl bg-sky-600 text-white text-sm max-w-[80%] shadow-sm leading-relaxed">
        ${this.escapeHtml(message)}
      </div>
    `;
    feed.appendChild(userMsgDiv);
    feed.scrollTop = feed.scrollHeight;

    // Loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "flex items-start gap-3";
    loadingDiv.id = "ai-loading-indicator";
    loadingDiv.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0 font-bold">AI</div>
      <div class="p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Medi-Link AI analyzing...</span>
      </div>
    `;
    feed.appendChild(loadingDiv);
    feed.scrollTop = feed.scrollHeight;

    try {
      const res = await ApiClient.post("/ai/chat", {
        message,
        history: this.chatHistory
      });

      loadingDiv.remove();

      // Format markdown/newlines to HTML
      const formattedReply = this.formatMarkdown(res.reply);

      const aiMsgDiv = document.createElement("div");
      aiMsgDiv.className = "flex items-start gap-3 animate-fade-in";
      aiMsgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-xl ${res.is_emergency ? 'bg-red-600' : 'bg-emerald-600'} text-white flex items-center justify-center text-sm shrink-0 font-bold">
          ${res.is_emergency ? '🚨' : 'AI'}
        </div>
        <div class="p-4 rounded-2xl ${res.is_emergency ? 'bg-red-50 border-2 border-red-300 text-red-950' : 'bg-slate-50 border border-slate-200 text-slate-800'} text-sm max-w-[85%] space-y-3 leading-relaxed shadow-sm">
          <div>${formattedReply}</div>
          ${res.suggested_actions && res.suggested_actions.length > 0 ? `
            <div class="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
              ${res.suggested_actions.map(act => `
                <button class="ai-action-btn px-2.5 py-1 rounded-lg ${res.is_emergency ? 'bg-red-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-700 font-semibold'} text-xs hover:scale-105 transition" data-action="${act}">
                  ${act}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
      feed.appendChild(aiMsgDiv);
      feed.scrollTop = feed.scrollHeight;

      // Handle suggested action clicks
      aiMsgDiv.querySelectorAll(".ai-action-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const act = e.target.getAttribute("data-action");
          if (act.includes("Emergency") || act.includes("108") || act.includes("Trauma")) {
            window.location.hash = "#/emergency";
          } else if (act.includes("Book")) {
            window.location.hash = "#/book";
          } else if (act.includes("Pharmacy") || act.includes("Medicine")) {
            window.location.hash = "#/pharmacy";
          } else {
            this.handleUserMessage(act);
          }
        });
      });

      // Text to speech readout
      if (this.voiceOutputEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        // Read out first clean sentence
        const cleanSpoken = res.reply.replace(/[*#_`]/g, '').split('\n')[0];
        const utterance = new SpeechSynthesisUtterance(cleanSpoken);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

    } catch (err) {
      loadingDiv.remove();
      Toast.error("Failed to connect to AI Assistant");
    }
  },

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  },

  escapeHtml(string) {
    const el = document.createElement("div");
    el.innerText = string;
    return el.innerHTML;
  }
};
