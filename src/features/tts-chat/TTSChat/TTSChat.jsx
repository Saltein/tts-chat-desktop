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

    // ОЧЕРЕДЬ
    const queueRef = useRef([]);

    // ИДЁТ ЛИ ВОСПРОИЗВЕДЕНИЕ
    const isPlayingRef = useRef(false);

    const [audioUrl, setAudioUrl] = useState(null);

    const { stripEmotesFromRawText } = useEmoteContext();

    const playNext = () => {
        const next = queueRef.current.shift();

        if (!next) {
            isPlayingRef.current = false;
            setAudioUrl(null);
            return;
        }

        isPlayingRef.current = true;
        setAudioUrl(next);
    };

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

            if (messageObj?.service === "twitch") {
                if (messageObj?.tags["reply-parent-user-login"]) return;
            }

            if (
                messageObj?.service === "vk" &&
                messageObj?.user === "ChatBot"
            ) {
                return;
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
                    const error = await res.json();
                    console.error("Ошибка TTS:", error);
                    return;
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                // ДОБАВЛЯЕМ В ОЧЕРЕДЬ
                queueRef.current.push(url);

                // ЕСЛИ НИЧЕГО НЕ ИГРАЕТ → СТАРТУЕМ
                if (!isPlayingRef.current) {
                    playNext();
                }
            } catch (err) {
                console.error("Ошибка запроса к TTS серверу:", err);
            }
        },
        [baseUrl, isTwitchTTSOn, stripEmotesFromRawText, twitchVoice],
    );

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = currentVolume || 0;
        }
    }, [currentVolume, audioUrl]);

    useEffect(() => {
        handleSpeak(message);
    }, [message, handleSpeak]);

    useEffect(() => {
        handleSpeak(revoiceMessage);
    }, [revoiceMessage, handleSpeak]);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const handleEnded = () => {
            if (audio.src) {
                URL.revokeObjectURL(audio.src);
            }

            playNext();
        };

        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    useEffect(() => {
        if (window.electronAPI?.onSkipAudio) {
            const skip = window.electronAPI.onSkipAudio(() => {
                const audio = audioRef.current;

                if (audio && !audio.ended) {
                    audio.pause();

                    if (audio.src) {
                        URL.revokeObjectURL(audio.src);
                    }

                    playNext();
                }
            });

            return skip;
        }
    }, []);

    return (
        <div className={s.wrapper}>
            {isTwitchTTSOn && (
                <audio
                    ref={audioRef}
                    controls
                    autoPlay
                    src={audioUrl || ""}
                    style={{ width: "100%" }}
                />
            )}
        </div>
    );
};
