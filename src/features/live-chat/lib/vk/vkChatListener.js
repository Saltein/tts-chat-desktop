import { store } from "../../../../app/store";
import {
    setNewVkMessage,
    setVkConnectionStatus,
} from "../../../../entities/connection/model/slice";

let initialized = false;

export function initVkChatListener() {
    if (initialized) return;
    initialized = true;

    // Подписка на входящие сообщения VK
    window.electronAPI.vk.onMessage((msg) => {
        console.log("[vkChatListener], message:", msg);
        store.dispatch(setNewVkMessage(msg));
    });

    // Подписка на изменение статуса подключения
    window.electronAPI.vk.onConnected(() => {
        store.dispatch(setVkConnectionStatus(true));
    });

    window.electronAPI.vk.onDisconnected(() => {
        store.dispatch(setVkConnectionStatus(false));
    });
}
