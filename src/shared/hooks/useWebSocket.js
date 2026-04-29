// hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (channelName, userId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const wsRef = useRef(null);
    const clientIdRef = useRef(null);

    const sendMessage = useCallback(
        (message, targetClientId = null) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const messageData = {
                    type: targetClientId ? "private-message" : "send-message",
                    message: message,
                    to: targetClientId,
                    channel: channelName,
                };
                wsRef.current.send(JSON.stringify(messageData));
            }
        },
        [channelName],
    );

    const broadcast = useCallback(
        (message) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                    JSON.stringify({
                        type: "broadcast",
                        message: message,
                        channel: channelName,
                    }),
                );
            }
        },
        [channelName],
    );

    useEffect(() => {
        const ws = new WebSocket(`ws://127.0.0.1:3036`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);

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
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "joined-channel":
                    clientIdRef.current = data.clientId;
                    console.log(
                        `Joined channel ${data.channel} with ID: ${data.clientId}`,
                    );
                    break;

                case "message":
                case "broadcast":
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now(),
                            from: data.from,
                            fromClientId: data.fromClientId,
                            text: data.message,
                            timestamp: data.timestamp,
                            isPrivate: data.type === "private-message",
                        },
                    ]);
                    break;

                case "user-joined":
                    setUsers((prev) => [
                        ...prev,
                        {
                            userId: data.userId,
                            clientId: data.clientId,
                        },
                    ]);
                    break;

                case "user-left":
                    setUsers((prev) =>
                        prev.filter((u) => u.clientId !== data.clientId),
                    );
                    break;

                default:
                    console.log("Received:", data);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };

        return () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                    JSON.stringify({
                        type: "leave-channel",
                    }),
                );
                wsRef.current.close();
            }
        };
    }, [channelName, userId]);

    return {
        isConnected,
        messages,
        users,
        sendMessage,
        broadcast,
        clientId: clientIdRef.current,
    };
};
