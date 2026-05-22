import s from "./StatusItem.module.scss";
import YoutubeIcon from "../../../../shared/assets/icons/youtube-color-svgrepo-com.svg?react";
import VkIcon from "../../../../shared/assets/icons/vk-video-logo.svg?react";
import ViewersIcon from "../../../../shared/assets/icons/eye.svg?react";
import LikesIcon from "../../../../shared/assets/icons/like.svg?react";
import TwitchIcon from "../../../../shared/assets/icons/twitch-logo.svg?react";
import { useSelector } from "react-redux";
import {
    selectServiceIconOn,
    selectServiceIconSize,
    selectStatusBackgroundColor,
    selectStatusBackgroundOpacity,
    selectStatusBorderRadius,
    selectStatusFontSize,
    selectStatusTextColor,
    selectTwitchOwnHeightOn,
} from "../../model/slice";
import { hexToRgbString } from "../../../../shared/lib/hexToRgbString";

export const StatusItem = ({ info, service, isWidget }) => {
    const serviceIconSize = useSelector(selectServiceIconSize);
    const fontSize = useSelector(selectStatusFontSize);
    const textColor = useSelector(selectStatusTextColor);
    const backgroundColor = useSelector(selectStatusBackgroundColor);
    const backgroundOpacity = useSelector(selectStatusBackgroundOpacity);
    const borderRadius = useSelector(selectStatusBorderRadius);
    const serviceIconOn = useSelector(selectServiceIconOn);
    const twitchOwnHeightOn = useSelector(selectTwitchOwnHeightOn);

    const wrapperHeightNumber =
        40 + (fontSize * (fontSize - 12 < 1 ? 1 : fontSize - 12)) / 10 - 2;

    const wrapperHeight = wrapperHeightNumber + "px";

    const wrapperStyles = isWidget
        ? {
              backgroundColor:
                  backgroundColor && backgroundOpacity
                      ? `rgba(${hexToRgbString(backgroundColor)}, ${backgroundOpacity})`
                      : undefined,
              padding: "4px 12px",
              paddingLeft: serviceIconOn
                  ? twitchOwnHeightOn && service === "twitch"
                      ? undefined
                      : wrapperHeightNumber / 2 - serviceIconSize / 2 + "px"
                  : undefined,
              paddingRight: serviceIconOn
                  ? twitchOwnHeightOn && service === "twitch"
                      ? undefined
                      : wrapperHeightNumber / 2 - serviceIconSize / 2 + "px"
                  : undefined,

              height:
                  twitchOwnHeightOn && service === "twitch"
                      ? undefined
                      : wrapperHeight,
              borderRadius: borderRadius ? borderRadius : "0px",
          }
        : {
              height: "40px",
          };

    const serviceIconStyle = isWidget
        ? {
              width: serviceIconSize ? serviceIconSize : undefined,
              height: serviceIconSize ? serviceIconSize : undefined,
          }
        : {};

    const infoStyles = isWidget
        ? {
              fontSize: fontSize ? fontSize : undefined,
          }
        : {};

    const metricConStyles = isWidget
        ? {
              color: textColor ? textColor : undefined,
          }
        : {};

    const iconStyles = isWidget
        ? {
              width: fontSize ? fontSize + 2 : undefined,
              height: fontSize ? fontSize + 2 : undefined,
              fill: textColor ? textColor : undefined,
          }
        : { fill: "var(--color-text)" };

    const textStyles = isWidget
        ? {
              color: textColor ? textColor : undefined,
          }
        : {};

    return (
        <div className={s.wrapper} style={wrapperStyles}>
            {serviceIconOn && service && (
                <ServiceIcon service={service} iconStyles={serviceIconStyle} />
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

const ServiceIcon = ({ service, iconStyles }) => {
    if (service === "youtube") {
        return <YoutubeIcon className={s.serviceIcon} style={iconStyles} />;
    }
    if (service === "vk") {
        return <VkIcon className={s.serviceIcon} style={iconStyles} />;
    }
    if (service === "twitch") {
        return <TwitchIcon className={s.serviceIcon} style={iconStyles} />;
    }
};
