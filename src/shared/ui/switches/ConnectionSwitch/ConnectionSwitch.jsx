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
    reconnect = false,
    onReconnectHandled = () => {},
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

        if (serviceName === "YouTube") return youtubeConnectionStatus;

        if (serviceName === "VK Видео Live") return vkConnectionStatus;

        return false;
    }, [
        serviceName,
        twitchConnectionStatus,
        youtubeConnectionStatus,
        vkConnectionStatus,
    ]);

    const [isSwitchLoading, setIsSwitchLoading] = useState(false);
    const [twitchJoined, setTwitchJoined] = useState(false);
    const [youtubeJoined, setYoutubeJoined] = useState(false);
    const [vkJoined, setVkJoined] = useState(false);

    const clientRef = useRef(null);
    const connectTimeoutRef = useRef(null);
    const isReconnectingRef = useRef(false);
    const isConnectingRef = useRef(false);

    // sync state
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

    // cleanup timeout
    useEffect(() => {
        return () => {
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
            }
        };
    }, []);

    // timeout
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

                    window.electronAPI?.vk?.disconnect?.();

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

    // CONNECT ONLY
    const connectService = useCallback(async () => {
        if (isConnectingRef.current) return;
        isConnectingRef.current = true;
        // TWITCH
        if (serviceName === "Twitch") {
            setIsSwitchLoading(true);

            try {
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
                                channel,
                                tags,
                                message,
                                self,
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
            } catch (e) {
                setIsSwitchLoading(false);
                console.error("Twitch connect error:", e);
            } finally {
                isConnectingRef.current = false;
            }
        }

        // VK
        else if (serviceName === "VK Видео Live") {
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
                const success =
                    await window.electronAPI?.vk?.connect?.(channel);

                if (!success) {
                    throw new Error(
                        "VK connect failed - method returned false",
                    );
                }

                setTimeout(() => {
                    if (getConnectionStatus() === false && isSwitchLoading) {
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
            } finally {
                isConnectingRef.current = false;
            }
        }

        // YOUTUBE
        else if (serviceName === "YouTube") {
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

                console.error("YouTube error:", error);

                dispatch(
                    addNotice({
                        id: genRandStr(),
                        type: "error",
                        message: `Ошибка подключения к YouTube: ${errorText}`,
                    }),
                );

                setIsSwitchLoading(false);

                dispatch(setYoutubeConnectionStatus(false));
            } finally {
                isConnectingRef.current = false;
            }
        }
    }, [
        serviceName,
        dispatch,
        twitchBotName,
        twitchBotToken,
        twitchChatChannelName,
        youtubeAccessToken,
        youtubeVideoIdFormatted,
        vkConnectionData?.vkChannelId,
        getConnectionStatus,
        isSwitchLoading,
    ]);

    // TOGGLE
    const handleConnect = useCallback(async () => {
        if (getConnectionStatus()) {
            // disconnect

            if (serviceName === "Twitch") {
                disconnectTwitchClient();

                dispatch(setTwitchConnectionStatus(false));

                setIsSwitchLoading(false);
            } else if (serviceName === "VK Видео Live") {
                await window.electronAPI?.vk?.disconnect?.();

                setVkJoined(false);

                dispatch(setVkConnectionStatus(false));

                setIsSwitchLoading(false);
            } else if (serviceName === "YouTube") {
                disconnectYouTubeClient();

                dispatch(setYoutubeConnectionStatus(false));

                setIsSwitchLoading(false);
            }

            onAutoConnectHandled();
        } else {
            await connectService();
        }
    }, [
        getConnectionStatus,
        serviceName,
        dispatch,
        connectService,
        onAutoConnectHandled,
    ]);

    // VK sync
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

    // auto connect
    useEffect(() => {
        if (autoConnect && !getConnectionStatus()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleConnect();

            onAutoConnectHandled();
        }
    }, [autoConnect, getConnectionStatus, handleConnect, onAutoConnectHandled]);

    // reconnect
    useEffect(() => {
        const reconnectService = async () => {
            if (!reconnect) return;
            if (isReconnectingRef.current) return;

            isReconnectingRef.current = true;

            try {
                // disconnect first
                if (serviceName === "Twitch") {
                    disconnectTwitchClient();
                    dispatch(setTwitchConnectionStatus(false));
                }

                if (serviceName === "YouTube") {
                    disconnectYouTubeClient();
                    dispatch(setYoutubeConnectionStatus(false));
                }

                if (serviceName === "VK Видео Live") {
                    await window.electronAPI?.vk?.disconnect?.();
                    dispatch(setVkConnectionStatus(false));
                }

                await new Promise((r) => setTimeout(r, 200));

                await connectService();
            } finally {
                isReconnectingRef.current = false;
                onReconnectHandled();
            }
        };

        reconnectService();
    }, [reconnect, serviceName, dispatch, connectService, onReconnectHandled]);

    return (
        <div
            className={`${s.wrapper} ${
                isSwitchLoading ? s.loading : ""
            } ${getConnectionStatus() ? s.on : ""}`}
            onClick={isActive ? handleConnect : () => {}}
        >
            <div className={s.switch} />
        </div>
    );
};
