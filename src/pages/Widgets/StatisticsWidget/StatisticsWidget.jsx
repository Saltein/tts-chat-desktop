import { useDispatch } from "react-redux";
import { StreamStatus } from "../../../features/stream-status/ui/StreamStatus";
import s from "./StatisticsWidget.module.scss";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import { useEffect } from "react";
import {
    setServiceIconSize,
    setStatusBackgroundColor,
    setStatusBackgroundOpacity,
    setStatusBorderRadius,
    setStatusFontSize,
    setStatusPreviewBackgroundOn,
    setStatusTextColor,
    setStretchInWidth,
    setTwitchViewers,
    setVerticalArrange,
    setVkLikes,
    setVkViewers,
    setYoutubeLikes,
    setYoutubeViewers,
} from "../../../features/stream-status/model/slice";
import {
    setTwitchConnectionStatus,
    setVkConnectionStatus,
    setYoutubeConnectionStatus,
} from "../../../entities/connection/model/slice";

export const StatisticsWidget = () => {
    const dispatch = useDispatch();

    const { isConnected, messages } = useWebSocket(
        "client",
        `statistics-widget`,
    );

    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        const type = lastMessage.text.type;
        const textObj = lastMessage.text;

        if (type === "message") return;

        if (type === "status") {
            dispatch(setYoutubeConnectionStatus(textObj.ytConnected));
            dispatch(setTwitchConnectionStatus(textObj.twConnected));
            dispatch(setVkConnectionStatus(textObj.vkConnected));
        }

        // stats
        if (type === "ytStats") {
            dispatch(setYoutubeLikes(textObj.likes));
            dispatch(setYoutubeViewers(textObj.viewers));
        }
        if (type === "vkStats") {
            dispatch(setVkLikes(textObj.likes));
            dispatch(setVkViewers(textObj.viewers));
        }
        if (type === "twStats") {
            dispatch(setTwitchViewers(textObj.viewers));
        }

        // styles
        if (type === "statisticsStyles") {
            dispatch(setStatusPreviewBackgroundOn(textObj.previewBackgroundOn));
            dispatch(setStretchInWidth(textObj.stretchInWidth));
            dispatch(setVerticalArrange(textObj.verticalArrange));
            dispatch(setStatusTextColor(textObj.textColor));
            dispatch(setStatusBackgroundColor(textObj.backgroundColor));
            dispatch(setStatusFontSize(textObj.fontSize));
            dispatch(setStatusBackgroundOpacity(textObj.backgroundOpacity));
            dispatch(setServiceIconSize(textObj.serviceIconSize));
            dispatch(setStatusBorderRadius(textObj.borderRadius));
        }
    }, [messages, dispatch]);

    if (!isConnected) {
        return <div>Connecting to WebSocket...</div>;
    }

    return (
        <div className={s.wrapper}>
            <StreamStatus isWidget />
        </div>
    );
};
