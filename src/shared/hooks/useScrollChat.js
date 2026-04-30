import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollChat = (messages = []) => {
    const containerRef = useRef(null);

    // фиксируем состояние “пользователь внизу”
    const isAtBottomRef = useRef(true);

    const [showScrollButtonActual, setShowScrollButtonActual] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // проверка "внизу ли пользователь"
    const checkIfAtBottom = useCallback(() => {
        const el = containerRef.current;
        if (!el) return true;

        const threshold = 64;

        return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    }, []);

    // мягкий скролл вниз (по кнопке)
    const scrollToBottom = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
        });

        isAtBottomRef.current = true;
        setShowScrollButtonActual(false);
    }, []);

    // мгновенный скролл (для новых сообщений)
    const forceScrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            const el = containerRef.current;
            if (!el) return;

            el.scrollTop = el.scrollHeight;
        });
    }, []);

    // обработка ручного скролла
    const handleScroll = useCallback(() => {
        const atBottom = checkIfAtBottom();

        isAtBottomRef.current = atBottom;
        setShowScrollButtonActual(!atBottom);
    }, [checkIfAtBottom]);

    // авто-скролл при новых сообщениях
    useEffect(() => {
        if (!messages.length) return;

        if (isAtBottomRef.current) {
            forceScrollToBottom();
        }
    }, [messages, forceScrollToBottom]);

    // первичная прокрутка при загрузке чата
    useEffect(() => {
        if (messages.length === 0) return;

        requestAnimationFrame(() => {
            const el = containerRef.current;
            if (!el) return;

            el.scrollTop = el.scrollHeight;
            isAtBottomRef.current = true;
        });
    }, []);

    // синхронизация кнопки при изменении сообщений
    useEffect(() => {
        const atBottom = isAtBottomRef.current;
        setShowScrollButtonActual(!atBottom);
    }, [messages]);

    useEffect(() => {
        let timer = setTimeout(() => {
            setShowScrollButton(showScrollButtonActual);
        }, 200);

        return () => clearTimeout(timer);
    }, [showScrollButtonActual]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => {
            if (isAtBottomRef.current) {
                forceScrollToBottom();
            }
        });

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [forceScrollToBottom]);

    return {
        containerRef,
        showScrollButton,
        scrollToBottom,
        handleScroll,
    };
};
