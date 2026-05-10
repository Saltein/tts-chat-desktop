/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import {
    selectSpeechVolume,
    selectTwitchTTSOn,
    selectTwitchVoice,
} from "../model/slice";
import s from "./TTSChat.module.scss";
import { useSelector } from "react-redux";
import {
    selectLastMessage,
    selectRevoiceMessage,
} from "../../../entities/connection/model/slice";
import { transliterateMessage } from "../../live-chat/lib/transliteration";
import { useEmoteContext } from "../../../shared/context/emotes/EmoteContext";

export const TTSChat = ({ volume, twitchVoiceProp }) => {
    let currentVolume = useSelector(selectSpeechVolume) / 100;
    if (volume) currentVolume = volume;

    const message = useSelector(selectLastMessage)[0];
    const revoiceMessage = useSelector(selectRevoiceMessage);

    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);

    let twitchVoice = useSelector(selectTwitchVoice);
    if (twitchVoiceProp) twitchVoice = twitchVoiceProp;

    const baseUrl = import.meta.env.VITE_BASE_URL_API || "";

    const audioRef = useRef(null);

    const queueRef = useRef([]);
    const isPlayingRef = useRef(false);

    const [audioUrl, setAudioUrl] = useState(null);

    const { stripEmotesFromRawText } = useEmoteContext();

    console.log("[TTS] init render", {
        isTwitchTTSOn,
        baseUrl,
        voice: twitchVoice,
    });

    // ----------------------------
    // PLAY NEXT
    // ----------------------------
    const playNext = useCallback(() => {
        console.log(
            "[TTS] playNext called, queue size:",
            queueRef.current.length,
        );

        const next = queueRef.current.shift();

        if (!next) {
            console.log("[TTS] queue empty, stopping");
            isPlayingRef.current = false;
            setAudioUrl(null);
            return;
        }

        console.log("[TTS] playing next url");
        isPlayingRef.current = true;

        setAudioUrl(next);
    }, []);

    // ----------------------------
    // ENQUEUE
    // ----------------------------
    const enqueue = useCallback(
        (url, priority = false) => {
            console.log("[TTS] enqueue", { priority, url });

            if (priority) {
                queueRef.current.unshift(url);
            } else {
                queueRef.current.push(url);
            }

            console.log(
                "[TTS] queue size after enqueue:",
                queueRef.current.length,
            );

            // Запускаем воспроизведение, если ничего не играет:
            // либо isPlayingRef === false, либо аудио на паузе (закончилось или прервано)
            const audio = audioRef.current;
            if (!isPlayingRef.current || (audio && audio.paused)) {
                console.log("[TTS] starting playback from enqueue");
                playNext();
            }
        },
        [playNext],
    );

    // ----------------------------
    // NORMAL SPEAK
    // ----------------------------
    const handleSpeak = useCallback(
        async (messageObj) => {
            console.log("[TTS] handleSpeak received:", messageObj);

            if (!isTwitchTTSOn || !messageObj) {
                console.log("[TTS] handleSpeak aborted (disabled or empty)");
                return;
            }

            let noEmoteText;

            if (messageObj?.service === "twitch") {
                noEmoteText = stripEmotesFromRawText(
                    messageObj?.message || messageObj?.text,
                );
            } else if (messageObj.clearMessage) {
                noEmoteText = messageObj.clearMessage;
            } else {
                noEmoteText =
                    messageObj?.message?.text ||
                    messageObj?.message ||
                    messageObj?.text;
            }

            console.log("[TTS] parsed text:", noEmoteText);

            try {
                const res = await fetch(`${baseUrl}/api/speak`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: transliterateMessage(noEmoteText),
                        speaker: twitchVoice,
                    }),
                });

                console.log("[TTS] API response status:", res.status);

                if (!res.ok) {
                    console.error("[TTS] API error response");
                    return;
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                console.log("[TTS] audio blob created:", url);

                enqueue(url, false);
            } catch (err) {
                console.error("[TTS] TTS error:", err);
            }
        },
        [baseUrl, isTwitchTTSOn, stripEmotesFromRawText, twitchVoice, enqueue],
    );

    // ----------------------------
    // PRIORITY REVOICE
    // ----------------------------
    const playImmediate = useCallback(
        async (messageObj) => {
            console.log("[TTS] playImmediate:", messageObj);

            if (!isTwitchTTSOn || !messageObj) {
                console.log("[TTS] playImmediate aborted");
                return;
            }

            let noEmoteText;

            if (messageObj?.service === "twitch") {
                noEmoteText = stripEmotesFromRawText(
                    messageObj?.message || messageObj?.text,
                );
            } else if (messageObj.clearMessage) {
                noEmoteText = messageObj.clearMessage;
            } else {
                noEmoteText =
                    messageObj?.message?.text ||
                    messageObj?.message ||
                    messageObj?.text;
            }

            console.log("[TTS] playImmediate text:", noEmoteText);

            try {
                const res = await fetch(`${baseUrl}/api/speak`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: transliterateMessage(noEmoteText),
                        speaker: twitchVoice,
                    }),
                });

                console.log("[TTS] immediate API status:", res.status);

                if (!res.ok) return;

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                console.log("[TTS] immediate audio url:", url);

                const audio = audioRef.current;

                if (audio) {
                    console.log("[TTS] stopping current audio");
                    audio.pause();
                    audio.currentTime = 0;
                }

                isPlayingRef.current = true;

                setAudioUrl(url);
            } catch (err) {
                console.error("[TTS] TTS immediate error:", err);
            }
        },
        [baseUrl, isTwitchTTSOn, stripEmotesFromRawText, twitchVoice],
    );

    // ----------------------------
    // СБРОС ПРИ ВЫКЛЮЧЕНИИ TTS
    // ----------------------------
    useEffect(() => {
        if (!isTwitchTTSOn) {
            console.log("[TTS] TTS disabled, cleaning up state");

            // Останавливаем текущее воспроизведение
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            // Сбрасываем флаг воспроизведения
            isPlayingRef.current = false;

            // Очищаем очередь и освобождаем blob URL
            queueRef.current.forEach((url) => {
                try {
                    URL.revokeObjectURL(url);
                } catch (e) {
                    console.error("[TTS] Error revoking URL:", e);
                }
            });
            queueRef.current = [];

            // Сбрасываем audioUrl
            setAudioUrl(null);
        }
    }, [isTwitchTTSOn]);

    // ----------------------------
    // volume
    // ----------------------------
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = currentVolume || 0;
            console.log("[TTS] volume set:", currentVolume);
        }
    }, [currentVolume, audioUrl]);

    // ----------------------------
    // autoplay
    // ----------------------------
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        console.log("[TTS] trying autoplay:", audioUrl);

        audio.play().catch((err) => {
            console.warn("[TTS] autoplay blocked:", err);
        });
    }, [audioUrl]);

    // ----------------------------
    // messages
    // ----------------------------
    useEffect(() => {
        console.log("[TTS] message update:", message);
        handleSpeak(message);
    }, [message, handleSpeak]);

    useEffect(() => {
        if (revoiceMessage) {
            console.log("[TTS] revoice message:", revoiceMessage);
            playImmediate(revoiceMessage);
        }
    }, [revoiceMessage, playImmediate]);

    // ----------------------------
    // ended
    // ----------------------------
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            console.log("[TTS] audio ended");

            const src = audio.src;

            setTimeout(() => {
                if (src) {
                    console.log("[TTS] revoking url:", src);
                    URL.revokeObjectURL(src);
                }
            }, 0);

            isPlayingRef.current = false;

            playNext();
        };

        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [playNext]);

    // ----------------------------
    // skip
    // ----------------------------
    useEffect(() => {
        if (window.electronAPI?.onSkipAudio) {
            console.log("[TTS] skip handler registered");

            const skip = window.electronAPI.onSkipAudio(() => {
                console.log("[TTS] skip triggered");

                const audio = audioRef.current;

                if (!audio) return;

                audio.pause();

                try {
                    URL.revokeObjectURL(audio.src);
                } catch {
                    console.error("[TTS] revoke error");
                }

                playNext();
            });

            return skip;
        }
    }, [playNext]);

    return (
        <div className={s.wrapper}>
            {isTwitchTTSOn && (
                <audio
                    ref={audioRef}
                    controls
                    src={audioUrl || undefined}
                    style={{ width: "100%" }}
                />
            )}
        </div>
    );
};
