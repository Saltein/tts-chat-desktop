import { memo, useEffect, useMemo, useState } from "react";
import s from "./ChatMessage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    selectFontSize,
    selectMessageBackground,
    selectMessageBackgroundOpacity,
    selectMessageBorder,
    selectMessageDisappearing,
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
import { hexToRgbString } from "../../../../shared/lib/hexToRgbString";

import TwitchIcon from "../../../../shared/assets/icons/twitch-logo.svg?react";
import YoutubeIcon from "../../../../shared/assets/icons/youtube-color-svgrepo-com.svg?react";
import VkVideoIcon from "../../../../shared/assets/icons/vk-video-logo.svg?react";
import TTSChatIcon from "../../../../shared/assets/icons/ttschat-logo.svg?react";
import WrenchIcon from "../../../../shared/assets/icons/wrench.svg?react";
import SoundIcon from "../../../../shared/assets/icons/sound.svg?react";

import {
    generateColorFromUsername,
    nameColors,
} from "../../../../shared/lib/generateColorFromUsername";
import {
    deleteMessageById,
    setRevoiceMessage,
} from "../../../../entities/connection/model/slice";
import { genRandStr } from "../../../../shared/lib/genRandStr";
import { addNotice } from "../../../in-app-notices/model/slice";
import { selectTwitchTTSOn } from "../../../tts-chat/model/slice";
import { useEmoteContext } from "../../../../shared/context/emotes/EmoteContext";

export const ChatMessage = memo(({ message, timeBeforeDisappear }) => {
    const { parseText, isReady } = useEmoteContext();

    let messageText = message.message ? message.message : message?.text;

    const parsedMessage = useMemo(() => {
        if (!isReady) return messageText;
        if (message?.service === "twitch") {
            const parsed = parseText(messageText);
            console.log("[ChatMessage] parsedMessage", parsed);
            return parsed;
        }
        return messageText;
    }, [messageText, message?.service, parseText, isReady]);

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
    const messageDisappearing = useSelector(selectMessageDisappearing);

    const ttsOn = useSelector(selectTwitchTTSOn);

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
    if (message.color) {
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

    const textStyles = {
        color: messageTextColor,
        fontSize: fontSize + "px",
        top: serviceIcon ? `${((fontSize - 12) / 16) * -4}px` : 0,
    };

    const iconStyles = {
        left: messageNameBackground ? `${-2}px` : 0,
    };

    useEffect(() => {
        if (!messageDisappearing) return;
        // через timeBeforeDisappear начинаем исчезать
        const fadeTimeout = setTimeout(
            () => setIsFading(true),
            timeBeforeDisappear,
        );
        // через timeBeforeDisappear + 300 скрываем полностью
        const removeTimeout = setTimeout(
            () => dispatch(deleteMessageById(message.id)),
            timeBeforeDisappear + 300,
        );

        return () => {
            clearTimeout(fadeTimeout);
            clearTimeout(removeTimeout);
        };
    }, [timeBeforeDisappear, message.id, dispatch, messageDisappearing]);

    let Icon;
    if (message?.service === "twitch") {
        Icon = TwitchIcon;
    } else if (message?.service === "youtube") {
        Icon = YoutubeIcon;
    } else if (message?.service === "vk") {
        Icon = VkVideoIcon;
    } else if (message?.service === "ttschat") {
        Icon = TTSChatIcon;
    }

    const handleRevoice = async () => {
        dispatch(setRevoiceMessage({ ...message, id: genRandStr() }));
        if (ttsOn) {
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "info",
                    message: "Озвучивание сообщения...",
                }),
            );
        } else {
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "warning",
                    message: "Озвучка отключена",
                }),
            );
        }
        try {
            await navigator.clipboard.writeText(messageText);
            console.log("Текст скопирован:", messageText);
        } catch (err) {
            console.error("Ошибка при копировании:", err);
        }
    };

    return (
        <div
            className={`${s.wrapper} ${isFading ? s.fadeOut : ""} ${messageNameBackground ? "" : s.noNameBackground}`}
            style={wrapperStyles}
            onClick={handleRevoice}
        >
            <div className={s.revoiceWrapper}>
                <SoundIcon className={s.revoiceIcon} />
            </div>
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
                    {isModerator && (
                        <WrenchIcon
                            className={s.wrenchIcon}
                            fill="var(--color-moderator)"
                        />
                    )}
                    {!messageNameBackground && " :"}
                </span>
            </div>
            <span
                className={s.message}
                style={textStyles}
                dangerouslySetInnerHTML={{ __html: parsedMessage }}
            />
        </div>
    );
});
