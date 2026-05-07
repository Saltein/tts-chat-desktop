import { app, BrowserWindow, ipcMain, shell, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { startOAuthServer, stopOAuthServer } from "./oauthServer.js";
import { spawn, exec } from "child_process";
import fs from "fs";
import { startWidgetServer, stopWidgetServer } from "./widgetServer.js";
import VKPLMessageClient from "vklive-message-client";
import { genRandStr } from "./shared/genRandStr.js";
import { TTSLogParser } from "./classes/TTSLogParser.js";
import {
    cleanupMeiFoldersAsync,
    cleanupMeiOnExit,
    startPeriodicMeiCleanup,
} from "./shared/cleanupMeiFolders.js";
import pkg from "electron-updater";
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============= SHORTCUT KEYS ==============
const SHORTCUTS = {
    "skip-audio": "CommandOrControl+Shift+.",
};

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
        minWidth: 376,
        minHeight: 364,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            // devTools: isDev,
            devTools: true,
        },
    });

    mainWindow.on("focus", () => {
        mainWindow.webContents.send("window-active", true);
    });

    mainWindow.on("blur", () => {
        mainWindow.webContents.send("window-active", false);
    });

    await startOAuthServer(mainWindow);
    try {
        await startWidgetServer((type, message) => {
            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: type,
                message: message,
            });
        });
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

// ================= TTS CLEAN DESTROY =================
function clearTempFolder() {
    const isDev = !app.isPackaged;

    const tts_temp_files = isDev
        ? path.join(__dirname, "tts_server", "tts_temp", "sounds")
        : path.join(
              // eslint-disable-next-line no-undef
              process.resourcesPath,
              "app.asar.unpacked",
              "electron",
              "tts_server",
              "tts_temp",
              "sounds",
          );

    try {
        if (fs.existsSync(tts_temp_files)) {
            const files = fs.readdirSync(tts_temp_files);

            files.forEach((file) => {
                const filePath = path.join(tts_temp_files, file);
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(`Не удалось удалить ${filePath}:`, err);
                }
            });

            console.log(`Удалено ${files.length} файлов`);
        } else {
            console.log("Папка не существует");
        }
    } catch (error) {
        console.error("Ошибка:", error);
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
            console.log("-------------------------------------message", ctx);

            mainWindow?.webContents.send("vk-message", {
                id: ctx.message.id,
                user: ctx.user?.name,
                text: ctx.message?.text,
                color: ctx.user?.nickColor,
                isModerator:
                    ctx.user?.isChatModerator || ctx.user?.isChannelModerator,
                isOwner: ctx.user?.isOwner,
            });
        });

        client.on("error", (err) => {
            console.error("[VK] error:", err);

            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: "error",
                message: `VK error: ${err.message.includes("blog_not_found") ? "Канал не существует" : err.message}`,
            });

            if (vkConnectionId === connectionId) {
                mainWindow?.webContents.send("vk-disconnected");
            }
        });

        client.on("close", () => {
            console.log("[VK] closed");

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
            message: `VK connect error: ${e.message.includes("blog_not_found") ? "Канал не существует" : e.message}`,
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
    const isDev = !app.isPackaged;
    if (ttsServerProcess && !ttsServerProcess.killed) return true;

    clearTempFolder();

    return new Promise((resolve, reject) => {
        try {
            const serverPath = isDev
                ? path.join(__dirname, "tts_server/tts-chat-server.exe")
                : path.join(
                      // eslint-disable-next-line no-undef
                      process.resourcesPath,
                      "app.asar.unpacked",
                      "electron",
                      "tts_server",
                      "tts-chat-server.exe",
                  );

            ttsServerProcess = spawn(serverPath, [], {
                cwd: path.dirname(serverPath),
                stdio: ["ignore", "pipe", "pipe"],
                windowsHide: true,
            });

            ttsServerProcess.on("spawn", () => {
                mainWindow?.webContents.send("notice", {
                    id: genRandStr(),
                    type: "info",
                    message: `Запуск TTS сервера...`,
                });
                console.log("[TTS] started");
                resolve(true);
            });

            ttsServerProcess.on("error", () => {
                mainWindow?.webContents.send("notice", {
                    id: genRandStr(),
                    type: "error",
                    message: `Ошибка запуска TTS сервера`,
                });
                reject();
            });

            const consoleParser = new TTSLogParser();

            ttsServerProcess.stdout.on("data", (data) => {
                const parsedItems = consoleParser.parse(data);
                parsedItems.forEach((item) => {
                    mainWindow?.webContents.send("tts-console-message", item);
                });
            });
            ttsServerProcess.stderr.on("data", (data) => {
                const parsedItems = consoleParser.parse(data);
                parsedItems.forEach((item) => {
                    mainWindow?.webContents.send("tts-console-message", item);
                });
            });
        } catch (e) {
            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: "error",
                message: `Ошибка запуска TTS сервера: ${e.message}`,
            });
            reject(e);
        }
    });
});

ipcMain.handle("tts-stop", async () => {
    if (!ttsServerProcess) return true;

    try {
        // eslint-disable-next-line no-undef
        if (process.platform === "win32") {
            exec(`taskkill /pid ${ttsServerProcess.pid} /f /t`);
        } else {
            ttsServerProcess.kill("SIGKILL");
        }
    } catch (e) {
        console.log(e);
    }

    ttsServerProcess = null;
    return true;
});

