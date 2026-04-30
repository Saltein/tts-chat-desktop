import { useSelector } from "react-redux";
import { selectConsoleMessages, selectConsoleWidgetOpen } from "../model/slice";
import s from "./TTSConsole.module.scss";
import { TTSConsoleMessage } from "./TTSConsoleMessage/TTSConsoleMessage";
import DownIcon from "../../../shared/assets/icons/chevron-down.svg?react";
import { selectTwitchTTSOn } from "../../tts-chat/model/slice";
import { useScrollChat } from "../../../shared/hooks/useScrollChat";
import { ScrollToBottomButton } from "../../../shared/ui";

export const TTSConsole = () => {
    const ttsOn = useSelector(selectTwitchTTSOn);
    const consoleMessages = useSelector(selectConsoleMessages);
    const consoleWidgetOpen = useSelector(selectConsoleWidgetOpen);

    const { containerRef, showScrollButton, scrollToBottom, handleScroll } =
        useScrollChat(consoleMessages);

    if (!ttsOn) {
        return (
            <div className={s.wrapper}>
                <span className={s.infoStr}>Включите озвучку сообщений</span>
            </div>
        );
    }

    return (
        <div className={s.wrapper}>
            {consoleMessages.length === 0 && (
                <span className={s.infoStr}>Сообщений в консоли пока нет</span>
            )}

            <div
                ref={containerRef}
                className={s.consoleContainer}
                onScroll={handleScroll}
            >
                {consoleMessages.map((message) => (
                    <TTSConsoleMessage key={message.id} message={message} />
                ))}
            </div>

            {showScrollButton && consoleWidgetOpen && (
                <ScrollToBottomButton onClick={scrollToBottom} />
            )}
        </div>
    );
};
