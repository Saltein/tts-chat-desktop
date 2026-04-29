import { useEffect, useRef, useState } from "react";
import {
    selectSpeechVolume,
    selectTwitchTTSOn,
    selectTwitchVoice,
} from "../model/slice";
import s from "./TTSChat.module.scss";
import { useSelector } from "react-redux";
import { selectLastMessage } from "../../../entities/connection/model/slice";
import { transliterateMessage } from "../../live-chat/lib/transliteration";

export const TTSChat = ({ volume, twitchVoiceProp }) => {
    let currentVolume = useSelector(selectSpeechVolume) / 100;
    if (volume) currentVolume = volume;
    const message = useSelector(selectLastMessage)[0];
    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);
    let twitchVoice = useSelector(selectTwitchVoice);
    if (twitchVoiceProp) twitchVoice = twitchVoiceProp;

    const baseUrl = import.meta.env.VITE_BASE_URL_API || "";

    const [audioUrl, setAudioUrl] = useState(null);
    const audioRef = useRef(null);

    const handleSpeak = async () => {
        if (message) {
            if (message?.service === "twitch") {
                if (message?.tags["reply-parent-user-login"]) return;
            }
            try {
                console.log("twitchVoice", twitchVoice);
                const res = await fetch(`${baseUrl}/api/speak`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: transliterateMessage(
                            message.message ? message?.message : message?.text,
                        ),
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
                setAudioUrl(url);
            } catch (err) {
                console.error("Ошибка запроса к TTS серверу:", err);
            }
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = currentVolume || 0;
        }
    }, [currentVolume, audioUrl]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        handleSpeak();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message]);

    useEffect(() => {
        if (window.electronAPI?.onSkipAudio) {
            const skip = window.electronAPI.onSkipAudio(() => {
                if (audioRef.current && !audioRef.current.ended) {
                    audioRef.current.currentTime = audioRef.current.duration;
                    console.log("Audio skipped");
                }
            });
            return skip;
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
            }
        };

        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [audioUrl]);

    return (
        <div className={s.wrapper}>
            {isTwitchTTSOn && (
                <audio
                    ref={audioRef}
                    controls
                    autoPlay
                    src={audioUrl}
                    style={{ width: "100%" }}
                />
            )}
        </div>
    );
};
