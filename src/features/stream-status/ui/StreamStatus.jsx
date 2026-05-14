import { StatusItem } from "./StatusItem/StatusItem";
import s from "./StreamStatus.module.scss";
import { useSelector } from "react-redux";
import {
    selectTwitchConnectionStatus,
    selectVkConnectionStatus,
    selectYoutubeConnectionStatus,
} from "../../../entities/connection/model/slice";
import {
    selectStretchInWidth,
    selectTwitchStatus,
    selectVerticalArrange,
    selectVkStatus,
    selectYoutubeStatus,
} from "../model/slice";

export const StreamStatus = ({
    isWidget = false,
    testConnectedObj = {
        twitch: false,
        youtube: false,
        vk: false,
    },
}) => {
    const youtubeInfo = useSelector(selectYoutubeStatus);
    const vkInfo = useSelector(selectVkStatus);
    const twitchInfo = useSelector(selectTwitchStatus);

    const youtubeConnected = useSelector(selectYoutubeConnectionStatus);
    const vkConnected = useSelector(selectVkConnectionStatus);
    const twitchConnected = useSelector(selectTwitchConnectionStatus);

    // styles
    const stretchInWidth = useSelector(selectStretchInWidth);
    const verticalArrange = useSelector(selectVerticalArrange);

    return (
        <div
            className={`
                ${s.wrapper_StreamStatus} 
                ${isWidget ? s.widget : ""} 
                ${stretchInWidth && !verticalArrange ? s.stretchInWidth : ""}
                ${stretchInWidth && verticalArrange ? s.stretchInWidthVertical : ""}
                ${verticalArrange ? s.verticalArrange : ""}
            `}
        >
            {(youtubeConnected || testConnectedObj.youtube) && (
                <StatusItem
                    info={youtubeInfo}
                    service="youtube"
                    isWidget={isWidget}
                />
            )}
            {(vkConnected || testConnectedObj.vk) && (
                <StatusItem
                    info={vkInfo}
                    service="vk"
                    isWidget={isWidget}
                />
            )}
            {(twitchConnected || testConnectedObj.twitch) && (
                <StatusItem
                    info={twitchInfo}
                    service="twitch"
                    isWidget={isWidget}
                />
            )}
        </div>
    );
};
