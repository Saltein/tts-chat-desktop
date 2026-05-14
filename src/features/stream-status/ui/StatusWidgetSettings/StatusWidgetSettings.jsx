/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { WidgetUrlBlock } from "../../../../shared/ui/WidgetUrlBlock/WidgetUrlBlock";
import s from "./StatusWidgetSettings.module.scss";
import { convertObjToStr } from "../../../../shared/lib/convertObjToStr";
import { DefaultModalWindow } from "../../../../shared/ui/DefaultModalWindow/DefaultModalWindow";
import { StreamStatus } from "../StreamStatus";
import {
    DefaultDivider,
    DefaultSwitch,
    DefaultTitle,
} from "../../../../shared/ui";
import YoutubeIcon from "../../../../shared/assets/icons/youtube-color-svgrepo-com.svg?react";
import TwitchIcon from "../../../../shared/assets/icons/twitch-logo.svg?react";
import VkIcon from "../../../../shared/assets/icons/vk-video-logo.svg?react";
import { SettingSwitch } from "../../../../widgets/settings/ChatSettings/SettingSwitch/SettingSwitch";
import { useDispatch, useSelector } from "react-redux";
import {
    selectServiceIconSize,
    selectStatusBackgroundColor,
    selectStatusBackgroundOpacity,
    selectStatusFontSize,
    selectStatusPreviewBackgroundOn,
    selectStatusTextColor,
    selectStretchInWidth,
    selectVerticalArrange,
    setServiceIconSize,
    setStatusBackgroundColor,
    setStatusBackgroundOpacity,
    setStatusFontSize,
    setStatusPreviewBackgroundOn,
    setStatusTextColor,
    setStretchInWidth,
    setVerticalArrange,
} from "../../model/slice";
import {
    selectTwitchConnectionStatus,
    selectVkConnectionStatus,
    selectYoutubeConnectionStatus,
} from "../../../../entities/connection/model/slice";
import { SettingSlider } from "../../../../widgets/settings/ChatSettings/SettingSlider/SettingSlider";
import { SettingColorPicker } from "../../../../widgets/settings/ChatSettings/SettingsColorPicker/SettingColorPicker";

