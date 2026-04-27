import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import VKPLMessageClient from "vklive-message-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let widgetServer = null;
let wss = null;

const WIDGET_PORT = 3030;
const WS_PORT = 3036;

export function startWidgetServer(sendNotice) {
    return new Promise((resolve, reject) => {
        const app = express();
        const DIST_PATH = path.join(__dirname, "../dist");

        // Критически важная строка: ассеты с /widget/ ищутся в dist/assets
        app.use("/widget", express.static(DIST_PATH));
        app.use(express.static(DIST_PATH));

        // SPA fallback: любой GET без расширения → index.html
        app.use((req, res, next) => {
            if (req.method !== "GET") return next();
            if (path.extname(req.path)) return next();
            res.sendFile(path.join(DIST_PATH, "index.html"));
        });

        widgetServer = createServer(app);
        widgetServer.listen(WIDGET_PORT, async () => {
            console.log(
                `Widget server running on http://127.0.0.1:${WIDGET_PORT}`,
            );

            // Запускаем WebSocket сервер и ЖДЕМ его готовности
            await startVkWebSocketServer(sendNotice);

            // Только после полной готовности WebSocket сервера,
            // отправляем сигнал для запуска TTS сервера
            console.log(
                "WebSocket server is ready, signaling TTS server to start...",
            );
            sendNotice("info", "WebSocket сервер готов, запуск TTS...");

            // Даем небольшую задержку для уверенности, что WebSocket сервер полностью инициализирован
            setTimeout(() => {
                resolve(WIDGET_PORT);
            }, 500);
        });
        widgetServer.on("error", reject);
    });
}

function startVkWebSocketServer(sendNotice) {
    return new Promise((resolve, reject) => {
        wss = new WebSocketServer({ port: WS_PORT });

        // Ждем, пока сервер реально начнет слушать порт
        wss.on("listening", () => {
            console.log(
                `VK WebSocket server running on ws://127.0.0.1:${WS_PORT}`,
            );

            // Отправляем уведомление о готовности WebSocket сервера
            sendNotice(
                "success",
                `WebSocket сервер запущен на порту ${WS_PORT}`,
            );

            resolve();
        });

        wss.on("error", (error) => {
            console.error("WebSocket server error:", error);
            sendNotice(
                "error",
                `Ошибка запуска WebSocket сервера: ${error.message}`,
            );
            reject(error);
        });

        // Настройка обработчиков (остальной код)
        wss.on("connection", (ws, req) => {
            let vkClient = null;
            let connectionTimeout = null;

            console.log(
                "[VK WebSocket] Client connected: ",
                req.headers["sec-websocket-key"],
            );

            ws.on("message", async (data) => {
                try {
                    const msg = JSON.parse(data);

                    if (msg.type === "vk-connect") {
                        console.log(
                            `[VK WebSocket] Connecting to channel: ${msg.channel}`,
                        );

                        // Очищаем предыдущий клиент если есть
                        if (vkClient) {
                            try {
                                vkClient.disconnect();
                            } catch (e) {
                                console.error(
                                    "[VK WebSocket] Error disconnecting old client:",
                                    e,
                                );
                            }
                        }

                        try {
                            vkClient = new VKPLMessageClient({
                                auth: "readonly",
                                channels: [msg.channel],
                                debugLog: true,
                            });

                            vkClient.on("message", (ctx) => {
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(
                                        JSON.stringify({
                                            type: "vk-message",
                                            data: {
                                                id: ctx.message.id,
                                                user: ctx.user?.name,
                                                text: ctx.message?.text,
                                            },
                                        }),
                                    );
                                }
                            });

                            vkClient.on("error", (err) => {
                                console.error(
                                    "[VK WebSocket] Client error:",
                                    err,
                                );
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(
                                        JSON.stringify({
                                            type: "vk-error",
                                            error:
                                                err.message || "Unknown error",
                                        }),
                                    );
                                }
                            });

                            vkClient.on("close", () => {
                                console.log("[VK WebSocket] Connection closed");
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(
                                        JSON.stringify({
                                            type: "vk-disconnected",
                                        }),
                                    );
                                }
                            });

                            await vkClient.connect();

                            console.log(
                                "[VK WebSocket] Connected successfully",
                            );
                            ws.send(JSON.stringify({ type: "vk-connected" }));

                            // Сбрасываем таймаут если он был
                            if (connectionTimeout) {
                                clearTimeout(connectionTimeout);
                                connectionTimeout = null;
                            }
                        } catch (error) {
                            console.error(
                                "[VK WebSocket] Connection error:",
                                error,
                            );
                            ws.send(
                                JSON.stringify({
                                    type: "vk-error",
                                    error: error.message || "Connection failed",
                                }),
                            );
                        }
                    } else if (msg.type === "vk-disconnect") {
                        console.log("[VK WebSocket] Disconnecting VK client");
                        if (vkClient) {
                            try {
                                vkClient.disconnect();
                            } catch (e) {
                                console.error(
                                    "[VK WebSocket] Error during disconnect:",
                                    e,
                                );
                            }
                            vkClient = null;
                        }
                        ws.send(JSON.stringify({ type: "vk-disconnected" }));
                    } else if (msg.type === "tts-server-ready") {
                        console.log("[TTS WebSocket] TTS server ready");
                        sendNotice("success", "Сервер TTS запущен");
                    } else if (msg.type === "tts-server-error") {
                        console.error("[TTS WebSocket] TTS server error:", msg);
                        sendNotice("error", `Ошибка TTS: ${msg.message}`);
                    } else if (msg.type === "tts-server-fatal") {
                        console.error("[TTS WebSocket] TTS server fatal:", msg);
                        sendNotice(
                            "error",
                            `Критическая ошибка: ${msg.data?.message}`,
                        );
                    } else if (msg.type === "tts-download") {
                        const status = msg.data?.status;
                        if (status === "downloading") {
                            console.log("[TTS WebSocket] TTS downloading...");
                            sendNotice("info", "Загрузка голосовой модели...");
                        } else if (status === "success") {
                            console.log("[TTS WebSocket] TTS downloaded");
                            sendNotice(
                                "success",
                                "Голосовая модель успешно загружена",
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        "[VK WebSocket] Error processing message:",
                        error,
                    );
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: "vk-error",
                                error: "Failed to process message",
                            }),
                        );
                    }
                }
            });

            ws.on("close", () => {
                console.log("[VK WebSocket] Client disconnected");
                if (vkClient) {
                    try {
                        vkClient.disconnect();
                    } catch (e) {
                        console.error(
                            "[VK WebSocket] Error disconnecting client on close:",
                            e,
                        );
                    }
                    vkClient = null;
                }
                if (connectionTimeout) {
                    clearTimeout(connectionTimeout);
                    connectionTimeout = null;
                }
            });

            ws.on("error", (error) => {
                console.error("[VK WebSocket] WebSocket error:", error);
            });

            // Отправляем подтверждение подключения
            ws.send(
                JSON.stringify({
                    type: "connected",
                    message: "WebSocket connection established",
                }),
            );
        });
    });
}

export function stopWidgetServer() {
    if (wss) {
        wss.close(() => {
            console.log("VK WebSocket server stopped");
        });
        wss = null;
    }
    if (widgetServer) {
        widgetServer.close();
        widgetServer = null;
    }
}
