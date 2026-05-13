import { useState } from "react";
import { DefaultTitle } from "../../ui";
import s from "./DefaultWidgetShape.module.scss";
import { useDispatch } from "react-redux";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg?react";

export const DefaultWidgetShape = ({
    onClick,
    children,
    width,
    height,
    padding,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    gap,
    margin,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    backgroundColor,
    animated = false,
    shadow,
    title = "Заголовок",
    paddingTopBlock,
    paddingBottomBlock,
    paddingLeftBlock,
    paddingRightBlock,
    paddingBlock,
    justifyTitle,
    noTitle = false,
    backgroundColorBlock,
    noBlock = false,
    flexDirection,
    display,
    flex,
    overflowBlock,
    isMobile = false, // важно
    minimizable = false,
    initialStateMinimized = true,
    globalStateMinimized,
    dispatcherStateMinimized,
    TitleChildComponent,
}) => {
    const [widgetOpen, setWidgetOpen] = useState(
        globalStateMinimized !== undefined
            ? globalStateMinimized
            : initialStateMinimized,
    );

    const dispatch = useDispatch();

    const wrapperStyles = {
        width: isMobile ? "fit-content" : width,
        height: height || isMobile ? height : widgetOpen ? height : "54px",
        paddingLeft: paddingLeft,
        paddingTop: paddingTop ?? undefined,
        ...(padding &&
        !(paddingTop || paddingBottom || paddingLeft || paddingRight)
            ? { padding }
            : {}),
        gap: gap,
        marginTop: marginTop ?? undefined,
        marginBottom: marginBottom ?? undefined,
        marginLeft: marginLeft ?? undefined,
        marginRight: marginRight ?? undefined,
        ...(margin && !(marginTop || marginRight || marginBottom || marginLeft)
            ? { margin }
            : {}),
        backgroundColor: backgroundColor,
        boxShadow:
            shadow && `0 ${shadow}px ${shadow * 1.5}px rgba(0, 0, 0, 0.15)`,
        flex: !widgetOpen ? undefined : (flex ?? undefined),
        cursor: onClick ? "pointer" : "default",
    };

    if (paddingTop || paddingBottom || paddingLeft || paddingRight) {
        wrapperStyles.padding = undefined;
    } else if (padding) {
        wrapperStyles.padding = padding;
    }

    const blockStyles = {
        backgroundColor: backgroundColorBlock ?? undefined,
        paddingTop: paddingTopBlock ?? undefined,
        paddingBottom: paddingBottomBlock ?? undefined,
        paddingLeft: isMobile ? (paddingLeftBlock ?? "4px") : paddingLeftBlock,
        paddingRight: isMobile
            ? (paddingRightBlock ?? "4px")
            : paddingRightBlock,
        ...(paddingBlock &&
        !(
            paddingTopBlock ||
            paddingBottomBlock ||
            paddingLeftBlock ||
            paddingRightBlock
        )
            ? { padding: paddingBlock }
            : {}),
        flexDirection: flexDirection ?? undefined,
        display: display ?? undefined,
        overflow: overflowBlock ?? undefined,
    };

    const titleStyles = {
        textAlign: justifyTitle,
        backgroundColor: widgetOpen ? "transparent" : "var(--color-surface)",
    };

    return (
        <div
            className={`${s.wrapper} ${animated ? s.animated : ""}`}
            style={{ ...wrapperStyles, minWidth: 0 }}
        >
            {!noTitle && (
                <div className={s.header}>
                    <DefaultTitle
                        title={title}
                        titleStyles={titleStyles}
                        cursor={minimizable ? "pointer" : "default"}
                        onClick={() => {
                            onClick?.();
                            if (minimizable) {
                                setWidgetOpen(!widgetOpen);
                                if (dispatcherStateMinimized)
                                    dispatch(
                                        dispatcherStateMinimized(!widgetOpen),
                                    );
                            }
                        }}
                        ChildComponent={TitleChildComponent}
                    />
                    {minimizable && (
                        <div
                            className={`${s.minimizeIconWrapper} ${widgetOpen ? s.open : ""}`}
                        >
                            <ChevronDownIcon className={s.minimizeIcon} />
                        </div>
                    )}
                </div>
            )}

            {noBlock ? (
                <>{children}</>
            ) : (
                <div className={s.mainBlock} style={blockStyles}>
                    {children}
                </div>
            )}
        </div>
    );
};