// ================= WINDOW CONTROLS =================
ipcMain.on("window-close", (e) => {
    const win = e.sender.getOwnerBrowserWindow();
    win.close(); // это вызовет quit → will-quit
});
ipcMain.on("window-minimize", (e) =>
    e.sender.getOwnerBrowserWindow().minimize(),
);
ipcMain.on("window-maximize", (e) => {
    const win = e.sender.getOwnerBrowserWindow();
    win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on("open-external", (_, url) => shell.openExternal(url));

// ================= AUTO UPDATER (Manual Download) ================================== AUTO UPDATER (Manual Download) =================
let pendingUpdateInfo = null; // Хранит информацию о доступном обновлении

function setupAutoUpdater() {
    // Отключаем автоматическую загрузку, только проверяем наличие
    autoUpdater.autoDownload = false; // КЛЮЧЕВОЙ ПАРАМЕТР

    // Проверка обновлений при старте (с задержкой, чтобы UI успел загрузиться)
    setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 3000);

    // События autoUpdater
    autoUpdater.on("checking-for-update", () => {
        console.log("[UPDATE] Checking for update...");
        mainWindow?.webContents.send("update-status", { status: "checking" });
    });

    autoUpdater.on("update-available", (info) => {
        console.log("[UPDATE] Update available:", info);

        // Сохраняем информацию об обновлении
        pendingUpdateInfo = info;

        // Отправляем статус, но НЕ начинаем загрузку автоматически
        mainWindow?.webContents.send("update-status", {
            status: "available",
            version: info.version,
            releaseNotes: info.releaseNotes,
            releaseDate: info.releaseDate,
        });
    });

    autoUpdater.on("update-not-available", (info) => {
        console.log("[UPDATE] No update available", info);
        pendingUpdateInfo = null;
        mainWindow?.webContents.send("update-status", {
            status: "not-available",
        });
    });

    autoUpdater.on("error", (err) => {
        console.error("[UPDATE] Error:", err);
        pendingUpdateInfo = null;
        mainWindow?.webContents.send("update-status", {
            status: "error",
            error: err.message,
        });
    });

    autoUpdater.on("download-progress", (progressObj) => {
        console.log(`[UPDATE] Download progress: ${progressObj.percent}%`);
        mainWindow?.webContents.send("update-download-progress", {
            percent: progressObj.percent,
            bytesPerSecond: progressObj.bytesPerSecond,
            transferred: progressObj.transferred,
            total: progressObj.total,
        });
    });

    autoUpdater.on("update-downloaded", (info) => {
        console.log("[UPDATE] Update downloaded:", info);
        pendingUpdateInfo = null;

        mainWindow?.webContents.send("update-status", {
            status: "downloaded",
            version: info.version,
        });
    });
}

// IPC обработчики для ручного управления
ipcMain.handle("check-for-updates", async () => {
    pendingUpdateInfo = null;
    autoUpdater.checkForUpdatesAndNotify();
    return true;
});

// Новый обработчик для ручного скачивания обновления
ipcMain.handle("download-update", async () => {
    if (pendingUpdateInfo) {
        console.log("[UPDATE] Starting manual download...");
        mainWindow?.webContents.send("update-status", {
            status: "downloading",
            version: pendingUpdateInfo.version,
        });

        // Начинаем загрузку
        autoUpdater.downloadUpdate();
        return true;
    } else {
        console.log("[UPDATE] No pending update to download");
        return false;
    }
});

ipcMain.handle("restart-and-update", async () => {
    autoUpdater.quitAndInstall();
    return true;
});

// Дополнительный обработчик для получения информации о pending обновлении
ipcMain.handle("get-pending-update", async () => {
    return pendingUpdateInfo;
});

// ================= LIFECYCLE ============================================================================ LIFECYCLE =================================
app.whenReady().then(() => {
    const shortcutSkip = globalShortcut.register(
        SHORTCUTS["skip-audio"],
        handleSkipAudio,
    );
    if (!shortcutSkip) {
        console.error(
            `Failed to register shortcut to skip audio: ${SHORTCUTS["skip-audio"]}`,
        );
        mainWindow?.webContents.send("notice", {
            id: genRandStr(),
            type: "error",
            message: `Ошибка регистрации горячей клавиши для пропуска аудио: ${SHORTCUTS["skip-audio"]}`,
        });
    }

    createWindow();
    setupAutoUpdater();
    cleanupMeiFoldersAsync(0.005);
    startPeriodicMeiCleanup(0.02, 0.005);
    cleanupMeiOnExit(); // Очищаем при выходе из приложения
});

app.on("will-quit", async (e) => {
    cleanupMeiFoldersAsync(0.005);
    clearTempFolder();
    e.preventDefault();
    await shutdown();
    app.exit(0);
});

app.on("window-all-closed", () => {
    // eslint-disable-next-line no-undef
    if (process.platform !== "darwin") {
        app.quit();
    }
});

async function shutdown() {
    console.log("[APP] shutting down...");

    try {
        if (vkClient) {
            destroyVkClient(vkClient);
            vkClient = null;
        }

        // ✅ TTS kill
        if (ttsServerProcess) {
            await new Promise((res) => {
                try {
                    // eslint-disable-next-line no-undef
                    if (process.platform === "win32") {
                        exec(
                            `taskkill /pid ${ttsServerProcess.pid} /f /t`,
                            () => res(),
                        );
                    } else {
                        ttsServerProcess.kill("SIGKILL");
                        res();
                    }
                } catch {
                    res();
                }
            });

            ttsServerProcess = null;
        }

        await stopOAuthServer?.();
        await stopWidgetServer?.();

        console.log("[APP] shutdown complete");
    } catch (e) {
        console.error("[APP] shutdown error:", e);
    }
}

function handleSkipAudio() {
    mainWindow?.webContents.send("skip-audio");
    mainWindow?.webContents.send("notice", {
        id: genRandStr(),
        type: "info",
        message: `Пропуск аудио`,
    });
}
