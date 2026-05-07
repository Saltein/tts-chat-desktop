import { useState, useRef, useEffect, useCallback } from "react";
import s from "./ConnectionSwitch.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    selectTwitchConnectionData,
    selectTwitchConnectionStatus,
    setTwitchConnectionStatus,
    setNewTwitchMessage,
    selectYoutubeVideoId,
    selectYoutubeAccessToken,
    setYoutubeConnectionStatus,
    setNewYoutubeMessage,
    setVkConnectionStatus,
    selectVkConnectionData,
    selectYoutubeConnectionStatus,
    selectVkConnectionStatus,
} from "../../../../entities/connection/model/slice";
import {
    connectTwitchClient,
    disconnectTwitchClient,
    getTwitchClient,
} from "../../../../features/live-chat/lib/twitchClientSingleton";
import {
    connectYouTubeClient,
    disconnectYouTubeClient,
    getYouTubeClient,
} from "../../../../features/live-chat/lib/youtube/youtubeClientSingleton";
import { getTwitchChannelName } from "../../../lib/getTwitchChannelName";
import { getYoutubeVideoId } from "../../../lib/getYoutubeVideoId";
import { addNotice } from "../../../../features/in-app-notices/model/slice";
import { genRandStr } from "../../../lib/genRandStr";
import { getVkChannelName } from "../../../lib/getVkChannelName";

