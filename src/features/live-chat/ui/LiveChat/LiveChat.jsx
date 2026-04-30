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
import { useScrollChat } from "../../../../shared/hooks/useScrollChat";
import DownIcon from "../../../../shared/assets/icons/chevron-down.svg?react";
import { ScrollToBottomButton } from "../../../../shared/ui";

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

    const { containerRef, showScrollButton, scrollToBottom, handleScroll } =
        useScrollChat(messages);

    const dispatch = useDispatch();

    const styles = {
        backgroundColor: backgroundColor ?? undefined,
        gap: messageGap ? messageGap + "px" : "0px",
        overflowY: isWidget ? "hidden" : "auto",
    };

    function toggleFullscreen() {
        dispatch(toggleChatFullscreen());
    }

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

            <div className={s.scrollCon}>
                <div className={s.spacer} />
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
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
                </div>
            </div>
            {showScrollButton && !isWidget && (
                <ScrollToBottomButton onClick={scrollToBottom} />
            )}
        </div>
    );

    return isFullScreened ? createPortal(content, document.body) : content;
};
