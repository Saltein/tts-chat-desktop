import { StatusItem } from "./StatusItem/StatusItem";
import s from "./StreamStatus.module.scss";
import { useInitYoutubeInfoListener } from "../hooks/useInitYoutubeInfoListener";
import { useSelector } from "react-redux";
import { selectYoutubeConnectionStatus } from "../../../entities/connection/model/slice";

export const StreamStatus = () => {
    const youtubeInfo = useInitYoutubeInfoListener();

    const youtubeConnected = useSelector(selectYoutubeConnectionStatus);

    return (
        <div className={s.wrapper}>
            {youtubeConnected && (
                <StatusItem info={youtubeInfo} service="youtube" />
            )}
        </div>
    );
};
