import { StatusItem } from "./StatusItem/StatusItem";
import s from "./StreamStatus.module.scss";
import { useSelector } from "react-redux";
import {
    selectTwitchConnectionStatus,
    selectVkConnectionStatus,
    selectYoutubeConnectionStatus,
} from "../../../entities/connection/model/slice";
import {
    selectTwitchStatus,
    selectVkStatus,
    selectYoutubeStatus,
} from "../model/slice";

export const StreamStatus = ({ isWidget = false }) => {
    const youtubeInfo = useSelector(selectYoutubeStatus);
    const vkInfo = useSelector(selectVkStatus);
    const twitchInfo = useSelector(selectTwitchStatus);

    const youtubeConnected = useSelector(selectYoutubeConnectionStatus);
    const vkConnected = useSelector(selectVkConnectionStatus);
    const twitchConnected = useSelector(selectTwitchConnectionStatus);

    return (
        <div className={s.wrapper}>
            {youtubeConnected && (
                <StatusItem
                    info={youtubeInfo}
                    service="youtube"
                    isWidget={isWidget}
                />
            )}
            {vkConnected && (
                <StatusItem info={vkInfo} service="vk" isWidget={isWidget} />
            )}
            {twitchConnected && (
                <StatusItem
                    info={twitchInfo}
                    service="twitch"
                    isWidget={isWidget}
                />
            )}
        </div>
    );
};
