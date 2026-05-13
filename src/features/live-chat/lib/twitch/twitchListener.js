import { store } from "../../../../app/store";
import { setTwitchViewers } from "../../../stream-status/model/slice";

const twitchAppId = import.meta.env.VITE_TWITCH_APP_ID;
const twitchAppSecret = import.meta.env.VITE_TWITCH_APP_SECRET;

let pollingInterval = null;
let currentChannelName = null;

export function initTwitchListener(channelName) {
    // Убрали проверку initialized
    startTwitchPolling(channelName);
}

export function startTwitchPolling(channelName, intervalMs = 10000) {
    console.log("[TwitchListener] startTwitchPolling", channelName);

    // Если такой же канал и пуллинг уже идет - не перезапускаем
    if (currentChannelName === channelName && pollingInterval) {
        return;
    }

    if (!channelName) return;

    stopTwitchPolling(); // Останавливаем старый пуллинг
    currentChannelName = channelName;

    async function fetchViewers() {
        if (!currentChannelName) return;

        try {
            const info = await window.electronAPI.twitch.getStreamInfo({
                channelName: currentChannelName,
                twitchAppId,
                twitchAppSecret,
            });
            console.log("[TwitchListener] info:", info);
            const viewers = info.viewer_count || info.viewers || 0;
            store.dispatch(setTwitchViewers(viewers));
        } catch (error) {
            console.error("[TwitchListener] Ошибка получения зрителей:", error);
            store.dispatch(setTwitchViewers(0));
        }
    }

    fetchViewers();
    pollingInterval = setInterval(fetchViewers, intervalMs);
}

export function stopTwitchPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    currentChannelName = null;
    store.dispatch(setTwitchViewers(0));
}
