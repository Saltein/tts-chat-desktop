import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addNotice } from "../../features/in-app-notices/model/slice";
import { genRandStr } from "../lib/genRandStr";

export const useAppUpdater = () => {
    const dispatch = useDispatch();

    const [updateStatus, setUpdateStatus] = useState({
        status: "idle", // idle, checking, available, downloading, downloaded, error
        version: null,
        progress: 0,
        error: null,
        updateInfo: null, // хранит информацию о доступном обновлении
    });

    const checkForUpdates = useCallback(() => {
        if (window.electronAPI?.updater?.checkForUpdates) {
            window.electronAPI.updater.checkForUpdates();
        }
    }, []);

    // НОВЫЙ МЕТОД: скачать обновление вручную
    const downloadUpdate = useCallback(() => {
        if (window.electronAPI?.updater?.downloadUpdate) {
            window.electronAPI.updater.downloadUpdate();
        } else {
            console.warn("downloadUpdate method not available");
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "error",
                    message: "Ошибка: метод скачивания обновления не доступен",
                }),
            );
        }
    }, [dispatch]);

    const restartAndUpdate = useCallback(() => {
        if (window.electronAPI?.updater?.restartAndUpdate) {
            window.electronAPI.updater.restartAndUpdate();
        }
    }, []);

    // НОВЫЙ МЕТОД: получить информацию об ожидающем обновлении
    const getPendingUpdate = useCallback(async () => {
        if (window.electronAPI?.updater?.getPendingUpdate) {
            try {
                const pendingUpdate =
                    await window.electronAPI.updater.getPendingUpdate();
                if (pendingUpdate) {
                    setUpdateStatus((prev) => ({
                        ...prev,
                        updateInfo: pendingUpdate,
                        version: pendingUpdate.version,
                    }));
                }
                return pendingUpdate;
            } catch (error) {
                console.error("Failed to get pending update:", error);
                return null;
            }
        }
        return null;
    }, []);

    useEffect(() => {
        if (!window.electronAPI?.updater) return;

        let unsubscribeStatus = null;
        let unsubscribeProgress = null;

        // Слушаем статус обновления
        if (window.electronAPI.updater.onUpdateStatus) {
            const result = window.electronAPI.updater.onUpdateStatus((data) => {
                console.log("Update status:", data);

                setUpdateStatus((prev) => ({
                    ...prev,
                    status: data.status,
                    version: data.version || prev.version,
                    error: data.error || null,
                    // Если есть информация о версии, сохраняем ее
                    updateInfo:
                        data.status === "available"
                            ? {
                                  version: data.version,
                                  releaseNotes: data.releaseNotes,
                                  releaseDate: data.releaseDate,
                              }
                            : prev.updateInfo,
                }));

                if (data.status === "error") {
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: `Ошибка обновления: ${data.error.includes("Cannot find latest.yml") ? "Разработчик забыл добавить latest.yml" : data.error}`,
                        }),
                    );
                }
            });

            // Проверяем, что вернулось, и сохраняем функцию для отписки
            if (typeof result === "function") {
                unsubscribeStatus = result;
            } else if (result && typeof result.unsubscribe === "function") {
                unsubscribeStatus = () => result.unsubscribe();
            }
        }

        // Слушаем прогресс загрузки
        if (window.electronAPI.updater.onUpdateProgress) {
            const result = window.electronAPI.updater.onUpdateProgress(
                (data) => {
                    console.log("Download progress:", data.percent);

                    setUpdateStatus((prev) => ({
                        ...prev,
                        status: "downloading",
                        progress: data.percent || 0,
                    }));
                },
            );

            if (typeof result === "function") {
                unsubscribeProgress = result;
            } else if (result && typeof result.unsubscribe === "function") {
                unsubscribeProgress = () => result.unsubscribe();
            }
        }

        // При монтировании проверяем, есть ли уже ожидающее обновление
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getPendingUpdate();

        return () => {
            if (unsubscribeStatus && typeof unsubscribeStatus === "function") {
                unsubscribeStatus();
            }
            if (
                unsubscribeProgress &&
                typeof unsubscribeProgress === "function"
            ) {
                unsubscribeProgress();
            }
        };
    }, [dispatch, getPendingUpdate]);

    return {
        updateStatus,
        checkForUpdates,
        downloadUpdate, // НОВЫЙ МЕТОД
        restartAndUpdate,
        getPendingUpdate, // НОВЫЙ МЕТОД
        isChecking: updateStatus.status === "checking",
        isAvailable: updateStatus.status === "available",
        isDownloading: updateStatus.status === "downloading",
        isDownloaded: updateStatus.status === "downloaded",
        hasError: updateStatus.status === "error",
        progress: updateStatus.progress,
        version: updateStatus.version,
        updateInfo: updateStatus.updateInfo,
    };
};
