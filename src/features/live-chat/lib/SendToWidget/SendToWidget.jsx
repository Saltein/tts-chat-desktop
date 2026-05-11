import { useSelector } from "react-redux";
import { selectLastMessage } from "../../../../entities/connection/model/slice";
import { useEffect, useRef } from "react";
import { useWebSocket } from "../../../../shared/hooks/useWebSocket";

export const SendToWidget = () => {
    const { isConnected, sendMessage } = useWebSocket("client", "client");
    const message = useSelector(selectLastMessage)[0];

    const sentIdsRef = useRef(new Set());

    useEffect(() => {
        if (message && isConnected && message.id) {
            if (!sentIdsRef.current.has(message.id)) {
                sentIdsRef.current.add(message.id);
                sendMessage(JSON.stringify(message));

                setTimeout(() => {
                    sentIdsRef.current.delete(message.id);
                }, 3000);
            }
        }
    }, [message, isConnected, sendMessage]);

    return null;
};
