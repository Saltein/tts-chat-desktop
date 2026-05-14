import s from "./DefaultButton.module.scss";
import { useState, useRef, useEffect } from "react";

export const DefaultButton = ({
    title,
    onClick,
    height = "48px",
    width,
    active = true,
    color,
    textColor,
    borderRadius,
    flex,
    hold = false,
}) => {
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const HOLD_DURATION = 1000;

    const [actualTitle, setActualTitle] = useState(title);

    const styles = {
        color: textColor ?? undefined,
        height: height ?? undefined,
        width: width ?? undefined,
        backgroundColor: active ? color : undefined,
        borderRadius: borderRadius ?? undefined,
        flex,
    };

    const updateProgress = (currentTime) => {
        if (!startTimeRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
            animationRef.current = requestAnimationFrame(updateProgress);
        }
    };

    const handleMouseDown = () => {
        if (!active || !hold) return;
        setActualTitle("Удерживание...");

        startTimeRef.current = performance.now();
        setProgress(0);

        // Запускаем анимацию прогресса
        animationRef.current = requestAnimationFrame(updateProgress);

        // Таймер для вызова onClick
        timerRef.current = setTimeout(() => {
            setActualTitle("Готово!");
            onClick?.();
            // Сбрасываем прогресс после выполнения
            setProgress(0);
        }, HOLD_DURATION);
    };

    const handleMouseUp = () => {
        setActualTitle(title);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        setProgress(0);
        startTimeRef.current = null;
    };

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        setProgress(0);
        startTimeRef.current = null;
    };

    const handleClick = () => {
        if (!active) return;

        if (!hold) {
            onClick?.();
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div
            style={styles}
            className={`${s.wrapper} ${!active ? s.disabled : ""}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {active && (
                <div className={s.shine}>
                    <div className={s.shine1} />
                    <div className={`${s.shine1} ${s.s}`} />
                </div>
            )}
            <span className={s.text}>{actualTitle}</span>
            {hold && active && progress > 0 && (
                <div
                    className={s.progressBar}
                    style={{ width: `${progress}%` }}
                />
            )}
        </div>
    );
};