export const ConnectionSwitch = ({
    serviceName = "",
    isActive = true,
    autoConnect = false,
    onAutoConnectHandled = () => {},
}) => {
    const dispatch = useDispatch();

    const twitchBotName = import.meta.env.VITE_TWITCH_BOT_NAME;
    const twitchBotToken = import.meta.env.VITE_TWITCH_BOT_TOKEN;
    const twitchConnectionStatus = useSelector(selectTwitchConnectionStatus);
    const chatChannelName = useSelector(selectTwitchConnectionData);

    const vkConnectionData = useSelector(selectVkConnectionData);
    const vkConnectionStatus = useSelector(selectVkConnectionStatus);

    const youtubeVideoId = useSelector(selectYoutubeVideoId);
    const youtubeAccessToken = useSelector(selectYoutubeAccessToken);
    const youtubeConnectionStatus = useSelector(selectYoutubeConnectionStatus);

    const twitchChatChannelName = getTwitchChannelName(
        chatChannelName?.chatChannelName,
    );
    const youtubeVideoIdFormatted = getYoutubeVideoId(
        youtubeVideoId?.youtubeVideoId,
    );

    const getConnectionStatus = useCallback(() => {
        if (serviceName === "Twitch") return twitchConnectionStatus;
        else if (serviceName === "YouTube") return youtubeConnectionStatus;
        else if (serviceName === "VK Видео Live") return vkConnectionStatus;
    }, [
        serviceName,
        twitchConnectionStatus,
        youtubeConnectionStatus,
        vkConnectionStatus,
    ]);

    const [isSwitchLoading, setIsSwitchLoading] = useState(false);
    const [twitchJoined, setTwitchJoined] = useState(false);
    const [youtubeJoined, setYoutubeJoined] = useState(false);
    // vkJoined больше не нужен, т.к. статус приходит через Redux, но оставим для единообразия с таймаутом
    const [vkJoined, setVkJoined] = useState(false);

    const clientRef = useRef(null);
    const connectTimeoutRef = useRef(null);

    // Эффект для синхронизации состояния переключателя с реальным статусом подключения
    useEffect(() => {
        if (serviceName === "YouTube") {
            const youtubeClient = getYouTubeClient();
            const isYoutubeConnected =
                youtubeClient && youtubeClient.isConnected;

            if (isYoutubeConnected !== getConnectionStatus()) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsSwitchLoading(false);
            }
        }
        if (serviceName === "Twitch") {
            const twitchClient = getTwitchClient();
            const isTwitchConnected = twitchClient && twitchClient.isConnected;

            if (isTwitchConnected !== getConnectionStatus()) {
                setIsSwitchLoading(false);
            }
        }
    }, [serviceName, getConnectionStatus]);

    // Очистка таймаута при размонтировании
    useEffect(() => {
        return () => {
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
            }
        };
    }, []);

    // Таймер для отключения при зависании
    useEffect(() => {
        if (isSwitchLoading) {
            connectTimeoutRef.current = setTimeout(() => {
                if (!twitchJoined && serviceName === "Twitch") {
                    setIsSwitchLoading(false);
                    disconnectTwitchClient();
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: "Не удалось подключиться к Twitch",
                        }),
                    );
                }
                if (!youtubeJoined && serviceName === "YouTube") {
                    setIsSwitchLoading(false);
                    disconnectYouTubeClient();
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: "Не удалось подключиться к YouTube",
                        }),
                    );
                }
                if (!vkJoined && serviceName === "VK Видео Live") {
                    setIsSwitchLoading(false);
                    window.electronAPI.vk.disconnect();
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: "Не удалось подключиться к VK Видео Live",
                        }),
                    );
                }
            }, 15000);
        }
        return () => {
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
            }
        };
    }, [
        isSwitchLoading,
        twitchJoined,
        youtubeJoined,
        vkJoined,
        serviceName,
        dispatch,
    ]);

    const handleConnect = useCallback(async () => {
        if (getConnectionStatus()) {
            // Отключение
            if (serviceName === "Twitch") {
                disconnectTwitchClient();
                dispatch(setTwitchConnectionStatus(false));
                setIsSwitchLoading(false);
                onAutoConnectHandled();
            } else if (serviceName === "VK Видео Live") {
                await window.electronAPI.vk.disconnect();
                // Статус обновится через глобальный onDisconnected, но для уверенности сбросим локально
                setVkJoined(false);
                dispatch(setVkConnectionStatus(false));
                setIsSwitchLoading(false);
                onAutoConnectHandled();
            } else if (serviceName === "YouTube") {
                setIsSwitchLoading(true);
                disconnectYouTubeClient();
                dispatch(setYoutubeConnectionStatus(false));
                setIsSwitchLoading(false);
                onAutoConnectHandled();
            }
        } else {
            // Включение
            if (serviceName === "Twitch") {
                setIsSwitchLoading(true);

                const client = connectTwitchClient(
                    {
                        token: twitchBotToken,
                        botNick: twitchBotName,
                        channel: twitchChatChannelName,
                    },
                    dispatch,
                );

                if (client) {
                    clientRef.current = client;

                    client.on("message", (channel, tags, message, self) => {
                        dispatch(
                            setNewTwitchMessage({
                                channel: channel,
                                tags: tags,
                                message: message,
                                self: self,
                            }),
                        );
                    });

                    client.on("notice", (error) => {
                        setTwitchJoined(false);
                        console.error("Twitch error:", error);
                        dispatch(setTwitchConnectionStatus(false));
                        setIsSwitchLoading(false);
                    });

                    client.on("join", () => {
                        setTwitchJoined(true);
                        setIsSwitchLoading(false);
                        dispatch(setTwitchConnectionStatus(true));
                    });

                    client.on("disconnected", () => {
                        setTwitchJoined(false);
                        dispatch(setTwitchConnectionStatus(false));
                        setIsSwitchLoading(false);
                    });
                } else {
                    setIsSwitchLoading(false);
                }
            } else if (serviceName === "VK Видео Live") {
                setIsSwitchLoading(true);

                const channel = getVkChannelName(vkConnectionData?.vkChannelId);

                if (!channel) {
                    setIsSwitchLoading(false);
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: "Введите канал VK",
                        }),
                    );
                    return;
                }

                try {
                    // ВАЖНО: Все подписки на сообщения и статус уже установлены глобально (например, в App.tsx).
                    // Здесь мы только подключаемся к VK. Статус подключения обновится через глобальный onConnected.
                    const success =
                        await window.electronAPI.vk.connect(channel);

                    if (!success) {
                        throw new Error(
                            "VK connect failed - method returned false",
                        );
                    }

                    console.log("VK connect initiated successfully");

                    // Таймаут для снятия индикации загрузки, если не пришло событие connected
                    setTimeout(() => {
                        if (
                            getConnectionStatus() === false &&
                            isSwitchLoading
                        ) {
                            console.log(
                                "VK connection timeout - no connected event received",
                            );
                            setIsSwitchLoading(false);
                            setVkJoined(false);
                            dispatch(setVkConnectionStatus(false));
                            dispatch(
                                addNotice({
                                    id: genRandStr(),
                                    type: "error",
                                    message: "Таймаут подключения к VK",
                                }),
                            );
                        }
                    }, 10000);
                } catch (error) {
                    console.error("VK error:", error);
                    setIsSwitchLoading(false);
                    setVkJoined(false);
                    dispatch(setVkConnectionStatus(false));
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: `Ошибка подключения к VK: ${error.message || "Неизвестная ошибка"}`,
                        }),
                    );
                }
            } else if (serviceName === "YouTube") {
                setIsSwitchLoading(true);

                const callbacks = {
                    onChatMessage: (msg) => {
                        dispatch(setNewYoutubeMessage(msg));
                    },
                    onConnected: () => {
                        setIsSwitchLoading(false);
                        dispatch(setYoutubeConnectionStatus(true));
                        setYoutubeJoined(true);
                    },
                    onDisconnected: () => {
                        setIsSwitchLoading(false);
                        dispatch(setYoutubeConnectionStatus(false));
                        setYoutubeJoined(false);
                    },
                };

                try {
                    const client = await connectYouTubeClient(
                        {
                            accessToken: youtubeAccessToken,
                            videoId: youtubeVideoIdFormatted,
                        },
                        callbacks,
                        dispatch,
                    );

                    if (client) {
                        clientRef.current = client;
                    } else {
                        console.error("❌ Не удалось создать YouTube клиент");
                        dispatch(
                            addNotice({
                                id: genRandStr(),
                                type: "error",
                                message: "Не удалось подключиться к YouTube",
                            }),
                        );
                        setIsSwitchLoading(false);
                        dispatch(setYoutubeConnectionStatus(false));
                    }
                } catch (error) {
                    const errorText = error?.message || String(error);
                    console.error("❌ Ошибка подключения YouTube:", error);
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: `Ошибка подключения к YouTube: ${errorText}`,
                        }),
                    );
                    setIsSwitchLoading(false);
                    dispatch(setYoutubeConnectionStatus(false));
                }
            }
        }
    }, [
        serviceName,
        dispatch,
        youtubeAccessToken,
        youtubeVideoIdFormatted,
        getConnectionStatus,
        isSwitchLoading,
        twitchBotName,
        twitchBotToken,
        twitchChatChannelName,
        vkConnectionData?.vkChannelId,
        onAutoConnectHandled
    ]);

    // Эффект для отслеживания глобального статуса VK (чтобы синхронизировать vkJoined и снять загрузку)
    useEffect(() => {
        if (serviceName === "VK Видео Live") {
            if (vkConnectionStatus) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setVkJoined(true);
                setIsSwitchLoading(false);
            } else {
                setVkJoined(false);
            }
        }
    }, [serviceName, vkConnectionStatus]);

    useEffect(() => {
        if (autoConnect && !getConnectionStatus()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleConnect();
            onAutoConnectHandled();
        }
    }, [autoConnect, getConnectionStatus, onAutoConnectHandled, handleConnect]);

    return (
        <div
            className={`${s.wrapper} ${isSwitchLoading ? s.loading : ""} ${getConnectionStatus() ? s.on : ""}`}
            onClick={isActive ? handleConnect : () => {}}
        >
            <div className={s.switch} />
        </div>
    );
};
