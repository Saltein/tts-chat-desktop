import { store } from "../../../../app/store";
import {
    setNewYoutubeMessage,
    setYoutubeConnectionStatus,
    selectYoutubeVideoId,
} from "../../../../entities/connection/model/slice";

import { getYoutubeVideoId } from "../../../../shared/lib/getYoutubeVideoId";
import {
    setYoutubeLikes,
    setYoutubeViewers,
} from "../../../stream-status/model/slice";

let initialized = false;
let interval = null;

export function initYoutubeChatListener() {
    if (initialized) return;
    initialized = true;

    // Сообщения
    window.electronAPI.youtube.onMessage((msg) => {
        store.dispatch(setNewYoutubeMessage(msg));
    });

    // Подключение
    window.electronAPI.youtube.onConnected(() => {
        store.dispatch(setYoutubeConnectionStatus(true));

        startYoutubeInfoPolling();
    });

    // Отключение
    window.electronAPI.youtube.onDisconnected(() => {
        store.dispatch(setYoutubeConnectionStatus(false));

        stopYoutubeInfoPolling();
    });

    startYoutubeInfoPolling();
}

function stopYoutubeInfoPolling() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

function startYoutubeInfoPolling() {
    stopYoutubeInfoPolling();

    async function updateInfo() {
        const state = store.getState();

        const youtubeIdDirty = selectYoutubeVideoId(state);

        const youtubeId = getYoutubeVideoId(youtubeIdDirty?.youtubeVideoId);

        if (!youtubeId) return;

        try {
            const info = await window.electronAPI.youtube.onInfo(youtubeId);

            store.dispatch(setYoutubeLikes(info.likes));
            store.dispatch(setYoutubeViewers(info.viewers));
        } catch (e) {
            console.error("[youtubeInfoPolling]", e);
        }
    }

    updateInfo();

    interval = setInterval(updateInfo, 2000);
}
