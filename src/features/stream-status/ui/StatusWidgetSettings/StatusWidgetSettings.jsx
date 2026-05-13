import { WidgetUrlBlock } from "../../../../shared/ui/WidgetUrlBlock/WidgetUrlBlock";
import s from "./StatusWidgetSettings.module.scss";

export const StatusWidgetSettings = () => {
    const link = "aboba"
    return (
        <div className={s.wrapper}>
            <WidgetUrlBlock link={link} />
        </div>
    );
};
