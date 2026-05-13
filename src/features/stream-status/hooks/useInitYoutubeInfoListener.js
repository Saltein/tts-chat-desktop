import { useDispatch, useSelector } from "react-redux";
import { getYoutubeVideoId } from "../../../shared/lib/getYoutubeVideoId";
import {
    selectYoutubeConnectionStatus,
    selectYoutubeVideoId,
} from "../../../entities/connection/model/slice";
import { useEffect } from "react";
import {
    selectYoutubeStatus,
    setYoutubeLikes,
    setYoutubeViewers,
} from "../model/slice";

export const useInitYoutubeInfoListener = () => {
    const dispatch = useDispatch();

    const youtubeIdDirty = useSelector(selectYoutubeVideoId);
    const youtubeConnected = useSelector(selectYoutubeConnectionStatus);
    const youtubeId = getYoutubeVideoId(youtubeIdDirty?.youtubeVideoId);

    const { likes, viewers } = useSelector(selectYoutubeStatus);

    useEffect(() => {
        if (!youtubeId || !youtubeConnected) return;

        console.log("[App.jsx] youtubeId", youtubeId);

        async function updateInfo() {
            const info = await window.electronAPI.youtube.onInfo(youtubeId);

            console.log("[App.jsx] info", info);

            dispatch(setYoutubeLikes(info.likes));
            dispatch(setYoutubeViewers(info.viewers));
        }

        updateInfo();

        const interval = setInterval(() => {
            updateInfo();
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    }, [youtubeId, youtubeConnected, dispatch]);

    return { likes, viewers };
};
