import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useLayoutEffect,
} from "react";

export const useScrollChat = (messages = []) => {
    const containerRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const prevMessagesLengthRef = useRef(0);
    const isInitialMount = useRef(true);

    // Проверка, находится ли пользователь у нижней границы (с порогом 24px)
    const checkIfAtBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return true;
        const threshold = 24;
        return (
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <=
            threshold
        );
    }, []);

    // Плавная прокрутка вниз (для кнопки)
    const scrollToBottom = useCallback(() => {
        if (!containerRef.current) return;
        containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
        });
        // После нажатия кнопки снова включаем автопрокрутку
        setAutoScrollEnabled(true);
    }, []);

    // Мгновенная прокрутка (без анимации) для новых сообщений
    const immediateScrollToBottom = useCallback(() => {
        if (!containerRef.current) return;
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, []);

    // Обработчик события скролла
    const handleScroll = useCallback(() => {
        const atBottom = checkIfAtBottom();
        // Показываем кнопку, только если автопрокрутка выключена (пользователь ушёл вверх)
        setShowScrollButton(!autoScrollEnabled);

        // Если пользователь сам докрутил до низа — включаем автопрокрутку обратно
        if (atBottom && !autoScrollEnabled) {
            setAutoScrollEnabled(true);
        }
        // Если пользователь ушёл от низа (скролл вверх) — выключаем автопрокрутку
        if (!atBottom && autoScrollEnabled) {
            setAutoScrollEnabled(false);
        }
    }, [autoScrollEnabled, checkIfAtBottom]);

    // При изменении размера контента или появлении новых сообщений корректируем состояние кнопки
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const atBottom = checkIfAtBottom();
        // Если мы внизу — автопрокрутка должна быть включена
        if (atBottom && !autoScrollEnabled) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAutoScrollEnabled(true);
        }
        setShowScrollButton(!autoScrollEnabled);
    }, [autoScrollEnabled, checkIfAtBottom, messages]);

    // Автоматическая прокрутка при добавлении новых сообщений
    useEffect(() => {
        const prevLen = prevMessagesLengthRef.current;
        const currentLen = messages.length;

        if (currentLen > prevLen) {
            // Если автопрокрутка включена — прокручиваем вниз
            if (autoScrollEnabled) {
                immediateScrollToBottom();
            }
            prevMessagesLengthRef.current = currentLen;
        }
    }, [messages, autoScrollEnabled, immediateScrollToBottom]);

    // Первоначальная прокрутка при монтировании (если есть сообщения)
    useEffect(() => {
        if (isInitialMount.current && messages.length > 0) {
            requestAnimationFrame(() => {
                scrollToBottom(); // плавно и с включением autoScrollEnabled
            });
            isInitialMount.current = false;
        }
    }, [messages.length, scrollToBottom]);

    return {
        containerRef,
        showScrollButton,
        scrollToBottom,
        handleScroll,
    };
};
