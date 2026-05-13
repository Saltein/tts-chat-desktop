import { useSelector } from "react-redux";
import {
    selectLastMessage,
    selectTwitchConnectionStatus,
    selectVkConnectionStatus,
    selectYoutubeConnectionStatus,
} from "../../../../entities/connection/model/slice";
import { useEffect, useRef } from "react";
import { useWebSocket } from "../../../../shared/hooks/useWebSocket";
import {
    selectTwitchStatus,
    selectVkStatus,
    selectYoutubeStatus,
} from "../../../stream-status/model/slice";

export const SendToWidget = () => {
    const { isConnected, sendMessage } = useWebSocket("client", "client");
    const message = useSelector(selectLastMessage)[0];

    const ytStats = useSelector(selectYoutubeStatus);
    const vkStats = useSelector(selectVkStatus);
    const twStats = useSelector(selectTwitchStatus);

    const ytConnected = useSelector(selectYoutubeConnectionStatus);
    const vkConnected = useSelector(selectVkConnectionStatus);
    const twConnected = useSelector(selectTwitchConnectionStatus);

    const sentIdsRef = useRef(new Set());

    useEffect(() => {
        if (message && isConnected && message.id) {
            if (!sentIdsRef.current.has(message.id)) {
                sentIdsRef.current.add(message.id);
                sendMessage(JSON.stringify({ ...message, type: "message" }));

                setTimeout(() => {
                    sentIdsRef.current.delete(message.id);
                }, 3000);
            }
        }
    }, [message, isConnected, sendMessage]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (ytConnected && ytStats) {
                sendMessage(JSON.stringify({ ...ytStats, type: "ytStats" }));
            }
            if (vkConnected && vkStats) {
                sendMessage(JSON.stringify({ ...vkStats, type: "vkStats" }));
            }
            if (twConnected && twStats) {
                sendMessage(JSON.stringify({ ...twStats, type: "twStats" }));
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [
        sendMessage,
        ytConnected,
        vkConnected,
        twConnected,
        ytStats,
        vkStats,
        twStats,
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            sendMessage(
                JSON.stringify({
                    ytConnected,
                    vkConnected,
                    twConnected,
                    type: "status",
                }),
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [ytConnected, vkConnected, twConnected, sendMessage]);

    return null;
};
