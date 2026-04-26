import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { startOAuthServer, stopOAuthServer } from "./oauthServer.js";
import { spawn, exec } from "child_process";
import fs from "fs";
import { startWidgetServer, stopWidgetServer } from "./widgetServer.js";
import VKPLMessageClient from "vklive-message-client";
import { genRandStr } from "../src/shared/lib/genRandStr.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= WINDOW =================
let mainWindow = null;

// ================= TTS =================
let ttsServerProcess = null;

// ================= VK (SINGLE CLIENT ONLY) =================
let vkClient = null;
let vkConnectionId = 0;

// ================= WINDOW =================
async function createWindow() {
    const isDev = !app.isPackaged;

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 884,
        minWidth: 320,
        minHeight: 364,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: isDev,
        },
    });

    await startOAuthServer(mainWindow);
    try {
        await startWidgetServer();
    } catch (e) {
        console.error(e);
    }

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173");
    } else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}

// ================= VK CLEAN DESTROY =================
function destroyVkClient(client) {
    if (!client) return;

    try {
        console.log("[VK] destroying client...");

        client.removeAllListeners?.();

        // 🔥 kill centrifuge websocket (MAIN FIX)
        client.centrifugeClient?.socket?.close?.();
        client.centrifugeClient?.disconnect?.();

        // fallback api socket
        client.api?.socket?.close?.();

        client.disconnect?.();

        client.centrifugeClient = null;
        client.api = null;
    } catch (e) {
        console.error("[VK] destroy error:", e);
    }
}

// ================= VK CONNECT =================
ipcMain.handle("vk-connect", async (_, channel) => {
    console.log(`[VK] Connecting to channel: ${channel}`);

    const connectionId = ++vkConnectionId;

    try {
        // ❗ ALWAYS KILL OLD CLIENT
        if (vkClient) {
            destroyVkClient(vkClient);
            vkClient = null;
        }

        const client = new VKPLMessageClient({
            auth: "readonly",
            channels: [channel],
            debugLog: true,
        });

        vkClient = client;

        client.on("message", (ctx) => {
            if (vkConnectionId !== connectionId) return;

            mainWindow?.webContents.send("vk-message", {
                id: ctx.message.id,
                user: ctx.user?.name,
                text: ctx.message?.text,
            });
        });

        client.on("error", (err) => {
            console.error("[VK] error:", err);

            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: "error",
                message: `VK error: ${err.message}`,
            });

            if (vkConnectionId === connectionId) {
                mainWindow?.webContents.send("vk-disconnected");
            }
        });

        client.on("close", () => {
            console.log("[VK] closed");

            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: "error",
                message: `Отключено от VK`,
            });

            if (vkConnectionId === connectionId) {
                mainWindow?.webContents.send("vk-disconnected");
            }
        });

        await client.connect();

        vkConnectionId = connectionId;

        mainWindow?.webContents.send("vk-connected");

        mainWindow?.webContents.send("notice", {
            id: genRandStr(),
            type: "success",
            message: "Подключено к VK",
        });

        console.log("[VK] connected OK");

        return true;
    } catch (e) {
        console.error("[VK] connect error:", e);

        mainWindow?.webContents.send("vk-disconnected");

        mainWindow?.webContents.send("notice", {
            id: genRandStr(),
            type: "error",
            message: `VK connect error: ${e.message}`,
        });

        return false;
    }
});

// ================= VK DISCONNECT =================
ipcMain.handle("vk-disconnect", async () => {
    console.log("[VK] disconnect");

    vkConnectionId++;

    if (vkClient) {
        destroyVkClient(vkClient);
        vkClient = null;
    }

    mainWindow?.webContents.send("vk-disconnected");

    mainWindow?.webContents.send("notice", {
        id: genRandStr(),
        type: "warning",
        message: `Отключено от VK`,
    });

    return true;
});

// ================= TTS =================
ipcMain.handle("tts-start", async () => {
    if (ttsServerProcess && !ttsServerProcess.killed) return true;

    return new Promise((resolve, reject) => {
        try {
            const serverPath = path.join(
                __dirname,
                "tts_server",
                "tts-chat-server.exe",
            );

            ttsServerProcess = spawn(serverPath, [], {
                cwd: path.dirname(serverPath),
                stdio: ["ignore", "pipe", "pipe"],
                windowsHide: true,
            });

            ttsServerProcess.on("spawn", () => {
                console.log("[TTS] started");
                resolve(true);
            });

            ttsServerProcess.on("error", reject);
        } catch (e) {
            reject(e);
        }
    });
});

ipcMain.handle("tts-stop", async () => {
    if (!ttsServerProcess) return true;

    try {
        if (process.platform === "win32") {
            exec(`taskkill /pid ${ttsServerProcess.pid} /f /t`);
        } else {
            ttsServerProcess.kill("SIGKILL");
        }
    } catch (e) {}

    ttsServerProcess = null;
    return true;
});

// ================= WINDOW CONTROLS =================
ipcMain.on("window-close", (e) => e.sender.getOwnerBrowserWindow().close());
ipcMain.on("window-minimize", (e) =>
    e.sender.getOwnerBrowserWindow().minimize(),
);
ipcMain.on("window-maximize", (e) => {
    const win = e.sender.getOwnerBrowserWindow();
    win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on("open-external", (_, url) => shell.openExternal(url));

// ================= LIFECYCLE =================
app.whenReady().then(createWindow);

app.on("before-quit", async () => {
    if (vkClient) destroyVkClient(vkClient);

    await stopTTSServer?.();
    await stopOAuthServer?.();
    await stopWidgetServer?.();
});

app.on("window-all-closed", async () => {
    if (process.platform !== "darwin") app.quit();
});
