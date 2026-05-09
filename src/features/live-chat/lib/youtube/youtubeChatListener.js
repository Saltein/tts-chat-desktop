import { store } from "../../../../app/store";
import { setNewYoutubeMessage, setYoutubeConnectionStatus } from "../../../../entities/connection/model/slice";


let initialized = false;

export function initYoutubeChatListener() {
    if (initialized) return;
    initialized = true;

    // Подписка на входящие сообщения Youtube
    window.electronAPI.youtube.onMessage((msg) => {
        store.dispatch(setNewYoutubeMessage(msg));
    });

    // Подписка на изменение статуса подключения
    window.electronAPI.youtube.onConnected(() => {
        store.dispatch(setYoutubeConnectionStatus(true));
    });

    window.electronAPI.youtube.onDisconnected(() => {
        store.dispatch(setYoutubeConnectionStatus(false));
    });
}
