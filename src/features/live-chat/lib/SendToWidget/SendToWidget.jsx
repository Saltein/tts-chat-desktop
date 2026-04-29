import { useSelector } from "react-redux";
import { selectLastMessage } from "../../../../entities/connection/model/slice";
import { useEffect, useRef } from "react";
import { useWebSocket } from "../../../../shared/hooks/useWebSocket";

export const SendToWidget = () => {
    const message = useSelector(selectLastMessage)[0];
    const previousMessageRef = useRef(null);
    const { isConnected, sendMessage } = useWebSocket("client", "client");

    useEffect(() => {
        if (message && isConnected) {
            if (previousMessageRef.current !== message.id && message.id) {
                previousMessageRef.current = message.id;
                sendMessage(JSON.stringify(message));
            }
        }
    }, [message, sendMessage, isConnected]);

    return null;
};
