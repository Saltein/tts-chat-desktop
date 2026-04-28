import { useRef, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectConsoleMessages, selectConsoleWidgetOpen } from "../model/slice";
import s from "./TTSConsole.module.scss";
import { TTSConsoleMessage } from "./TTSConsoleMessage/TTSConsoleMessage";
import DownIcon from "../../../shared/assets/icons/chevron-down.svg?react";
import { selectTwitchTTSOn } from "../../tts-chat/model/slice";

export const TTSConsole = () => {
    const ttsOn = useSelector(selectTwitchTTSOn);
    const consoleMessages = useSelector(selectConsoleMessages);
    const consoleWidgetOpen = useSelector(selectConsoleWidgetOpen);
    console.log("consoleWidgetOpen", consoleWidgetOpen);

    const containerRef = useRef(null);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [prevMessagesLength, setPrevMessagesLength] = useState(0);

    // Проверка, находится ли пользователь внизу
    const checkIfAtBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return true;

        const threshold = 24; // Порог в пикселях
        const atBottom =
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <=
            threshold;
        return atBottom;
    }, []);

    // Прокрутка вниз
    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, []);

    // Мгновенная прокрутка вниз (без анимации)
    const immediateScrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, []);

    // Обработка скролла
    const handleScroll = useCallback(() => {
        const atBottom = checkIfAtBottom();
        setIsAtBottom(atBottom);
        setShowScrollButton(!atBottom);
    }, [checkIfAtBottom]);

    // Автоматическая прокрутка при новых сообщениях
    useEffect(() => {
        // Проверяем, добавились ли новые сообщения
        if (consoleMessages.length > prevMessagesLength) {
            const newMessages = consoleMessages.slice(prevMessagesLength);

            // Проверяем, нужно ли прокручивать (если внизу или новые сообщения от system/assistant)
            const shouldAutoScroll =
                isAtBottom ||
                newMessages.some(
                    (msg) =>
                        msg.event === "system" || msg.event === "assistant",
                );

            if (shouldAutoScroll) {
                immediateScrollToBottom();
            }

            setPrevMessagesLength(consoleMessages.length);
        }
    }, [
        consoleMessages,
        prevMessagesLength,
        isAtBottom,
        immediateScrollToBottom,
    ]);

    // Инициализация: прокрутка вниз при первом рендере
    useEffect(() => {
        if (consoleMessages.length > 0) {
            immediateScrollToBottom();
        }
    }, []); // Пустой массив зависимостей для выполнения только один раз

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
                <div className={s.scrollAnchor} />
            </div>

            {showScrollButton && consoleWidgetOpen && (
                <button
                    className={s.scrollButton}
                    onClick={scrollToBottom}
                    title="Прокрутить вниз"
                >
                    <DownIcon height={32} width={32} />
                </button>
            )}
        </div>
    );
};
