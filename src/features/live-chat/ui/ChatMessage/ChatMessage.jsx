import { useEffect, useState } from "react";
import s from "./ChatMessage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    selectFontSize,
    selectMessageBackground,
    selectMessageBackgroundOpacity,
    selectMessageBorder,
    selectMessageNameBackground,
    selectMessageNameBackgroundColor,
    selectMessageNameBackgroundOpacity,
    selectMessageNameBorder,
    selectMessageTextColor,
    selectServiceIcon,
    setMessageBackground,
    setMessageTextColor,
} from "../../../../entities/message/model/slice";
import { useTheme } from "../../../../shared/context/theme/ThemeContext";
import {
    hexToRgbString,
    rgbStringToHex,
} from "../../../../shared/lib/hexToRgbString";

import TwitchIcon from "../../../../shared/assets/icons/twitch-logo.svg?react";
import YoutubeIcon from "../../../../shared/assets/icons/youtube-logo.svg?react";
import YoutubeIcon2 from "../../../../shared/assets/icons/youtube-logo2.svg?react";
import VkVideoIcon from "../../../../shared/assets/icons/vk-video-logo.svg?react";
import TTSChatIcon from "../../../../shared/assets/icons/ttschat-logo.svg?react";
import WrenchIcon from "../../../../shared/assets/icons/wrench.svg?react";

import {
    generateColorFromUsername,
    nameColors,
} from "../../../../shared/lib/generateColorFromUsername";
import { isBright } from "../../../../shared/lib/isBright";

export const ChatMessage = ({ message, timeBeforeDisappear }) => {
    const [visible, setVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    const dispatch = useDispatch();
    const theme = useTheme().theme;

    const messageNameBackground = useSelector(selectMessageNameBackground);
    const messageNameBackgroundColor = useSelector(
        selectMessageNameBackgroundColor,
    );
    const messageNameBackgroundOpacity = useSelector(
        selectMessageNameBackgroundOpacity,
    );
    const messageNameBorder = useSelector(selectMessageNameBorder);

    const messageBorder = useSelector(selectMessageBorder);
    const serviceIcon = useSelector(selectServiceIcon);
    const messageBackgroundOpacity = useSelector(
        selectMessageBackgroundOpacity,
    ); // число от 0 до 1
    const fontSize = useSelector(selectFontSize);

    const isModerator =
        message.tags?.badges?.moderator ||
        message.tags?.["is-moderator"] ||
        message?.raw?.push?.pub?.data?.data?.user?.isChannelModerator ||
        message?.raw?.push?.pub?.data?.data?.user?.isChatModerator ||
        message?.isModerator ||
        null;

    const isSponsor =
        message.tags?.badges?.subscriber ||
        message.tags?.["is-sponsor"] ||
        null;

    const isOwner =
        message?.raw?.push?.pub?.data?.data?.user?.isOwner ||
        message?.isOwner ||
        null;

    let nameColor;
    let borderColor;
    console.log("🦆🐈🍳 message", message);
    if (message.color) {
        console.log("color", message.color);
        nameColor = nameColors[message.color];
    } else if (message.tags ? message.tags["color"] !== "#FFFFFF" : false) {
        nameColor = message.tags["color"];
    } else {
        nameColor = message.tags
            ? generateColorFromUsername(message?.tags["display-name"])
            : generateColorFromUsername(message?.user);
    }
    if (isSponsor) {
        borderColor = "var(--color-sponsor)";
        if (message.service === "youtube") nameColor = "var(--color-sponsor)";
    }
    if (isModerator === "1" || isModerator === true) {
        nameColor = "var(--color-moderator)";
        borderColor = "var(--color-moderator)";
    }
    if (isOwner) {
        borderColor = "var(--color-owner)";
    }

    let messageTextColor = useSelector(selectMessageTextColor);
    if (messageTextColor === "") {
        if (theme === "dark") {
            messageTextColor = "#f3f4f6";
            dispatch(setMessageTextColor(messageTextColor));
        } else {
            messageTextColor = "#111827";
            dispatch(setMessageTextColor(messageTextColor));
        }
    }

    let messageBackground = useSelector(selectMessageBackground); // строка вида "255, 0, 0"
    if (messageBackground === "") {
        if (theme === "dark") {
            messageBackground = "42, 42, 42";
            dispatch(setMessageBackground(messageBackground));
        } else {
            messageBackground = "252, 252, 252";
            dispatch(setMessageBackground(messageBackground));
        }
    }

    const wrapperStyles = {
        backgroundColor: `rgba(${hexToRgbString(messageBackground)}, ${messageBackgroundOpacity})`,
        border: messageBorder === false ? `1px solid #00000000` : undefined,
    };

    const nameStyles = {
        color: nameColor,
        fontSize: fontSize + "px",
    };
    const nameBackgroundStyles = {
        borderColor:
            messageNameBorder === false
                ? "#00000000"
                : isModerator || isSponsor || isOwner
                  ? borderColor
                  : undefined,
        backgroundColor: messageNameBackground
            ? `rgba(${hexToRgbString(messageNameBackgroundColor)}, ${messageNameBackgroundOpacity})`
            : "transparent",
    };
    console.log(
        "🦆🐈🍳 name color",
        `${hexToRgbString(messageNameBackgroundColor)}, ${messageNameBackgroundOpacity}`,
    );

    const textStyles = {
        color: messageTextColor,
        fontSize: fontSize + "px",
        top: serviceIcon ? `${((fontSize - 12) / 16) * -4}px` : 0,
    };

    const iconStyles = {
        left: messageNameBackground ? `${-2}px` : 0,
    };

    useEffect(() => {
        // через timeBeforeDisappear начинаем исчезать
        const fadeTimeout = setTimeout(
            () => setIsFading(true),
            timeBeforeDisappear,
        );
        // через timeBeforeDisappear + 300 скрываем полностью
        const removeTimeout = setTimeout(
            () => setVisible(false),
            timeBeforeDisappear + 300,
        );

        return () => {
            clearTimeout(fadeTimeout);
            clearTimeout(removeTimeout);
        };
    }, [timeBeforeDisappear]);

    if (!visible) return null;

    let Icon;
    if (message?.service === "twitch") {
        Icon = TwitchIcon;
    } else if (message?.service === "youtube") {
        if (isBright(messageNameBackgroundColor)) {
            Icon = YoutubeIcon2;
        } else {
            Icon = YoutubeIcon;
        }
    } else if (message?.service === "vk") {
        Icon = VkVideoIcon;
    } else if (message?.service === "ttschat") {
        Icon = TTSChatIcon;
    }

    return (
        <div
            className={`${s.wrapper} ${isFading ? s.fadeOut : ""}`}
            style={wrapperStyles}
        >
            <div
                className={`${s.name} 
                ${messageNameBackground ? "" : s.noBackground}`}
                style={{ ...nameBackgroundStyles }}
            >
                {serviceIcon && (
                    <Icon
                        height={fontSize - 2}
                        width={fontSize - 2}
                        className={s.icon}
                        style={{
                            ...iconStyles,
                        }}
                    />
                )}
                <span className={s.nameText} style={nameStyles}>
                    {message.tags
                        ? message.tags["display-name"]
                        : message?.user}
                    {!messageNameBackground && " :"}
                    {isModerator && (
                        <WrenchIcon
                            className={s.wrenchIcon}
                            fill="var(--color-moderator)"
                        />
                    )}
                </span>
            </div>
            <span className={s.message} style={textStyles}>
                {message.message ? message.message : message?.text}
            </span>
        </div>
    );
};
