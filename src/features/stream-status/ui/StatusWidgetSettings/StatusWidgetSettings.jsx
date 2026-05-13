/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { WidgetUrlBlock } from "../../../../shared/ui/WidgetUrlBlock/WidgetUrlBlock";
import s from "./StatusWidgetSettings.module.scss";
import { convertObjToStr } from "../../../../shared/lib/convertObjToStr";

export const StatusWidgetSettings = () => {
    const [link, setLink] = useState("");

    const baseUrl = import.meta.env.VITE_BASE_URL_WIDGET || "";

    useEffect(() => {
        const queryParamList = [{}];
        setLink(`${baseUrl}/#/widget/statistics?${convertObjToStr(queryParamList)}`);
    }, [baseUrl]);

    return (
        <div className={s.wrapper}>
            <WidgetUrlBlock link={link} />
        </div>
    );
};
