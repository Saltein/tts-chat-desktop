import { useDispatch, useSelector } from "react-redux";
import s from "./NoticeStack.module.scss";
import { addNotice, selectFiveInAppNotices } from "../../model/slice";
import { NoticeItem } from "../NoticeItem/NoticeItem";
import { useEffect } from "react";
import { genRandStr } from "../../../../shared/lib/genRandStr";
import { selectChatFullscreen } from "../../../live-chat/model/slice";

export const NoticeStack = () => {
    const dispatch = useDispatch();

    const stack = useSelector(selectFiveInAppNotices);
    const isChatFullscreen = useSelector(selectChatFullscreen);

    useEffect(() => {
        console.log("Subscribing to notice...");
        const unsub = window.electronAPI.vk.onNotice((data) => {
            console.log("NOTICE RECEIVED:", data);
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: data.type,
                    message: data.message,
                }),
            );
        });
        return unsub;
    }, [dispatch]);

    return (
        <div className={`${s.wrapper_NoticeStack} ${isChatFullscreen ? s.fullscreen : ""}`}>
            {stack.map((notice) => (
                <NoticeItem key={notice.id} notice={notice} />
            ))}
        </div>
    );
};
