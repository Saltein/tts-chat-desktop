import { DefaultWidgetShape } from "../../widgets/DefaultWidgetShape/DefaultWidgetShape";
import s from "./DefaultModalWindow.module.scss";
import { createPortal } from "react-dom";
import CloseIcon from "../../assets/icons/close.svg?react";

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
                TitleChildComponent={CloseButton}
                titleChildComponentProps={{ onClose }}
            >
                {children}
            </DefaultWidgetShape>
        </div>,
        document.body,
    );
};

const CloseButton = ({ onClose }) => {
    return (
        <div
            className={s.closeButton}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            title="Закрыть окно"
        >
            <CloseIcon className={s.icon} />
        </div>
    );
};
