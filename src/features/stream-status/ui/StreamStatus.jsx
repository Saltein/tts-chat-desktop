import { StatusItem } from "./StatusItem/StatusItem";
import s from "./StreamStatus.module.scss";
import { useInitYoutubeInfoListener } from "../hooks/useInitYoutubeInfoListener";
import { useSelector } from "react-redux";
import {
    selectVkConnectionStatus,
    selectYoutubeConnectionStatus,
} from "../../../entities/connection/model/slice";
import { selectVkStatus } from "../model/slice";

export const StreamStatus = () => {
    const youtubeInfo = useInitYoutubeInfoListener();
    const vkInfo = useSelector(selectVkStatus);

    const youtubeConnected = useSelector(selectYoutubeConnectionStatus);
    const vkConnected = useSelector(selectVkConnectionStatus);

    return (
        <div className={s.wrapper}>
            {youtubeConnected && (
                <StatusItem info={youtubeInfo} service="youtube" />
            )}
            {vkConnected && <StatusItem info={vkInfo} service="vk" />}
        </div>
    );
};
