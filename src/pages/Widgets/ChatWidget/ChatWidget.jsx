import { useSearchParams } from "react-router-dom";
import { LiveChat } from "../../../features/live-chat/ui/LiveChat/LiveChat";
import s from "./ChatWidget.module.scss";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    connectTwitchClient,
    disconnectTwitchClient,
    getTwitchClient,
} from "../../../features/live-chat/lib/twitchClientSingleton";
import {
    setNewTwitchMessage,
    setNewVkMessage,
    setNewYoutubeMessage,
    setTwitchConnectionStatus,
    setYoutubeConnectionStatus,
    setVkConnectionStatus,
} from "../../../entities/connection/model/slice";
import { TTSChat } from "../../../features/tts-chat/TTSChat/TTSChat";
import { useTheme } from "../../../shared/context/theme/ThemeContext";
import {
    connectYouTubeClient,
    disconnectYouTubeClient,
    getYouTubeClient,
} from "../../../features/live-chat/lib/youtube/youtubeClientSingleton";
import {
    setFontSize,
    setMessageBackground,
    setMessageBackgroundOpacity,
    setMessageBorder,
    setMessageLifeTime,
    setMessageTextColor,
    setServiceIcon,
} from "../../../entities/message/model/slice";
import {
    connectVk,
    disconnectVk,
    initVkChatListener,
} from "../../../services/vkService";
import { getTwitchChannelName } from "../../../shared/lib/getTwitchChannelName";

