/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useDispatch, useSelector } from "react-redux";
import {
    selectBlackList,
    selectBlackListOn,
    selectClearTrigger,
    selectOwnVoice,
    selectSpeechVolume,
    selectTwitchTTSOn,
    selectTwitchVoice,
    selectWhiteList,
    selectWhiteListOn,
} from "../model/slice";

import s from "./TTSChat.module.scss";

import {
    selectLastMessage,
    selectRevoiceMessage,
    setNextVoiceForNickname,
} from "../../../entities/connection/model/slice";

import { useEmoteContext } from "../../../shared/context/emotes/EmoteContext";
import { useCallback, useEffect, useRef } from "react";
import { transliterateMessage } from "../../live-chat/lib/transliteration";

export const TTSChat = () => {
    const currentVolume = useSelector(selectSpeechVolume) / 100;
    const message = useSelector(selectLastMessage)[0];
    const revoiceMessage = useSelector(selectRevoiceMessage);
    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);
    const twitchVoice = useSelector(selectTwitchVoice);
    const clearTrigger = useSelector(selectClearTrigger);
    const ownVoice = useSelector(selectOwnVoice);
    const whiteListOn = useSelector(selectWhiteListOn);
    const whiteList = useSelector(selectWhiteList);
    const blackListOn = useSelector(selectBlackListOn);
    const blackList = useSelector(selectBlackList);

    const dispatch = useDispatch();

    const baseUrl = import.meta.env.VITE_BASE_URL_API || "";

    const { stripEmotesFromRawText } = useEmoteContext();

    const audioRef = useRef(null);
    const normalQueueRef = useRef([]); // Обычная очередь
    const priorityQueueRef = useRef([]); // Приоритетная очередь (revoice)
    const isPlayingRef = useRef(false);
    const pausedUrlRef = useRef(null); // Сохраняем URL при паузе
    const pausedTimeRef = useRef(0); // Сохраняем время паузы

    const playNext = useCallback(() => {
        if (isPlayingRef.current) return;

        // Сначала проверяем приоритетную очередь
        if (priorityQueueRef.current.length > 0) {
            isPlayingRef.current = true;
            const url = priorityQueueRef.current.shift();

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play().catch((err) => {
                    console.error("[TTS] Ошибка воспроизведения:", err);
                    isPlayingRef.current = false;
                    playNext(); // пробуем следующее
                });
            }
            return;
        }

        // Затем обычную очередь
        if (normalQueueRef.current.length > 0) {
            isPlayingRef.current = true;
            const url = normalQueueRef.current.shift();

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play().catch((err) => {
                    console.error("[TTS] Ошибка воспроизведения:", err);
                    isPlayingRef.current = false;
                    playNext(); // пробуем следующее
                });
            }
            return;
        }

        // Очереди пусты
        isPlayingRef.current = false;
    }, []);

    // Возобновление паузы
    const resumeFromPause = useCallback(() => {
        if (pausedUrlRef.current && audioRef.current) {
            audioRef.current.src = pausedUrlRef.current;
            audioRef.current.currentTime = pausedTimeRef.current;
            audioRef.current
                .play()
                .then(() => {
                    isPlayingRef.current = true;
                    pausedUrlRef.current = null;
                    pausedTimeRef.current = 0;
                })
                .catch((err) => {
                    console.error("[TTS] Ошибка возобновления:", err);
                    isPlayingRef.current = false;
                    // Если не получилось возобновить, чистим URL и идем дальше
                    if (pausedUrlRef.current) {
                        URL.revokeObjectURL(pausedUrlRef.current);
                        pausedUrlRef.current = null;
                    }
                    playNext();
                });
        } else {
            playNext();
        }
    }, [playNext]);

    const getMessageAndName = (messageObj) => {
        let textMessage = "";
        let userName = "";
        let nextVoice = false;
        if (messageObj?.service === "twitch") {
            textMessage = stripEmotesFromRawText(
                messageObj?.message || messageObj?.text,
            );
            userName = messageObj?.tags?.["display-name"] || messageObj?.user;
        } else if (messageObj?.service === "vk") {
            textMessage = messageObj?.clearMessage || messageObj?.text;
            userName = messageObj?.user || messageObj?.user;
        } else if (messageObj?.service === "youtube") {
            textMessage = messageObj?.clearMessage || messageObj?.text;
            userName = messageObj?.user || messageObj?.user;
        }

        if (textMessage.includes("!голос")) {
            nextVoice = true;
            textMessage = textMessage.replace("!голос", "");
        }
        return { textMessage, userName, nextVoice };
    };

    const handleSpeak = useCallback(
        async (messageObj, isPriority = false) => {
            const { textMessage, userName } = getMessageAndName(messageObj);

            const voicesMap = JSON.parse(localStorage.getItem("voices")) || {};
            if (!isTwitchTTSOn) return;

            const speaker = ownVoice
                ? voicesMap[userName] || twitchVoice
                : twitchVoice;

            console.log("[TTS] speaker", speaker, userName, ownVoice);

            let noEmoteText = textMessage;

            try {
                const res = await fetch(`${baseUrl}/api/speak`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: transliterateMessage(noEmoteText),
                        speaker: speaker,
                    }),
                });

                if (!res.ok) {
                    console.error("[TTS] API error response");
                    return;
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                if (isPriority) {
                    // Приоритетное сообщение
                    // Если сейчас что-то играет - ставим на паузу
                    if (
                        isPlayingRef.current &&
                        audioRef.current &&
                        !audioRef.current.paused
                    ) {
                        // Сохраняем текущее состояние
                        pausedUrlRef.current = audioRef.current.src;
                        pausedTimeRef.current = audioRef.current.currentTime;
                        audioRef.current.pause();
                        isPlayingRef.current = false;
                    }
                    // Добавляем в начало приоритетной очереди
                    priorityQueueRef.current.unshift(url);
                    playNext();
                } else {
                    // Обычное сообщение, добавляем в конец очереди
                    normalQueueRef.current.push(url);
                    playNext();
                }
            } catch (err) {
                console.error("Ошибка запроса к TTS серверу:", err);
            }
        },
        [
            baseUrl,
            isTwitchTTSOn,
            stripEmotesFromRawText,
            twitchVoice,
            playNext,
            ownVoice,
        ],
    );

    const handleAudioEnd = useCallback(() => {
        isPlayingRef.current = false;
        // Чистим URL для освобождения памяти
        if (audioRef.current?.src) {
            URL.revokeObjectURL(audioRef.current.src);
        }
        resumeFromPause(); // Проверяем, нужно ли возобновить паузу
    }, [resumeFromPause]);

    const handleAudioError = useCallback(() => {
        console.error("[TTS] Ошибка аудио");
        isPlayingRef.current = false;
        if (audioRef.current?.src) {
            URL.revokeObjectURL(audioRef.current.src);
        }
        resumeFromPause(); // Проверяем, нужно ли возобновить паузу
    }, [resumeFromPause]);

    // Обработка обычных сообщений
    useEffect(() => {
        const { userName } = getMessageAndName(message);
        const shouldSkip =
            (whiteListOn &&
                !whiteList.some((user) => user.name === userName)) ||
            (blackListOn && blackList.some((user) => user.name === userName));
        if (message) {
            if (shouldSkip) return;
            handleSpeak(message, false);
        }
    }, [message, handleSpeak, whiteListOn, whiteList, blackListOn, blackList]);

    // Обработка следующего голоса
    useEffect(() => {
        if (message) {
            const { userName, nextVoice } = getMessageAndName(message);
            if (nextVoice) {
                dispatch(setNextVoiceForNickname(userName));
            }
        }
    }, [message, dispatch]);

    // Обработка приоритетных сообщений (revoice)
    useEffect(() => {
        if (revoiceMessage) {
            handleSpeak(revoiceMessage, true);
        }
    }, [revoiceMessage, handleSpeak]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = currentVolume || 0;
        }
    }, [currentVolume]);

    useEffect(() => {
        return () => {
            // Очистка при размонтировании
            normalQueueRef.current = [];
            priorityQueueRef.current = [];
            if (audioRef.current) {
                audioRef.current.pause();
                if (audioRef.current.src) {
                    URL.revokeObjectURL(audioRef.current.src);
                }
            }
            if (pausedUrlRef.current) {
                URL.revokeObjectURL(pausedUrlRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (window.electronAPI?.onSkipAudio) {
            const skip = window.electronAPI.onSkipAudio(() => {
                if (audioRef.current && !audioRef.current.ended) {
                    audioRef.current.currentTime = audioRef.current.duration;
                }
            });
            return skip;
        }
    }, []);

    useEffect(() => {
        if (clearTrigger) {
            // Очищаем очереди
            normalQueueRef.current = [];
            priorityQueueRef.current = [];

            // Останавливаем текущее воспроизведение
            if (audioRef.current) {
                audioRef.current.pause();
                if (audioRef.current.src) {
                    URL.revokeObjectURL(audioRef.current.src);
                }
            }

            // Сбрасываем состояние
            isPlayingRef.current = false;
            if (pausedUrlRef.current) {
                URL.revokeObjectURL(pausedUrlRef.current);
                pausedUrlRef.current = null;
            }
            pausedTimeRef.current = 0;
        }
    }, [clearTrigger]);

    return (
        <div className={s.wrapper}>
            <audio
                ref={audioRef}
                onEnded={handleAudioEnd}
                onError={handleAudioError}
            />
        </div>
    );
};
