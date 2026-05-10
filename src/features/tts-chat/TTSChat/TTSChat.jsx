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

    // ----------------------------
    // PLAY NEXT
    // ----------------------------
    const playNext = useCallback(() => {
        const next = queueRef.current.shift();

        if (!next) {
            isPlayingRef.current = false;
            setAudioUrl(null);
            return;
        }

        isPlayingRef.current = true;

        setAudioUrl(next);
    }, []);

    // ----------------------------
    // ENQUEUE
    // ----------------------------
    const enqueue = useCallback(
        (url, priority = false) => {
            if (priority) {
                queueRef.current.unshift(url);
            } else {
                queueRef.current.push(url);
            }

            if (!isPlayingRef.current && !audioRef.current?.src) {
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
            if (!isTwitchTTSOn || !messageObj) return;

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

            try {
                const res = await fetch(`${baseUrl}/api/speak`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: transliterateMessage(noEmoteText),
                        speaker: twitchVoice,
                    }),
                });

                if (!res.ok) {
                    return;
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                enqueue(url, false);
            } catch (err) {
                console.error("TTS error:", err);
            }
        },
        [baseUrl, isTwitchTTSOn, stripEmotesFromRawText, twitchVoice, enqueue],
    );

    // ----------------------------
    // PRIORITY REVOICE
    // ----------------------------
    const playImmediate = useCallback(
        async (messageObj) => {
            if (!isTwitchTTSOn || !messageObj) return;

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

            try {
                const res = await fetch(`${baseUrl}/api/speak`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: transliterateMessage(noEmoteText),
                        speaker: twitchVoice,
                    }),
                });

                if (!res.ok) return;

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                const audio = audioRef.current;

                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }

                isPlayingRef.current = true;

                setAudioUrl(url);
            } catch (err) {
                console.error("TTS immediate error:", err);
            }
        },
        [baseUrl, isTwitchTTSOn, stripEmotesFromRawText, twitchVoice],
    );

    // ----------------------------
    // volume
    // ----------------------------
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = currentVolume || 0;
        }
    }, [currentVolume, audioUrl]);

    // ----------------------------
    // autoplay
    // ----------------------------
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        audio.play().catch((err) => {
            console.warn("Autoplay blocked:", err);
        });
    }, [audioUrl]);

    // ----------------------------
    // messages
    // ----------------------------
    useEffect(() => {
        handleSpeak(message);
    }, [message, handleSpeak]);

    useEffect(() => {
        if (revoiceMessage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            playImmediate(revoiceMessage);
        }
    }, [revoiceMessage, playImmediate]);

    // ----------------------------
    // ended (FIXED LOGIC)
    // ----------------------------
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            const src = audio.src;

            setTimeout(() => {
                if (src) URL.revokeObjectURL(src);
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
            const skip = window.electronAPI.onSkipAudio(() => {
                const audio = audioRef.current;

                if (!audio) return;

                audio.pause();

                try {
                    URL.revokeObjectURL(audio.src);
                } catch {
                    console.error("URL revoke error");
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
                    src={audioUrl || ""}
                    style={{ width: "100%" }}
                />
            )}
        </div>
    );
};
