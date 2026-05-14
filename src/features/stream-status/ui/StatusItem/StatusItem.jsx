import s from "./StatusItem.module.scss";
import YoutubeIcon from "../../../../shared/assets/icons/youtube-color-svgrepo-com.svg?react";
import VkIcon from "../../../../shared/assets/icons/vk-video-logo.svg?react";
import ViewersIcon from "../../../../shared/assets/icons/eye.svg?react";
import LikesIcon from "../../../../shared/assets/icons/like.svg?react";
import TwitchIcon from "../../../../shared/assets/icons/twitch-logo.svg?react";
import { useSelector } from "react-redux";
import {
    selectServiceIconSize,
    selectStatusBackgroundColor,
    selectStatusBackgroundOpacity,
    selectStatusFontSize,
    selectStatusTextColor,
} from "../../model/slice";
import { hexToRgbString } from "../../../../shared/lib/hexToRgbString";

export const StatusItem = ({ info, service, isWidget }) => {
    console.log("[StatusItem] isWidget", isWidget);

    const serviceIconSize = useSelector(selectServiceIconSize);
    const fontSize = useSelector(selectStatusFontSize);
    const textColor = useSelector(selectStatusTextColor);
    const backgroundColor = useSelector(selectStatusBackgroundColor);
    const backgroundOpacity = useSelector(selectStatusBackgroundOpacity);

    const wrapperHeight =
        40 +
        (fontSize * (fontSize - 12 < 1 ? 1 : fontSize - 12)) / 10 -
        2 +
        "px";

    const wrapperStyles = {
        backgroundColor:
            isWidget && backgroundColor && backgroundOpacity
                ? `rgba(${hexToRgbString(backgroundColor)}, ${backgroundOpacity})`
                : undefined,
        paddingLeft: isWidget
            ? wrapperHeight / 2 - serviceIconSize / 2 + "px"
            : undefined,
        height: wrapperHeight,
    };

    const serviceIconStyle = {
        width: serviceIconSize ? serviceIconSize : undefined,
        height: serviceIconSize ? serviceIconSize : undefined,
    };

    const infoStyles = {
        fontSize: fontSize ? fontSize : undefined,
    };

    const metricConStyles = {
        color: textColor ? textColor : undefined,
    };

    const iconStyles = {
        width: fontSize ? fontSize + 2 : undefined,
        height: fontSize ? fontSize + 2 : undefined,
        fill: textColor ? textColor : undefined,
    };

    const textStyles = {
        color: textColor ? textColor : undefined,
    };

    return (
        <div className={s.wrapper} style={wrapperStyles}>
            {service === "youtube" && (
                <YoutubeIcon
                    className={s.serviceIcon}
                    style={serviceIconStyle}
                />
            )}
            {service === "vk" && (
                <VkIcon className={s.serviceIcon} style={serviceIconStyle} />
            )}
            {service === "twitch" && (
                <TwitchIcon
                    className={s.serviceIcon}
                    style={serviceIconStyle}
                />
            )}
            <div className={s.info} style={infoStyles}>
                {info.viewers != null && (
                    <div className={`${s.viewers} ${s.metric}`}>
                        <ViewersIcon className={s.icon} style={iconStyles} />
                        <span className={s.number} style={textStyles}>
                            {info.viewers}
                        </span>
                    </div>
                )}

                {info.likes != null && (
                    <div
                        className={`${s.likes} ${s.metric}`}
                        style={metricConStyles}
                    >
                        <LikesIcon className={s.icon} style={iconStyles} />
                        <span className={s.number} style={textStyles}>
                            {info.likes}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
