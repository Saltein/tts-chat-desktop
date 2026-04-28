import { store } from "../../../app/store";
import { addConsoleMessage } from "../model/slice";

let initialized = false;

export function initTTSConsoleListener() {
    if (initialized) return;
    initialized = true;

    if (!window.electronAPI || !window.electronAPI.ttsConsole) {
        console.warn("Electron TTS Console API not available");
        return;
    }

    window.electronAPI.ttsConsole.onMessage((message) => {
        store.dispatch(addConsoleMessage(message));
    });
}
