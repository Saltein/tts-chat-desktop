import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import s from "./LiveChat.module.scss";
import { selectLast50Messages } from "../../../../entities/connection/model/slice";
import { ChatMessage } from "../ChatMessage/ChatMessage";
import {
    selectMessageGap,
    selectMessageLifeTime,
    selectPreview,
} from "../../../../entities/message/model/slice";
import WebSocketRoom from "../../../ws-lobby/ui/LobbyBlock/WebSocketRoom";
import FullscreenIcon from "../../../../shared/assets/icons/fullscreen.svg?react";
import FullscreenExitIcon from "../../../../shared/assets/icons/fullscreen-exit.svg?react";
import { createPortal } from "react-dom";
import { selectChatFullscreen, toggleChatFullscreen } from "../../model/slice";

const EXAMPLE_MESSAGE = {
    message: "Так будут выглядеть сообщения из чата",
    tags: {
        "display-name": "TTS Chat",
        color: "var(--color-accent)",
    },
    time: Date.now(),
    service: "ttschat",
};

export const LiveChat = ({ backgroundColor, isWidget }) => {
    const messages = useSelector(selectLast50Messages);
    const messageGap = useSelector(selectMessageGap);
    const isFullScreened = useSelector(selectChatFullscreen);
    const timeBeforeDisappear = useSelector(selectMessageLifeTime);
    const isPreview = useSelector(selectPreview);

    const dispatch = useDispatch();

    const chatEndRef = useRef(null);

    const styles = {
        backgroundColor: backgroundColor ?? undefined,
        height: isWidget ? "100%" : "",
        gap: messageGap ? messageGap + "px" : "0px",
    };

    function toggleFullscreen() {
        dispatch(toggleChatFullscreen());
    }

    useEffect(() => {
        // Прокрутка вниз при добавлении нового сообщения
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const content = (
        <div
            className={`${s.megaWrapper} ${isFullScreened ? s.fullscreen : ""} ${isPreview ? s.preview : ""}`}
        >
            {!isWidget && (
                <div
                    className={`${s.header} ${isFullScreened ? s.fullscreen : ""}`}
                >
                    <div className={s.draggable} />
                    <div
                        className={s.fullscreenButton}
                        onClick={toggleFullscreen}
                    >
                        {isFullScreened ? (
                            <FullscreenExitIcon className={s.icon} />
                        ) : (
                            <FullscreenIcon className={s.icon} />
                        )}
                    </div>
                </div>
            )}

            <div
                className={s.wrapper_Chat}
                style={styles}
                onClick={
                    isFullScreened
                        ? () => {
                              toggleFullscreen();
                          }
                        : () => {}
                }
            >
                {/* {isWidget && <WebSocketRoom inWidget />} */}

                <ChatMessage
                    message={EXAMPLE_MESSAGE}
                    timeBeforeDisappear={timeBeforeDisappear}
                />

                {messages.map((item) => (
                    <ChatMessage
                        key={item.time + item.message + item.id}
                        message={item}
                        timeBeforeDisappear={timeBeforeDisappear}
                    />
                ))}

                <div ref={chatEndRef} className={s.anchor} />
            </div>
        </div>
    );

    return isFullScreened ? createPortal(content, document.body) : content;
};
