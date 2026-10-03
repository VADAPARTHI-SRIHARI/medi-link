/**
 * MEDI-LINK Easy Mode & Accessibility Controller
 * Tailored for senior citizens, low-vision patients, and first-time digital healthcare users.
 */

import { store } from "../config.js";
import { Toast } from "./toast.js";

export class EasyModeController {
  static toggle() {
    const current = store.get().easyMode;
    const newState = !current;
    store.set({ easyMode: newState });

    if (newState) {
      Toast.success("Easy Mode Activated: Extra Large Fonts, High Contrast, Elder-friendly Layout");
      EasyModeController.speak("Easy Mode activated. Fonts are now larger and contrast is enhanced.");
    } else {
      Toast.info("Standard Mode restored.");
    }
  }

  static speak(text) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for elderly clarity
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}
