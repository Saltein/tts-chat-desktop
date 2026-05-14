import { LiveChat } from "../../../features/live-chat/ui/LiveChat/LiveChat";
import s from "./ChatWidget.module.scss";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    setFontSize,
    setMessageBackground,
    setMessageBackgroundOpacity,
    setMessageBorder,
    setMessageGap,
    setMessageLifeTime,
    setMessageNameBackground,
    setMessageNameBackgroundColor,
    setMessageNameBackgroundOpacity,
    setMessageNameBorder,
    setMessageTextColor,
    setServiceIcon,
} from "../../../entities/message/model/slice";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import { setWidgetMessage } from "../../../entities/connection/model/slice";

export const ChatWidget = () => {
    const dispatch = useDispatch();

    // Подключение к WS
    const { isConnected, messages } = useWebSocket("client", `widget`);

    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        if (lastMessage.text.type === "message") {
            dispatch(setWidgetMessage(lastMessage.text));
        }

        if (lastMessage.text.type === "chatStyles") {
            dispatch(setMessageNameBackground(lastMessage.text.nameBackground));
            dispatch(setMessageNameBorder(lastMessage.text.nameBorder));
            dispatch(
                setMessageNameBackgroundColor(
                    lastMessage.text.nameBackgroundColor,
                ),
            );
            dispatch(
                setMessageNameBackgroundOpacity(
                    lastMessage.text.nameBackgroundOpacity,
                ),
            );
            dispatch(setServiceIcon(lastMessage.text.serviceIcon));

            dispatch(setMessageBorder(lastMessage.text.messageBorder));
            dispatch(
                setMessageBackground(
                    lastMessage.text.messageBackgroundColor,
                ),
            );
            dispatch(
                setMessageBackgroundOpacity(
                    lastMessage.text.messageBackgroundOpacity,
                ),
            );
            dispatch(setMessageTextColor(lastMessage.text.messageTextColor));

            dispatch(setFontSize(lastMessage.text.fontSize));
            dispatch(setMessageGap(lastMessage.text.messageGap));
            dispatch(setMessageLifeTime(lastMessage.text.messageLifeTime));
        }
    }, [messages, dispatch]);

    if (!isConnected) {
        return <div>Connecting to WebSocket...</div>;
    }

    return (
        <div className={s.wrapper}>
            <div className={s.chatWrapper}>
                <LiveChat backgroundColor={"transparent"} isWidget />
            </div>
        </div>
    );
};
