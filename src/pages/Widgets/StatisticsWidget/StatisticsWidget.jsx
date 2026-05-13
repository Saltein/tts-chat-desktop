import { StreamStatus } from "../../../features/stream-status/ui/StreamStatus";
import s from "./StatisticsWidget.module.scss";

export const StatisticsWidget = () => {
    console.log("StatisticsWidget");
    return (
        <div className={s.wrapper}>
            <StreamStatus />
        </div>
    );
};
