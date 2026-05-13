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

export const StreamStatus = () => {
    const youtubeInfo = useSelector(selectYoutubeStatus);
    const vkInfo = useSelector(selectVkStatus);
    const twitchInfo = useSelector(selectTwitchStatus);

    const youtubeConnected = useSelector(selectYoutubeConnectionStatus);
    const vkConnected = useSelector(selectVkConnectionStatus);
    const twitchConnected = useSelector(selectTwitchConnectionStatus);

    return (
        <div className={s.wrapper}>
            {youtubeConnected && (
                <StatusItem info={youtubeInfo} service="youtube" />
            )}
            {vkConnected && <StatusItem info={vkInfo} service="vk" />}
            {twitchConnected && (
                <StatusItem info={twitchInfo} service="twitch" />
            )}
        </div>
    );
};
