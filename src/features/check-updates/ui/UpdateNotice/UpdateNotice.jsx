import s from "./UpdateNotice.module.scss";
import { useEffect, useState } from "react";
import { useAppUpdater } from "../../../../shared/hooks/useAppUpdater";
import { useDispatch } from "react-redux";
import { addNotice } from "../../../in-app-notices/model/slice";
import { genRandStr } from "../../../../shared/lib/genRandStr";
import { ProgressBar } from "../ProgressBar/ProgressBar";

export const UpdateNotice = () => {
    const {
        updateStatus,
        downloadUpdate,
        restartAndUpdate,
        hasError,
        isDownloaded,
        isDownloading,
        version,
        progress,
    } = useAppUpdater();
    const [updateLater, setUpdateLater] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (hasError) {
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "error",
                    message: "Ошибка при проверке обновлений",
                }),
            );
        }
    }, [hasError, dispatch]);

    useEffect(() => {
        console.log("Update status changed:", updateStatus);
    }, [updateStatus]);

    return (
        <div className={s.wrapper}>
            {updateStatus.status !== "idle" &&
                updateStatus.status !== "error" &&
                updateStatus.status !== "checking" &&
                !updateLater &&
                !hasError && (
                    <div className={s.notice}>
                        <p className={s.text}>
                            Доступно обновление v{version}{" "}
                        </p>
                        {isDownloading ? (
                            <ProgressBar progress={progress} />
                        ) : (
                            <div
                                className={`${s.button} ${s.update}`}
                                onClick={
                                    isDownloaded
                                        ? restartAndUpdate
                                        : downloadUpdate
                                }
                            >
                                {isDownloaded ? "Установить" : "Загрузить"}
                            </div>
                        )}
                        {updateStatus.status === "available" && (
                                <div
                                    className={`${s.button} ${s.later}`}
                                    onClick={() => setUpdateLater(true)}
                                >
                                    Позже
                                </div>
                            )}
                    </div>
                )}
        </div>
    );
};
