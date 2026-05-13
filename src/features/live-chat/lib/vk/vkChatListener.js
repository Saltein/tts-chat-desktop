import { store } from "../../../../app/store";
import {
    setNewVkMessage,
    setVkConnectionStatus,
} from "../../../../entities/connection/model/slice";
import { setVkLikes, setVkViewers } from "../../../stream-status/model/slice";

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

    window.electronAPI.vk.onInfo((info) => {
        console.log("[vkChatListener], info:", info);
        if (info.type === "likes") {
            store.dispatch(setVkLikes(info.data));
        }
        if (info.type === "viewers") {
            store.dispatch(setVkViewers(info.data));
        }
    });
}
