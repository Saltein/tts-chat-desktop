import { useSearchParams } from "react-router-dom";
import { LiveChat } from "../../../features/live-chat/ui/LiveChat/LiveChat";
import s from "./ChatWidget.module.scss";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    clearLocalStorage,
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
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    // Настройка UI параметров
    // Name
    const messageNameBackground =
        searchParams.get("messageNameBackground") === "false" ? false : true;
    const messageNameBackgroundColor = searchParams.get(
        "messageNameBackgroundColor",
    );
    const messageNameBackgroundOpacity = searchParams.get(
        "messageNameBackgroundOpacity",
    );
    const messageNameBorder =
        searchParams.get("messageNameBorder") === "false" ? false : true;
    const serviceIcon =
        searchParams.get("serviceIcon") === "false" ? false : true;

    // Message
    const messageBackgroundColor = searchParams.get("messageBackgroundColor");
    const messageBackgroundOpacity = searchParams.get(
        "messageBackgroundOpacity",
    );
    const messageTextColor = searchParams.get("messageTextColor");
    const messageBorder =
        searchParams.get("messageBorder") === "false" ? false : true;

    // General
    const messageGap = searchParams.get("messageGap");
    const messageLifeTime = searchParams.get("messageLifeTime");
    const fontSize = searchParams.get("fontSize");

    // Настройка UI параметров
    useEffect(() => {
        dispatch(clearLocalStorage());
        // Name
        dispatch(setMessageNameBackground(messageNameBackground));
        dispatch(setMessageNameBackgroundColor(messageNameBackgroundColor));
        dispatch(setMessageNameBackgroundOpacity(messageNameBackgroundOpacity));
        dispatch(setMessageNameBorder(messageNameBorder));
        dispatch(setServiceIcon(serviceIcon));

        // Message
        dispatch(setMessageBackground(messageBackgroundColor));
        dispatch(setMessageBackgroundOpacity(messageBackgroundOpacity));
        dispatch(setMessageTextColor(messageTextColor));
        dispatch(setMessageBorder(messageBorder));

        // General
        dispatch(setMessageGap(messageGap));
        dispatch(setMessageLifeTime(messageLifeTime));
        dispatch(setFontSize(fontSize));
    }, [
        dispatch,
        messageBackgroundColor,
        messageBackgroundOpacity,
        messageTextColor,
        messageLifeTime,
        messageBorder,
        serviceIcon,
        fontSize,
        messageNameBackground,
        messageNameBackgroundColor,
        messageNameBackgroundOpacity,
        messageNameBorder,
        messageGap,
    ]);

    // Подключение к WS
    const { isConnected, messages } = useWebSocket("client", `widget`);

    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        if (lastMessage.text.type !== "message") return;
        
        dispatch(setWidgetMessage(lastMessage.text));
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
