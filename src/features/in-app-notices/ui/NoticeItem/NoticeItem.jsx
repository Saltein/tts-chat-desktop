import { useDispatch } from "react-redux";
import s from "./NoticeItem.module.scss";
import { useEffect, useState } from "react";
import { removeNotice } from "../../model/slice";

export const NoticeItem = ({ notice, time = 5000 }) => {
    const dispatch = useDispatch();

    const [readyToDisappear, setReadyToDisappear] = useState(false);

    const styles = {
        error: s.error,
        warning: s.warning,
        info: s.info,
        success: s.success,
    };

    useEffect(() => {
        const animTime = time >= 500 ? time - 500 : 0;
        const timerAnimate = setTimeout(() => {
            setReadyToDisappear(true);
        }, animTime);

        const timer = setTimeout(() => {
            dispatch(removeNotice(notice.id));
        }, time);

        return () => {
            clearTimeout(timer);
            clearTimeout(timerAnimate);
        };
    }, [dispatch, notice.id, time]);

    const handlePress = async () => {
        try {
            await navigator.clipboard.writeText(notice.message);
            console.log("Текст скопирован:", notice.message);
        } catch (err) {
            console.error("Ошибка при копировании:", err);
        }

        dispatch(removeNotice(notice.id));
    };

    return (
        <div
            className={`${s.wrapper_NoticeItem} ${styles[notice.type]} ${readyToDisappear && s.animate}`}
            onClick={handlePress}
        >
            {notice.message}
        </div>
    );
};
