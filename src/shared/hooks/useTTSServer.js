import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotice } from "../../features/in-app-notices/model/slice";
import { genRandStr } from "../lib/genRandStr";
import { selectTwitchTTSOn } from "../../features/tts-chat/model/slice";

export const useTTSServer = (isWidget = false) => {
    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!window.electronAPI) return;
        if (isWidget) return;

        const sync = async () => {
            try {
                if (isTwitchTTSOn) {
                    await window.electronAPI.startTTSServer();
                } else {
                    await window.electronAPI.stopTTSServer();
                }
            } catch (e) {
                window.electronAPI.vk.onNotice(() => {
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: "Ошибка запуска TTS сервера: " + e.message,
                        }),
                    );
                });
            }
        };

        sync();
    }, [isTwitchTTSOn, isWidget, dispatch]);

    useEffect(() => {
        let interval;
        let timeout;

        if (isTwitchTTSOn) {
            interval = setInterval(() => {
                window.electronAPI.stopTTSServer();
                timeout = setTimeout(() => {
                    window.electronAPI.startTTSServer();
                }, 500);
            }, 300000); // 5 min
        } else {
            clearInterval(interval);
            clearTimeout(timeout);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isTwitchTTSOn]);

    return null;
};
