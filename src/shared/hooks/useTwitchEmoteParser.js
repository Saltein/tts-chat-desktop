import { EmoteFetcher, EmoteParser } from "@mkody/twitch-emoticons";
import { useSelector } from "react-redux";
import { selectTwitchConnectionData } from "../../entities/connection/model/slice";
import { useState, useEffect, useMemo, useCallback } from "react";

export const useTwitchEmoteParser = () => {
    const twitchLogin = useSelector(selectTwitchConnectionData);

    const clientId = import.meta.env.VITE_TWITCH_APP_ID;
    const clientSecret = import.meta.env.VITE_TWITCH_APP_SECRET;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parser, setParser] = useState(null);

    const fetcher = useMemo(() => {
        // ✅ ВАЖНО: правильный конструктор
        return new EmoteFetcher(clientId, clientSecret);
    }, [clientId, clientSecret]);

    useEffect(() => {
        let isMounted = true;

        const loadEmotes = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let channelId = null;

                if (twitchLogin) {
                    let user = null;

                    if (fetcher?.api?.users?.getUserByName) {
                        user =
                            await fetcher.api.users.getUserByName(twitchLogin);
                    }

                    channelId = user?.id ?? null;
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

    return {
        parseText,
        isLoading,
        error,
        isReady: !isLoading && !error && parser !== null,
        emotesCount: fetcher?.emotes?.size || 0,
    };
};