export const StatusWidgetSettings = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL_WIDGET || "";
    const dispatch = useDispatch();

    const [link, setLink] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(true);
    const [previewServices, setPreviewServices] = useState({
        twitch: true,
        youtube: true,
        vk: true,
    });

    const ytConnected = useSelector(selectYoutubeConnectionStatus);
    const vkConnected = useSelector(selectVkConnectionStatus);
    const twConnected = useSelector(selectTwitchConnectionStatus);

    const previewBackgroundOn = useSelector(selectStatusPreviewBackgroundOn);
    const stretchInWidth = useSelector(selectStretchInWidth);
    const verticalArrange = useSelector(selectVerticalArrange);
    const textColor = useSelector(selectStatusTextColor);
    const backgroundColor = useSelector(selectStatusBackgroundColor);

    useEffect(() => {
        const queryParamList = [{}];
        setLink(
            `${baseUrl}/#/widget/statistics?${convertObjToStr(queryParamList)}`,
        );
    }, [baseUrl]);

    const handleOpenSettings = () => {
        setSettingsOpen(true);
    };

    return (
        <div className={s.wrapper}>
            <WidgetUrlBlock link={link} handleToSettings={handleOpenSettings} />

            {settingsOpen && (
                <DefaultModalWindow
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen}
                    title={"Виджет статистики"}
                    padding={"0"}
                >
                    <div className={s.settings}>
                        <DefaultTitle
                            paddingTop={"0"}
                            paddingBottom={"0"}
                            paddingLeft={"0"}
                            paddingRight={"0"}
                            title={"Предпросмотр"}
                            titleStyles={{ fontSize: "1rem" }}
                        />
                        <div className={s.servicesSwitches}>
                            <div className={s.serviceSwitch}>
                                <YoutubeIcon className={s.serviceIcon} />
                                <DefaultSwitch
                                    state={
                                        ytConnected
                                            ? ytConnected
                                            : previewServices.youtube
                                    }
                                    onSwitch={() => {
                                        setPreviewServices((prev) => ({
                                            ...prev,
                                            youtube: !prev.youtube,
                                        }));
                                    }}
                                    disabled={ytConnected}
                                />
                            </div>
                            <div className={s.serviceSwitch}>
                                <VkIcon className={s.serviceIcon} />
                                <DefaultSwitch
                                    state={
                                        vkConnected
                                            ? vkConnected
                                            : previewServices.vk
                                    }
                                    onSwitch={() => {
                                        setPreviewServices((prev) => ({
                                            ...prev,
                                            vk: !prev.vk,
                                        }));
                                    }}
                                    disabled={vkConnected}
                                />
                            </div>
                            <div className={s.serviceSwitch}>
                                <TwitchIcon className={s.serviceIcon} />
                                <DefaultSwitch
                                    state={
                                        twConnected
                                            ? twConnected
                                            : previewServices.twitch
                                    }
                                    onSwitch={() => {
                                        setPreviewServices((prev) => ({
                                            ...prev,
                                            twitch: !prev.twitch,
                                        }));
                                    }}
                                    disabled={twConnected}
                                />
                            </div>
                        </div>
                        <SettingSwitch
                            title={"Предпросмотр с фоном"}
                            state={previewBackgroundOn}
                            onSwitch={() => {
                                dispatch(
                                    setStatusPreviewBackgroundOn(
                                        !previewBackgroundOn,
                                    ),
                                );
                            }}
                        />

                        <div
                            className={`${s.previewZone} ${previewBackgroundOn ? s.backgroundOn : ""}`}
                        >
                            <StreamStatus
                                testConnectedObj={previewServices}
                                isWidget
                            />
                        </div>

                        <DefaultDivider />

                        <DefaultTitle
                            paddingTop={"0"}
                            paddingBottom={"0"}
                            paddingLeft={"0"}
                            paddingRight={"0"}
                            title={"Блоки сервисов"}
                            titleStyles={{ fontSize: "1rem" }}
                        />

                        <SettingSwitch
                            title={"Растягивать блоки по ширине"}
                            state={stretchInWidth}
                            onSwitch={() => {
                                dispatch(setStretchInWidth(!stretchInWidth));
                            }}
                        />

                        <SettingSwitch
                            title={"Вертикальное расположение"}
                            state={verticalArrange}
                            onSwitch={() => {
                                dispatch(setVerticalArrange(!verticalArrange));
                            }}
                        />

                        <SettingSlider
                            title={"Размер значка"}
                            min={8}
                            max={32}
                            step={1}
                            postfix={"px"}
                            selector={selectServiceIconSize}
                            dispatcher={setServiceIconSize}
                        />

                        <div className={`${s.colorContainer}`}>
                            <SettingColorPicker
                                title={"Цвет фона"}
                                value={backgroundColor}
                                onChange={(e) => {
                                    dispatch(
                                        setStatusBackgroundColor(
                                            e.target.value,
                                        ),
                                    );
                                }}
                                alignContent="start"
                            />
                        </div>

                        <SettingSlider
                            title={"Прозрачность фона"}
                            selector={selectStatusBackgroundOpacity}
                            dispatcher={setStatusBackgroundOpacity}
                            isCoefficient
                        />

                        <DefaultDivider />

                        <DefaultTitle
                            paddingTop={"0"}
                            paddingBottom={"0"}
                            paddingLeft={"0"}
                            paddingRight={"0"}
                            title={"Шрифт"}
                            titleStyles={{ fontSize: "1rem" }}
                        />

                        <SettingSlider
                            title={"Размер шрифта"}
                            min={4}
                            max={32}
                            step={1}
                            postfix={"px"}
                            selector={selectStatusFontSize}
                            dispatcher={setStatusFontSize}
                        />

                        <div className={`${s.colorContainer}`}>
                            <SettingColorPicker
                                title={"Цвет шрифта"}
                                value={textColor}
                                onChange={(e) => {
                                    dispatch(
                                        setStatusTextColor(e.target.value),
                                    );
                                }}
                                alignContent="start"
                            />
                        </div>
                    </div>
                </DefaultModalWindow>
            )}
        </div>
    );
};
