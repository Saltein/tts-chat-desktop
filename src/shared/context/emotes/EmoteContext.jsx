import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { EmoteFetcher, EmoteParser } from "@mkody/twitch-emoticons";
import { useSelector } from "react-redux";
import { selectTwitchConnectionData } from "../../../entities/connection/model/slice";

const EmoteContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useEmoteContext = () => {
    const context = useContext(EmoteContext);
    if (!context) {
        throw new Error("useEmoteContext must be used within EmoteProvider");
    }
    return context;
};

export const EmoteProvider = ({ children }) => {
    const twitchLogin = useSelector(selectTwitchConnectionData);
    const clientId = import.meta.env.VITE_TWITCH_APP_ID;
    const clientSecret = import.meta.env.VITE_TWITCH_APP_SECRET;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parser, setParser] = useState(null);
    const [fetcher, setFetcher] = useState(null);

    // Создаем fetcher один раз
    useEffect(() => {
        const newFetcher = new EmoteFetcher(clientId, clientSecret);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFetcher(newFetcher);
    }, [clientId, clientSecret]);

    // Загружаем эмодзи один раз
    useEffect(() => {
        if (!fetcher) return;

        let isMounted = true;
        let cachedChannelId = null;

        const loadEmotes = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let channelId = null;

                if (twitchLogin) {
                    // Кешируем ID канала
                    if (cachedChannelId) {
                        channelId = cachedChannelId;
                    } else {
                        let user = null;
                        if (fetcher?.api?.users?.getUserByName) {
                            user =
                                await fetcher.api.users.getUserByName(
                                    twitchLogin,
                                );
                        }
                        channelId = user?.id ?? null;
                        cachedChannelId = channelId;
                    }
                }

                await Promise.all([
                    fetcher.fetchTwitchEmotes(),
                    fetcher.fetchBTTVEmotes(),
                    fetcher.fetchFFZEmotes(),
                    fetcher.fetchSevenTVEmotes(),
                    ...(channelId
                        ? [
                              fetcher.fetchTwitchEmotes(channelId),
                              fetcher.fetchBTTVEmotes(channelId),
                              fetcher.fetchFFZEmotes(channelId),
                              fetcher.fetchSevenTVEmotes(channelId),
                          ]
                        : []),
                ]);

                if (!isMounted) return;

                setParser(
                    new EmoteParser(fetcher, {
                        type: "html",
                        match: /(\w+)/g,
                    }),
                );
            } catch (err) {
                console.error("Failed to load emotes:", err);
                if (!isMounted) return;
                setError(err?.message || "Failed to load emotes");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadEmotes();

        return () => {
            isMounted = false;
        };
    }, [fetcher, twitchLogin]);

    const parseText = useCallback(
        (text) => {
            if (!parser || !text) return text;
            return parser.parse(text);
        },
        [parser],
    );

    // Функция для очистки текста от эмодзи
    const stripEmotes = useCallback((text) => {
        if (!text) return text;
        if (typeof text !== "string") return text;

        const emoteRegex = /<img[^>]*class="[^"]*emote[^"]*"[^>]*>/gi;
        const emoteMarkerRegex = /:[\w]+:/g;
        let cleanedText = text.replace(emoteRegex, "");
        cleanedText = cleanedText.replace(emoteMarkerRegex, "");
        cleanedText = cleanedText.replace(/\s+/g, " ").trim();

        return cleanedText;
    }, []);

    const stripEmotesFromRawText = useCallback(
        (text, keepWhitespace = true) => {
            if (!text || typeof text !== "string") return text;

            if (fetcher && fetcher.emotes) {
                const emotesMap = fetcher.emotes;
                let cleanedText = text;

                // Функция для экранирования спецсимволов regex
                const escapeRegex = (str) => {
                    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                };

                for (const [emoteName, _] of emotesMap) {
                    try {
                        // Экранируем спецсимволы в названии эмоута
                        const escapedName = escapeRegex(emoteName);
                        const regex = new RegExp(`\\b${escapedName}\\b`, "g");
                        cleanedText = cleanedText.replace(regex, "");
                    } catch (error) {
                        console.warn(
                            `Failed to create regex for emote: ${emoteName}`,
                            error,
                        );
                    }
                }

                if (!keepWhitespace) {
                    cleanedText = cleanedText.replace(/\s+/g, " ").trim();
                }

                return cleanedText;
            }

            return stripEmotes(text);
        },
        [fetcher, stripEmotes],
    );

    const value = useMemo(
        () => ({
            stripEmotes,
            stripEmotesFromRawText,
            parseText,
            isLoading,
            error,
            isReady: !isLoading && !error && parser !== null,
            emotesCount: fetcher?.emotes?.size || 0,
        }),
        [
            stripEmotes,
            stripEmotesFromRawText,
            parseText,
            isLoading,
            error,
            parser,
            fetcher,
        ],
    );

    return (
        <EmoteContext.Provider value={value}>{children}</EmoteContext.Provider>
    );
};