export const ChatWidget = () => {
    const twitchBotName = import.meta.env.VITE_TWITCH_BOT_NAME;
    const twitchBotToken = import.meta.env.VITE_TWITCH_BOT_TOKEN;

    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { setTheme } = useTheme();

    const voiceVolume = searchParams.get("volume") || 1;
    const twitchVoice = searchParams.get("twitchVoice") || "random";
    const targetTheme = searchParams.get("theme") || "dark";

    const messageBackgroundColor = searchParams.get("messageBackgroundColor");
    const messageBackgroundOpacity = searchParams.get(
        "messageBackgroundOpacity",
    );
    const messageTextColor = searchParams.get("messageTextColor");
    const messageLifeTime = searchParams.get("messageLifeTime");
    const messageBorder =
        searchParams.get("messageBorder") === "false" ? false : true;
    const serviceIcon =
        searchParams.get("serviceIcon") === "false" ? false : true;
    const fontSize = searchParams.get("fontSize");

    const twitchChatChannelName =
        searchParams.get("twitchChatChannelName") || "";
    const twitchConnectionStatus =
        searchParams.get("twitchConnectionStatus") === "true";

    const youtubeVideoId = searchParams.get("youtubeVideoId") || "";
    const youtubeAccessToken = searchParams.get("youtubeAccessToken") || "";
    const youtubeConnectionStatus =
        searchParams.get("youtubeConnectionStatus") === "true";

    const vkChannelId = searchParams.get("vkChannelId") || "";
    const vkConnectionStatus =
        searchParams.get("vkConnectionStatus") === "true";

    // Рефы для клиентов
    const twitchClientRef = useRef(null);
    const youtubeClientRef = useRef(null);

    // Рефы для отслеживания состояния подключения
    const twitchJoinedRef = useRef(false);
    const youtubeJoinedRef = useRef(false);
    const vkJoinedRef = useRef(false);

    // Таймеры для обработки таймаутов подключения
    const twitchTimeoutRef = useRef(null);
    const youtubeTimeoutRef = useRef(null);
    const vkConnectTimeoutRef = useRef(null);

    // Настройка UI параметров
    useEffect(() => {
        dispatch(setMessageBackground(messageBackgroundColor));
        dispatch(setMessageBackgroundOpacity(messageBackgroundOpacity));
        dispatch(setMessageTextColor(messageTextColor));
        dispatch(setMessageLifeTime(messageLifeTime));
        dispatch(setMessageBorder(messageBorder));
        dispatch(setServiceIcon(serviceIcon));
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
    ]);

    // Инициализация VK слушателей (только для Electron)
    useEffect(() => {
        initVkChatListener();
    }, []);

    // Функция для установки таймаута подключения Twitch
    const setTwitchConnectionTimeout = () => {
        if (twitchTimeoutRef.current) clearTimeout(twitchTimeoutRef.current);
        twitchTimeoutRef.current = setTimeout(() => {
            if (!twitchJoinedRef.current) {
                console.error("❌ Таймаут подключения к Twitch");
                disconnectTwitchClient();
                dispatch(setTwitchConnectionStatus(false));
                twitchJoinedRef.current = false;
            }
        }, 10000);
    };

    // Функция для установки таймаута подключения YouTube
    const setYouTubeConnectionTimeout = () => {
        if (youtubeTimeoutRef.current) clearTimeout(youtubeTimeoutRef.current);
        youtubeTimeoutRef.current = setTimeout(() => {
            if (!youtubeJoinedRef.current) {
                console.error("❌ Таймаут подключения к YouTube");
                disconnectYouTubeClient();
                dispatch(setYoutubeConnectionStatus(false));
                youtubeJoinedRef.current = false;
            }
        }, 10000);
    };

    // Функция подключения к Twitch
    const handleTwitchConnect = () => {
        if (!twitchConnectionStatus) return;

        // Проверяем, уже ли подключены
        const existingClient = getTwitchClient();
        if (existingClient && existingClient.isConnected) {
            twitchClientRef.current = existingClient;
            twitchJoinedRef.current = true;
            dispatch(setTwitchConnectionStatus(true));
            return;
        }

        const chatChannelName = getTwitchChannelName(twitchChatChannelName);

        setTwitchConnectionTimeout();

        const client = connectTwitchClient(
            {
                token: twitchBotToken,
                botNick: twitchBotName,
                channel: chatChannelName,
            },
            dispatch,
        );

        if (client) {
            twitchClientRef.current = client;

            client.on("message", (channel, tags, message, self) => {
                dispatch(setNewTwitchMessage({ channel, tags, message, self }));
            });

            client.on("notice", (error) => {
                console.error("Twitch error:", error);
                twitchJoinedRef.current = false;
                dispatch(setTwitchConnectionStatus(false));
                if (twitchTimeoutRef.current)
                    clearTimeout(twitchTimeoutRef.current);
            });

            client.on("join", () => {
                twitchJoinedRef.current = true;
                dispatch(setTwitchConnectionStatus(true));
                if (twitchTimeoutRef.current)
                    clearTimeout(twitchTimeoutRef.current);
            });

            client.on("disconnected", () => {
                twitchJoinedRef.current = false;
                dispatch(setTwitchConnectionStatus(false));
                if (twitchTimeoutRef.current)
                    clearTimeout(twitchTimeoutRef.current);
            });
        } else {
            dispatch(setTwitchConnectionStatus(false));
            if (twitchTimeoutRef.current)
                clearTimeout(twitchTimeoutRef.current);
        }
    };

    // Функция отключения от Twitch
    const handleTwitchDisconnect = () => {
        if (twitchTimeoutRef.current) clearTimeout(twitchTimeoutRef.current);
        disconnectTwitchClient();
        dispatch(setTwitchConnectionStatus(false));
        twitchJoinedRef.current = false;
        twitchClientRef.current = null;
    };

    // Функция подключения к YouTube
    const handleYouTubeConnect = async () => {
        if (!youtubeConnectionStatus || !youtubeVideoId || !youtubeAccessToken)
            return;

        // Проверяем, уже ли подключены
        const existingClient = getYouTubeClient();
        if (existingClient && existingClient.isConnected) {
            youtubeClientRef.current = existingClient;
            youtubeJoinedRef.current = true;
            dispatch(setYoutubeConnectionStatus(true));
            return;
        }

        setYouTubeConnectionTimeout();

        try {
            const callbacks = {
                onChatMessage: (msg) => {
                    dispatch(setNewYoutubeMessage(msg));
                },
                onConnected: () => {
                    youtubeJoinedRef.current = true;
                    dispatch(setYoutubeConnectionStatus(true));
                    if (youtubeTimeoutRef.current)
                        clearTimeout(youtubeTimeoutRef.current);
                },
                onDisconnected: () => {
                    youtubeJoinedRef.current = false;
                    dispatch(setYoutubeConnectionStatus(false));
                    if (youtubeTimeoutRef.current)
                        clearTimeout(youtubeTimeoutRef.current);
                },
            };

            const client = await connectYouTubeClient(
                {
                    videoId: youtubeVideoId,
                    accessToken: youtubeAccessToken,
                },
                callbacks,
                dispatch,
            );

            if (client) {
                youtubeClientRef.current = client;
            } else {
                console.error("❌ Не удалось создать YouTube клиент");
                dispatch(setYoutubeConnectionStatus(false));
                if (youtubeTimeoutRef.current)
                    clearTimeout(youtubeTimeoutRef.current);
            }
        } catch (error) {
            console.error("Ошибка подключения к YouTube:", error);
            dispatch(setYoutubeConnectionStatus(false));
            if (youtubeTimeoutRef.current)
                clearTimeout(youtubeTimeoutRef.current);
        }
    };

    // Функция отключения от YouTube
    const handleYouTubeDisconnect = () => {
        if (youtubeTimeoutRef.current) clearTimeout(youtubeTimeoutRef.current);
        disconnectYouTubeClient();
        dispatch(setYoutubeConnectionStatus(false));
        youtubeJoinedRef.current = false;
        youtubeClientRef.current = null;
    };

    // Функция подключения к VK
    const handleVkConnect = async () => {
        if (!vkConnectionStatus || !vkChannelId) return;

        // Очищаем предыдущий таймаут, если есть
        if (vkConnectTimeoutRef.current)
            clearTimeout(vkConnectTimeoutRef.current);

        // Устанавливаем новый таймаут на 10 секунд
        vkConnectTimeoutRef.current = setTimeout(() => {
            if (!vkJoinedRef.current && vkConnectionStatus) {
                console.warn(
                    "VK connection timeout – no connected event received",
                );
                dispatch(setVkConnectionStatus(false));
                disconnectVk();
            }
        }, 10000);

        try {
            await connectVk(vkChannelId);
            vkJoinedRef.current = true;
            console.log("VK connect initiated successfully");
        } catch (error) {
            console.error("VK connection error:", error);
            if (vkConnectTimeoutRef.current)
                clearTimeout(vkConnectTimeoutRef.current);
            dispatch(setVkConnectionStatus(false));
        }
    };

    // Функция отключения от VK
    const handleVkDisconnect = async () => {
        if (vkConnectTimeoutRef.current)
            clearTimeout(vkConnectTimeoutRef.current);
        await disconnectVk();
        dispatch(setVkConnectionStatus(false));
        vkJoinedRef.current = false;
    };

    // Синхронизация локального рефа с глобальным статусом VK
    useEffect(() => {
        if (vkConnectionStatus) {
            vkJoinedRef.current = true;
            if (vkConnectTimeoutRef.current)
                clearTimeout(vkConnectTimeoutRef.current);
        } else {
            vkJoinedRef.current = false;
        }
    }, [vkConnectionStatus]);

    // Основной эффект для управления подключениями
    useEffect(() => {
        // Twitch
        if (twitchConnectionStatus) {
            handleTwitchConnect();
        } else {
            handleTwitchDisconnect();
        }

        // YouTube
        if (youtubeConnectionStatus && youtubeVideoId && youtubeAccessToken) {
            handleYouTubeConnect();
        } else {
            handleYouTubeDisconnect();
        }

        // VK
        if (vkConnectionStatus && vkChannelId) {
            handleVkConnect();
        } else {
            handleVkDisconnect();
        }

        // Установка темы
        setTheme(targetTheme);

        // Cleanup при размонтировании
        return () => {
            // Очищаем все таймауты
            if (twitchTimeoutRef.current)
                clearTimeout(twitchTimeoutRef.current);
            if (youtubeTimeoutRef.current)
                clearTimeout(youtubeTimeoutRef.current);
            if (vkConnectTimeoutRef.current)
                clearTimeout(vkConnectTimeoutRef.current);

            // Отключаем все сервисы
            disconnectTwitchClient();
            disconnectYouTubeClient();
            disconnectVk();
        };
    }, [twitchConnectionStatus, youtubeConnectionStatus, vkConnectionStatus]);

    return (
        <div className={s.wrapper}>
            <TTSChat volume={voiceVolume} twitchVoiceProp={twitchVoice} />
            <LiveChat backgroundColor={"transparent"} isWidget />
        </div>
    );
};
