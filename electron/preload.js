// eslint-disable-next-line no-undef
const { contextBridge, ipcRenderer } = require("electron");

console.log("PRELOAD LOADED");

contextBridge.exposeInMainWorld("electronAPI", {
    close: () => ipcRenderer.send("window-close"),
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    openExternal: (url) => ipcRenderer.send("open-external", url),
    onGoogleOAuthCode: (callback) => {
        const handler = (event, code) => callback(code);
        ipcRenderer.on("google-oauth-code", handler);
        return () => ipcRenderer.removeListener("google-oauth-code", handler);
    },
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },

    startTTSServer: () => ipcRenderer.invoke("tts-start"),
    stopTTSServer: () => ipcRenderer.invoke("tts-stop"),
    onTTSError: (callback) => {
        const handler = (event, error) => callback(error);
        ipcRenderer.on("tts-server-error", handler);
        return () => ipcRenderer.removeListener("tts-server-error", handler);
    },

    onSkipAudio: (callback) => {
        const handler = () => callback();
        ipcRenderer.on("skip-audio", handler);
        return () => ipcRenderer.removeListener("skip-audio", handler);
    },

    onWindowActive: (callback) => {
        const handler = (_, isActive) => callback(isActive);
        ipcRenderer.on("window-active", handler);
        return () => ipcRenderer.removeListener("window-active", handler);
    },

    vk: {
        connect: (channel) => ipcRenderer.invoke("vk-connect", channel),
        disconnect: () => ipcRenderer.invoke("vk-disconnect"),

        onMessage: (callback) => {
            const handler = (_, data) => callback(data);
            ipcRenderer.on("vk-message", handler);
            return () => ipcRenderer.removeListener("vk-message", handler);
        },

        onConnected: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("vk-connected", handler);
            return () => ipcRenderer.removeListener("vk-connected", handler);
        },

        onNotice: (callback) => {
            const handler = (_, data) => callback(data);
            ipcRenderer.on("notice", handler);

            return () => ipcRenderer.removeListener("notice", handler);
        },

        onDisconnected: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("vk-disconnected", handler);
            return () => ipcRenderer.removeListener("vk-disconnected", handler);
        },
    },

    youtube: {
        connect: (videoId) => ipcRenderer.invoke("youtube-connect", videoId),
        disconnect: () => ipcRenderer.invoke("youtube-disconnect"),

        onMessage: (callback) => {
            const handler = (_, data) => callback(data);
            ipcRenderer.on("youtube-message", handler);
            return () => ipcRenderer.removeListener("youtube-message", handler);
        },

        onConnected: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("youtube-connected", handler);
            return () =>
                ipcRenderer.removeListener("youtube-connected", handler);
        },

        onDisconnected: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("youtube-disconnected", handler);
            return () =>
                ipcRenderer.removeListener("youtube-disconnected", handler);
        },
    },

    ttsConsole: {
        onMessage: (callback) => {
            const handler = (_, data) => callback(data);
            ipcRenderer.on("tts-console-message", handler);
            return () =>
                ipcRenderer.removeListener("tts-console-message", handler);
        },
    },

    updater: {
        checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
        downloadUpdate: () => ipcRenderer.invoke("download-update"), // новый метод
        restartAndUpdate: () => ipcRenderer.invoke("restart-and-update"),
        getPendingUpdate: () => ipcRenderer.invoke("get-pending-update"), // получить ожидающее обновление

        onUpdateStatus: (callback) =>
            ipcRenderer.on("update-status", (_, data) => callback(data)),

        onUpdateProgress: (callback) =>
            ipcRenderer.on("update-download-progress", (_, data) =>
                callback(data),
            ),

        // Убираем слушатели при необходимости
        removeListeners: () => {
            ipcRenderer.removeAllListeners("update-status");
            ipcRenderer.removeAllListeners("update-download-progress");
        },
    },
});
