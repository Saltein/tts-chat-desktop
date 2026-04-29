// shared/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (channelName, userId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const wsRef = useRef(null);
    const clientIdRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const shouldReconnectRef = useRef(true);

    const connect = useCallback(() => {
        // Очищаем предыдущие таймауты
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        const ws = new WebSocket("ws://127.0.0.1:3036");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[useWebSocket] ✅ WebSocket connected");
            setIsConnected(true);
            shouldReconnectRef.current = true;

            // Присоединяемся к каналу
            ws.send(
                JSON.stringify({
                    type: "join-channel",
                    channel: channelName,
                    userId: userId,
                }),
            );
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[useWebSocket] 📨 Received message:", data);

                switch (data.type) {
                    case "joined-channel":
                        clientIdRef.current = data.clientId;
                        console.log(
                            `Joined channel ${data.channel} with ID: ${data.clientId}`,
                        );
                        break;

                    case "message":
                        { let messageText = data.message;
                        try {
                            const parsed = JSON.parse(data.message);
                            messageText = parsed;
                        } catch (e) {
                            console.log(e);
                        }

                        const newMessage = {
                            id: data.timestamp,
                            text: messageText,
                            user: data.from,
                            timestamp: data.timestamp,
                            fromClientId: data.fromClientId,
                        };

                        setMessages((prev) => [...prev, newMessage]);
                        break; }

                    case "user-joined":
                        console.log(`User ${data.userId} joined`);
                        break;

                    case "user-left":
                        console.log(`User ${data.userId} left`);
                        break;

                    default:
                        console.log(
                            "[useWebSocket] Unknown message type:",
                            data.type,
                        );
                }
            } catch (error) {
                console.error("[useWebSocket] Error parsing message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("[useWebSocket] WebSocket error:", error);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log("[useWebSocket] WebSocket disconnected");
            setIsConnected(false);

            // Пытаемся переподключиться через 5 секунд
            if (shouldReconnectRef.current) {
                console.log(
                    "[useWebSocket] 🔄 Attempting to reconnect in 5 seconds...",
                );
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log("[useWebSocket] 🔄 Reconnecting...");
                    // eslint-disable-next-line react-hooks/immutability
                    connect();
                }, 5000);
            }
        };
    }, [channelName, userId]);

    const sendMessage = useCallback(
        (message, targetClientId = null) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const messageData = {
                    type: targetClientId ? "private-message" : "send-message",
                    message:
                        typeof message === "string"
                            ? message
                            : JSON.stringify(message),
                    to: targetClientId,
                    channel: channelName,
                };
                wsRef.current.send(JSON.stringify(messageData));
                console.log("[useWebSocket] 📤 Sent message:", messageData);
            } else {
                console.warn("[useWebSocket] WebSocket not connected");
            }
        },
        [channelName],
    );

    const broadcast = useCallback(
        (message) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const messageData = {
                    type: "send-message",
                    message:
                        typeof message === "string"
                            ? message
                            : JSON.stringify(message),
                    channel: channelName,
                };
                wsRef.current.send(JSON.stringify(messageData));
                console.log("[useWebSocket] 📡 Broadcast:", messageData);
            } else {
                console.warn("[useWebSocket] WebSocket not connected");
            }
        },
        [channelName],
    );

    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                    type: "leave-channel",
                }),
            );
            wsRef.current.close();
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // eslint-disable-next-line react-hooks/refs
    return {
        isConnected,
        messages,
        sendMessage,
        broadcast,
        // eslint-disable-next-line react-hooks/refs
        clientId: clientIdRef.current,
        disconnect, // Опционально: даем возможность вручную отключиться
    };
};
