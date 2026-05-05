import { useCallback, useEffect, useState } from "react";

export const useAppUpdater = () => {
    const [updateStatus, setUpdateStatus] = useState({
        status: "idle", // idle, checking, available, downloading, downloaded, error
        version: null,
        progress: 0,
        error: null,
    });

    const checkForUpdates = useCallback(() => {
        if (window.electronAPI?.updater?.checkForUpdates) {
            window.electronAPI.updater.checkForUpdates();
        }
    }, []);

    const restartAndUpdate = useCallback(() => {
        if (window.electronAPI?.updater?.restartAndUpdate) {
            window.electronAPI.updater.restartAndUpdate();
        }
    }, []);

    useEffect(() => {
        if (!window.electronAPI?.updater) return;

        // Слушаем статус обновления
        const unsubscribeStatus = window.electronAPI.updater.onUpdateStatus(
            (data) => {
                console.log("Update status:", data);

                setUpdateStatus((prev) => ({
                    ...prev,
                    status: data.status,
                    version: data.version || prev.version,
                    error: data.error || null,
                }));
            },
        );

        // Слушаем прогресс загрузки
        const unsubscribeProgress = window.electronAPI.updater.onUpdateProgress(
            (data) => {
                console.log("Download progress:", data.percent);

                setUpdateStatus((prev) => ({
                    ...prev,
                    status: "downloading",
                    progress: data.percent || 0,
                }));
            },
        );

        return () => {
            if (unsubscribeStatus) unsubscribeStatus();
            if (unsubscribeProgress) unsubscribeProgress();
        };
    }, [checkForUpdates]);

    return {
        updateStatus,
        checkForUpdates,
        restartAndUpdate,
        isChecking: updateStatus.status === "checking",
        isAvailable: updateStatus.status === "available",
        isDownloading: updateStatus.status === "downloading",
        isDownloaded: updateStatus.status === "downloaded",
        hasError: updateStatus.status === "error",
    };
};
