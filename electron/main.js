import {
    app,
    BrowserWindow,
    ipcMain,
    shell,
    globalShortcut,
    protocol,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
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
import { Innertube } from "youtubei.js";
import {
    clearMessageFromEmojis,
    parseYoutubeEmojisToHTML,
} from "./shared/parseYoutubeEmojisToHTML.js";
import {
    clearMessageFromVkEmojis,
    parseVkEmojisToHTML,
} from "./shared/parseVkEmojisToHTML.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============= SHORTCUT KEYS ==============
const SHORTCUTS = {
    "skip-audio": "CommandOrControl+Shift+.",
    "play-last-message": "CommandOrControl+Shift+,",
};

// ================= WINDOW =================
let mainWindow = null;

// ================= TTS =================
let ttsServerProcess = null;

// ================= VK =================
let vkClient = null;
let vkConnectionId = 0;

// ================= YOUTUBE =================
let youtubeLiveChat = null;
let youtubeConnectionId = 0;

// ================= WINDOW =================
async function createWindow() {
    const isDev = !app.isPackaged;

    mainWindow = new BrowserWindow({
        width: 1024,
        height: 720,
        minWidth: 376,
        minHeight: 404,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: isDev,
            // devTools: true,
        },
    });

    mainWindow.on("focus", () => {
        mainWindow.webContents.send("window-active", true);
    });

    mainWindow.on("blur", () => {
        mainWindow.webContents.send("window-active", false);
    });

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

// ================= YOUTUBE CLEAN DESTROY =================
function destroyYoutubeLiveChat(livechat) {
    if (!livechat) return;

    try {
        console.log("[YOUTUBE] destroying livechat...");

        livechat.removeAllListeners?.();

        // главное
        livechat.stop?.();

        // иногда полезно
        livechat.running = false;
    } catch (e) {
        console.error("[YOUTUBE] destroy error:", e);
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

            console.log("[VK message]", ctx);

            console.log(
                "[VK parsed message]",
                parseVkEmojisToHTML(ctx?.message?.text, ctx?.message?.smiles),
            );

            const parsedMessage = parseVkEmojisToHTML(
                ctx?.message?.text,
                ctx?.message?.smiles,
            );

            const noEmojisVk = clearMessageFromVkEmojis(
                ctx?.message?.text,
                ctx?.message?.smiles,
            );

            console.log("[main.js], noEmojis", noEmojisVk);

            mainWindow?.webContents.send("vk-message", {
                id: ctx.message.id,
                user: ctx.user?.name,
                text: parsedMessage,
                clearMessage: noEmojisVk || " ",
                color: ctx.user?.nickColor,
                isModerator:
                    ctx.user?.isChatModerator || ctx.user?.isChannelModerator,
                isOwner: ctx.user?.isOwner,
            });
        });

        /*
        🔁 Обновление библиотеки
        
        Когда выйдет новая версия:
        npm update vklive-message-client

        Потом:
        npx patch-package vklive-message-client
        */
        client.on("raw", (pushData) => {
            if (
                pushData?.push?.pub?.data?.counter &&
                pushData?.push?.pub?.data?.type === "stream_like_counter"
            ) {
                mainWindow?.webContents.send("vk-info", {
                    type: "likes",
                    data: pushData?.push?.pub?.data?.counter,
                });
            }
            if (
                pushData?.push?.pub?.data?.data?.stream?.viewers &&
                pushData?.push?.pub?.data?.type === "stream_slot_online_status"
            ) {
                mainWindow?.webContents.send("vk-info", {
                    type: "viewers",
                    data: pushData?.push?.pub?.data?.data?.stream?.viewers,
                });
            }
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

// ================= YouTube CONNECT =================
const youtube = await Innertube.create();

ipcMain.handle("youtube-connect", async (_, videoId) => {
    const connectionId = ++youtubeConnectionId;
    // убиваем старый чат
    if (youtubeLiveChat) {
        destroyYoutubeLiveChat(youtubeLiveChat);
        youtubeLiveChat = null;
    }

    try {
        const info = await youtube.getInfo(videoId);
        const livechat = info.getLiveChat();

        if (!livechat) {
            console.log("[YOUTUBE] У трансляции нет live-чата");

            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: "error",
                message: `У трансляции нет live-чата`,
            });

            return false;
        }

        youtubeLiveChat = livechat;

        console.log("[YOUTUBE] connected");

        mainWindow?.webContents.send("notice", {
            id: genRandStr(),
            type: "success",
            message: `Подключено к чату YouTube: ${info?.basic_info?.channel?.name}`,
        });

        livechat.on("chat-update", (action) => {
            // защита от старых подключений
            if (youtubeConnectionId !== connectionId) return;

            const item = action.item;

            const message = {
                message: { text: parseYoutubeEmojisToHTML(item?.message) },
                clearMessage: clearMessageFromEmojis(item?.message) || " ",
                user: item?.author?.name,
                isModerator: item?.author?.is_moderator,
                isOwner: item?.author?.badges[0]?.tooltip === "Owner",
            };

            mainWindow?.webContents.send("youtube-message", message);
        });

        livechat.on("error", (err) => {
            console.error("[YOUTUBE] error:", err);

            mainWindow?.webContents.send("notice", {
                id: genRandStr(),
                type: "error",
                message: `Ошибка YouTube: ${err.message}`,
            });

            if (youtubeConnectionId === connectionId) {
                mainWindow?.webContents.send("youtube-disconnected");
            }
        });

        livechat.on("end", () => {
            console.log("[YOUTUBE] ended");

            if (youtubeConnectionId === connectionId) {
                mainWindow?.webContents.send("youtube-disconnected");
            }
        });

        livechat.start();

        mainWindow?.webContents.send("youtube-connected");

        return true;
    } catch (e) {
        console.error("[YOUTUBE] connect error FULL:", e);
        console.error("[YOUTUBE] error stack:", e.stack);
        console.error("[YOUTUBE] error message:", e.message);

        mainWindow?.webContents.send("youtube-disconnected");

        mainWindow?.webContents.send("notice", {
            id: genRandStr(),
            type: "error",
            message: `Ошибка подключения YouTube: ${e.message}`,
        });

        return false;
    }
});

// ================= YouTube DISCONNECT =================
ipcMain.handle("youtube-disconnect", async () => {
    console.log("[YOUTUBE] disconnect");

    youtubeConnectionId++;

    if (youtubeLiveChat) {
        destroyYoutubeLiveChat(youtubeLiveChat);
        youtubeLiveChat = null;
    }

    mainWindow?.webContents.send("youtube-disconnected");

    mainWindow?.webContents.send("notice", {
        id: genRandStr(),
        type: "warning",
        message: `Отключено от YouTube`,
    });

    return true;
});

// ================= Youtube Info =================
ipcMain.handle("youtube-info", async (_, videoId) => {
    try {
        const info = await youtube.getInfo(videoId);

        return {
            title: info.basic_info.title,
            live: info.basic_info.is_live,
            viewers:
                info.basic_info.concurrent_view_count ||
                info.primary_info?.view_count?.original_view_count,
            likes: info.basic_info.like_count,
            views: info.basic_info.view_count,
        };
    } catch (err) {
        console.error("[main.js] youtube info error:", err);
        return null;
    }
});

// ================= Twitch Info =================
let twitchAccessToken = null;
let tokenExpirationTime = null;

async function getTwitchAccessToken(twitchAppId, twitchAppSecret) {
    // Проверяем, есть ли валидный токен (с запасом в 1 час)
    if (
        twitchAccessToken &&
        tokenExpirationTime &&
        Date.now() < tokenExpirationTime - 3600000
    ) {
        return twitchAccessToken;
    }

    try {
        const params = new URLSearchParams({
            client_id: twitchAppId,
            client_secret: twitchAppSecret,
            grant_type: "client_credentials",
        });

        const response = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (data.access_token) {
            twitchAccessToken = data.access_token;
            // Токен живет expires_in секунд, устанавливаем время истечения
            tokenExpirationTime = Date.now() + data.expires_in * 1000;
            console.log(
                "[TWITCH] Token получен, истекает через",
                data.expires_in,
                "секунд",
            );
            return twitchAccessToken;
        } else {
            console.error("[TWITCH] Ошибка получения токена:", data);
            return null;
        }
    } catch (error) {
        console.error("[TWITCH] Ошибка запроса токена:", error);
        return null;
    }
}

// Обработчик для получения информации о стриме Twitch
ipcMain.handle("twitch-get-stream-info", async (_, connectObj) => {
    try {
        const token = await getTwitchAccessToken(
            connectObj.twitchAppId,
            connectObj.twitchAppSecret,
        );
        if (!token) {
            console.error("[TWITCH] Нет токена доступа");
            return null;
        }

        const url = `https://api.twitch.tv/helix/streams?user_login=${connectObj.channelName.toLowerCase()}`;

        const response = await fetch(url, {
            headers: {
                "Client-ID": connectObj.twitchAppId,
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.error) {
            console.error("[TWITCH] Ошибка API:", data);
            return null;
        }

        if (data.data && data.data.length > 0) {
            const stream = data.data[0];
            return {
                isLive: true,
                viewers: stream.viewer_count, // Количество зрителей
                title: stream.title,
                gameName: stream.game_name,
                startedAt: stream.started_at,
                thumbnailUrl: stream.thumbnail_url,
            };
        } else {
            return {
                isLive: false,
                viewerCount: 0,
            };
        }
    } catch (error) {
        console.error("[TWITCH] Ошибка получения информации:", error);
        return null;
    }
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
    protocol.handle("assets", (request) => {
        const url = new URL(request.url);

        const filePath = path.join(
            __dirname,
            "shared",
            "assets",
            url.hostname,
            decodeURIComponent(url.pathname).replace(/^\/+/, ""),
        );

        console.log("[ASSETS PATH]", filePath);

        if (!fs.existsSync(filePath)) {
            console.error("[ASSETS NOT FOUND]", filePath);
            return new Response("Not found", { status: 404 });
        }

        const data = fs.readFileSync(filePath);

        return new Response(data, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "no-cache",
            },
        });
    });

    // // Горячие клавиши ==============================================================
    // Пропуск аудио
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

    // Озвучка последнего сообщения
    const shortcutPlayLast = globalShortcut.register(
        SHORTCUTS["play-last-message"],
        handlePlayLastMessage,
    );

    if (!shortcutPlayLast) {
        console.error(
            `Failed to register shortcut to play last message: ${SHORTCUTS["play-last-message"]}`,
        );
        mainWindow?.webContents.send("notice", {
            id: genRandStr(),
            type: "error",
            message: `Ошибка регистрации горячей клавиши для озвучки последнего сообщения: ${SHORTCUTS["play-last-message"]}`,
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
        if (youtubeLiveChat) {
            destroyYoutubeLiveChat(youtubeLiveChat);
            youtubeLiveChat = null;
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

function handlePlayLastMessage() {
    mainWindow?.webContents.send("play-last-message");
    mainWindow?.webContents.send("notice", {
        id: genRandStr(),
        type: "info",
        message: `Воспроизведение последнего сообщения`,
    });
}
