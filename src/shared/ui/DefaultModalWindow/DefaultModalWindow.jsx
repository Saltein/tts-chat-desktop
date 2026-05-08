import { DefaultWidgetShape } from "../../widgets/DefaultWidgetShape/DefaultWidgetShape";
import s from "./DefaultModalWindow.module.scss";
import { createPortal } from "react-dom";

export const DefaultModalWindow = ({
    children,
    onClose,
    backgroundColor,
    padding,
    title,
}) => {
    const handleBackgroundMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className={s.background} onMouseDown={handleBackgroundMouseDown}>
            <DefaultWidgetShape
                animated
                backgroundColor={backgroundColor && backgroundColor}
                padding={padding && padding}
                title={title}
                justifyTitle={"center"}
            >
                {children}
            </DefaultWidgetShape>
        </div>,
        document.body,
    );
};
