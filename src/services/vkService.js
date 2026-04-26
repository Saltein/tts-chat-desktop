import { store } from "../app/store";
import {
    setNewVkMessage,
    setVkConnectionStatus,
} from "../entities/connection/model/slice";

const isElectron = !!window.electronAPI?.vk;

let ws = null;

export const connectVk = async (channelId) => {
    if (isElectron) {
        const success = await window.electronAPI.vk.connect(channelId);
        if (!success) {
            throw new Error("VK connect failed");
        }
        return true;
    } else {
        // Браузерный вариант через WebSocket
        return new Promise((resolve, reject) => {
            try {
                ws = new WebSocket("ws://localhost:3031");

                ws.onopen = () => {
                    console.log("[VK WebSocket] Connected to server");
                    ws.send(
                        JSON.stringify({
                            type: "vk-connect",
                            channel: channelId,
                        }),
                    );
                };

                ws.onmessage = (event) => {
                    const msg = JSON.parse(event.data);

                    switch (msg.type) {
                        case "vk-message":
                            store.dispatch(setNewVkMessage(msg.data));
                            break;
                        case "vk-connected":
                            store.dispatch(setVkConnectionStatus(true));
                            resolve(true);
                            break;
                        case "vk-disconnected":
                            store.dispatch(setVkConnectionStatus(false));
                            break;
                        case "vk-error":
                            console.error("[VK WebSocket] Error:", msg.error);
                            store.dispatch(setVkConnectionStatus(false));
                            reject(new Error(msg.error));
                            break;
                    }
                };

                ws.onerror = (error) => {
                    console.error("[VK WebSocket] Connection error:", error);
                    store.dispatch(setVkConnectionStatus(false));
                    reject(error);
                };

                ws.onclose = () => {
                    console.log("[VK WebSocket] Disconnected from server");
                    store.dispatch(setVkConnectionStatus(false));
                };

                // Таймаут подключения
                setTimeout(() => {
                    if (ws && ws.readyState !== WebSocket.OPEN) {
                        reject(new Error("VK WebSocket connection timeout"));
                    }
                }, 10000);
            } catch (error) {
                console.error("[VK WebSocket] Failed to connect:", error);
                store.dispatch(setVkConnectionStatus(false));
                reject(error);
            }
        });
    }
};

export const disconnectVk = async () => {
    if (isElectron) {
        await window.electronAPI.vk.disconnect();
    } else {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "vk-disconnect" }));
        }
        if (ws) {
            ws.close();
            ws = null;
        }
    }
};

export const initVkChatListener = () => {
    if (isElectron) {
        // Подписка на входящие сообщения VK
        window.electronAPI.vk.onMessage((msg) => {
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
    // Для браузера слушатели устанавливаются в connectVk
};
