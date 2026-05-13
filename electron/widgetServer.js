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
export const WS_PORT = 3036;

export function startWidgetServer(sendNotice) {
    return new Promise((resolve, reject) => {
        const app = express();
        const DIST_PATH = path.join(__dirname, "../dist");

        // Критически важная строка: ассеты с /widget/ ищутся в dist/assets
        app.use("/widget", express.static(DIST_PATH));
        app.use(express.static(DIST_PATH));

        app.use((req, res, next) => {
            // Разрешаем только /widget и вложенные пути
            if (req.path.startsWith("/widget")) {
                return next();
            }
            // Всё остальное запрещаем
            res.status(403).send("Forbidden");
        });

        // SPA fallback: любой GET без расширения → index.html
        app.use((req, res, next) => {
            if (req.method !== "GET") return next();
            // только для widget
            if (!req.path.startsWith("/widget")) {
                return res.status(403).send("Forbidden");
            }
            if (path.extname(req.path)) return next();
            res.sendFile(path.join(DIST_PATH, "index.html"));
        });

        widgetServer = createServer(app);
        widgetServer.listen(WIDGET_PORT, async () => {
            console.log(
                `Widget server running on http://127.0.0.1:${WIDGET_PORT}`,
            );

            // Запускаем WebSocket сервер и ЖДЕМ его готовности
            await startWebSocketServer(sendNotice);

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

let clients = new Map(); // clientId -> { ws, channel, userId }
let channels = new Map(); // channel -> Set of clientIds

function startWebSocketServer(sendNotice) {
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

        // Настройка обработчиков
        wss.on("connection", (ws) => {
            let vkClient = null;
            let connectionTimeout = null;

            const clientId = generateClientId();
            clients.set(clientId, {
                ws,
                channel: null,
                userId: null,
            });

            ws.on("message", async (data) => {
                try {
                    const msg = JSON.parse(data);

                    switch (msg.type) {
                        case "join-channel":
                            handleJoinChannel(
                                clientId,
                                msg.channel,
                                msg.userId,
                            );
                            break;

                        case "send-message":
                            handleSendMessage(
                                clientId,
                                msg.to,
                                msg.message,
                                msg.channel,
                            );
                            break;

                        case "private-message":
                            handlePrivateMessage(
                                clientId,
                                msg.targetClientId,
                                msg.message,
                            );
                            break;

                        case "broadcast":
                            handleBroadcast(clientId, msg.message, msg.channel);
                            break;

                        case "leave-channel":
                            handleLeaveChannel(clientId);
                            break;

                        case "vk-connect": {
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
                                                    err.message ||
                                                    "Unknown error",
                                            }),
                                        );
                                    }
                                });

                                vkClient.on("close", () => {
                                    console.log(
                                        "[VK WebSocket] Connection closed",
                                    );
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
                                ws.send(
                                    JSON.stringify({ type: "vk-connected" }),
                                );

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
                                        error:
                                            error.message ||
                                            "Connection failed",
                                    }),
                                );
                            }
                            break;
                        }
                        case "vk-disconnect": {
                            console.log(
                                "[VK WebSocket] Disconnecting VK client",
                            );
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
                            ws.send(
                                JSON.stringify({ type: "vk-disconnected" }),
                            );
                            break;
                        }
                        case "tts-server-ready": {
                            console.log("[TTS WebSocket] TTS server ready");
                            sendNotice("success", "Сервер TTS запущен");
                            break;
                        }
                        case "tts-server-error": {
                            console.error(
                                "[TTS WebSocket] TTS server error:",
                                msg,
                            );
                            sendNotice("error", `Ошибка TTS: ${msg.message}`);
                            break;
                        }
                        case "tts-server-fatal": {
                            console.error(
                                "[TTS WebSocket] TTS server fatal:",
                                msg,
                            );
                            sendNotice(
                                "error",
                                `Критическая ошибка: ${msg.data?.message}`,
                            );
                            break;
                        }
                        case "tts-download": {
                            const status = msg.data?.status;
                            if (status === "downloading") {
                                console.log(
                                    "[TTS WebSocket] TTS downloading...",
                                );
                                sendNotice(
                                    "info",
                                    "Загрузка голосовой модели...",
                                );
                            } else if (status === "success") {
                                console.log("[TTS WebSocket] TTS downloaded");
                                sendNotice(
                                    "success",
                                    "Голосовая модель успешно загружена",
                                );
                            }
                            break;
                        }
                        default:
                            console.log("Unknown message type:", msg.type);
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
                handleClientDisconnect(clientId);

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

// Вспомогательные функции
function generateClientId() {
    return Math.random().toString(36).substring(2, 15);
}

function handleJoinChannel(clientId, channel, userId) {
    const client = clients.get(clientId);
    if (!client) return;

    // Покидаем предыдущий канал
    if (client.channel) {
        const oldChannelClients = channels.get(client.channel);
        if (oldChannelClients) {
            oldChannelClients.delete(clientId);
        }
    }

    // Присоединяемся к новому каналу
    client.channel = channel;
    client.userId = userId || clientId;

    if (!channels.has(channel)) {
        channels.set(channel, new Set());
    }
    channels.get(channel).add(clientId);

    // Уведомляем клиента
    client.ws.send(
        JSON.stringify({
            type: "joined-channel",
            channel: channel,
            clientId: clientId,
        }),
    );

    // Уведомляем других в канале
    broadcastToChannel(channel, clientId, {
        type: "user-joined",
        userId: client.userId,
        clientId: clientId,
    });

    console.log(`Client ${clientId} joined channel: ${channel}`);
}

function handleSendMessage(clientId, targetClientId, message, channel) {
    const sender = clients.get(clientId);
    if (!sender) return;

    const messageData = {
        type: "message",
        from: sender.userId,
        fromClientId: clientId,
        message: message,
        timestamp: Date.now(),
    };

    if (targetClientId) {
        // Отправляем конкретному клиенту
        const target = clients.get(targetClientId);
        if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify(messageData));
        }
    } else if (channel) {
        // Отправляем в канал
        broadcastToChannel(channel, clientId, messageData);
    }
}

function handlePrivateMessage(clientId, targetClientId, message) {
    handleSendMessage(clientId, targetClientId, message, null);
}

function handleBroadcast(clientId, message, channel) {
    const sender = clients.get(clientId);
    if (!sender) return;

    const messageData = {
        type: "broadcast",
        from: sender.userId,
        fromClientId: clientId,
        message: message,
        timestamp: Date.now(),
    };

    if (channel) {
        broadcastToChannel(channel, clientId, messageData);
    } else {
        // Рассылаем всем клиентам
        clients.forEach((client, id) => {
            if (id !== clientId && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(messageData));
            }
        });
    }
}

function broadcastToChannel(channel, senderClientId, data) {
    const channelClients = channels.get(channel);
    if (!channelClients) return;

    channelClients.forEach((clientId) => {
        const client = clients.get(clientId);
        if (
            client &&
            clientId !== senderClientId &&
            client.ws.readyState === WebSocket.OPEN
        ) {
            client.ws.send(JSON.stringify(data));
        }
    });
}

function handleLeaveChannel(clientId) {
    const client = clients.get(clientId);
    if (client && client.channel) {
        const channelClients = channels.get(client.channel);
        if (channelClients) {
            channelClients.delete(clientId);

            // Уведомляем остальных
            broadcastToChannel(client.channel, clientId, {
                type: "user-left",
                userId: client.userId,
                clientId: clientId,
            });
        }
        client.channel = null;
    }
}

function handleClientDisconnect(clientId) {
    const client = clients.get(clientId);
    if (client && client.channel) {
        handleLeaveChannel(clientId);
    }
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
}
