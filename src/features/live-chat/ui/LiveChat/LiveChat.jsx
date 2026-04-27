import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import s from "./LiveChat.module.scss";
import { selectLast50Messages } from "../../../../entities/connection/model/slice";
import { ChatMessage } from "../ChatMessage/ChatMessage";
import {
    selectMessageGap,
    selectMessageLifeTime,
} from "../../../../entities/message/model/slice";
import WebSocketRoom from "../../../ws-lobby/ui/LobbyBlock/WebSocketRoom";
import FullscreenIcon from "../../../../shared/assets/icons/fullscreen.svg?react";
import FullscreenExitIcon from "../../../../shared/assets/icons/fullscreen-exit.svg?react";
import { createPortal } from "react-dom";
import { genRandStr } from "../../../../shared/lib/genRandStr";

export const LiveChat = ({ backgroundColor, isWidget }) => {
    const [isFullScreened, setIsFullScreened] = useState(false);

    const messages = useSelector(selectLast50Messages);
    const messageGap = useSelector(selectMessageGap);
    const chatEndRef = useRef(null);

    const timeBeforeDisappear = useSelector(selectMessageLifeTime);

    const styles = {
        backgroundColor: backgroundColor ?? undefined,
        height: isWidget ? "100vh" : "",
        gap: messageGap + "px" ?? undefined,
    };

    function toggleFullscreen() {
        setIsFullScreened((prev) => !prev);
    }

    useEffect(() => {
        // Прокрутка вниз при добавлении нового сообщения
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const content = (
        <div
            className={`${s.megaWrapper} ${isFullScreened ? s.fullscreen : ""}`}
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
                className={s.wrapper}
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
                    message={{
                        message: "Так будут выглядеть сообщения из чата",
                        tags: {
                            "display-name": "TTS Chat",
                            color: "var(--color-accent)",
                        },
                        time: Date.now(),
                        service: "ttschat",
                    }}
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
