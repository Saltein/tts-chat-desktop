const { contextBridge, ipcRenderer, shell } = require("electron");

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

        onNotice: (cb) => {
            const handler = (_, data) => cb(data);
            ipcRenderer.on("notice", handler);

            return () => ipcRenderer.removeListener("notice", handler);
        },

        onDisconnected: (callback) => {
            const handler = () => callback();
            ipcRenderer.on("vk-disconnect", handler);
            return () => ipcRenderer.removeListener("vk-disconnected", handler);
        },
    },
});
