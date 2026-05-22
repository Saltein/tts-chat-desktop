/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { WidgetUrlBlock } from "../../../../shared/ui/WidgetUrlBlock/WidgetUrlBlock";
import s from "./StatusWidgetSettings.module.scss";
import { DefaultModalWindow } from "../../../../shared/ui/DefaultModalWindow/DefaultModalWindow";
import { StreamStatus } from "../StreamStatus";
import {
    DefaultButton,
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
    resetStyles,
    selectServiceIconOn,
    selectServiceIconSize,
    selectStatusBackgroundColor,
    selectStatusBackgroundOpacity,
    selectStatusBorderRadius,
    selectStatusFontSize,
    selectStatusPreviewBackgroundOn,
    selectStatusTextColor,
    selectStretchInWidth,
    selectTwitchOwnHeightOn,
    selectVerticalArrange,
    setServiceIconOn,
    setServiceIconSize,
    setStatusBackgroundColor,
    setStatusBackgroundOpacity,
    setStatusBorderRadius,
    setStatusFontSize,
    setStatusPreviewBackgroundOn,
    setStatusTextColor,
    setStretchInWidth,
    setTwitchOwnHeightOn,
    setVerticalArrange,
} from "../../model/slice";
import {
    selectTwitchConnectionStatus,
    selectVkConnectionStatus,
    selectYoutubeConnectionStatus,
} from "../../../../entities/connection/model/slice";
import { SettingSlider } from "../../../../widgets/settings/ChatSettings/SettingSlider/SettingSlider";
import { SettingColorPicker } from "../../../../widgets/settings/ChatSettings/SettingsColorPicker/SettingColorPicker";
import { useWebSocket } from "../../../../shared/hooks/useWebSocket";
import { useChangeAfterButtonTitle } from "../../../../shared/hooks/useChangeAfterButtonTitle";

export const StatusWidgetSettings = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL_WIDGET || "";
    const dispatch = useDispatch();
    const { isConnected, sendMessage } = useWebSocket("client", "client");

    const { title, changeTitle } = useChangeAfterButtonTitle({
        mainTitle: "Сбросить настройки",
        tempTitle: "Сброшено",
    });

    const [link, setLink] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(false);
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
    const fontSize = useSelector(selectStatusFontSize);
    const backgroundOpacity = useSelector(selectStatusBackgroundOpacity);
    const serviceIconSize = useSelector(selectServiceIconSize);
    const borderRadius = useSelector(selectStatusBorderRadius);
    const serviceIconOn = useSelector(selectServiceIconOn);
    const twitchOwnHeightOn = useSelector(selectTwitchOwnHeightOn);

    const handleOpenSettings = () => {
        setSettingsOpen(true);
    };

    useEffect(() => {
        setLink(`${baseUrl}/#/widget/statistics`);
    }, [baseUrl]);

    useEffect(() => {
        // ================================= Отправка стилей в виджет =================================
        const stylesObject = {
            previewBackgroundOn,
            stretchInWidth,
            verticalArrange,
            textColor,
            backgroundColor,
            fontSize,
            backgroundOpacity,
            serviceIconSize,
            borderRadius,
            serviceIconOn,
            twitchOwnHeightOn,
        };

        let interval;

        if (isConnected) {
            interval = setInterval(() => {
                sendMessage(
                    JSON.stringify({
                        ...stylesObject,
                        type: "statisticsStyles",
                    }),
                );
            }, 1000);
            sendMessage(
                JSON.stringify({ ...stylesObject, type: "statisticsStyles" }),
            );
        }

        return () => clearInterval(interval);
    }, [
        isConnected,
        sendMessage,
        previewBackgroundOn,
        stretchInWidth,
        verticalArrange,
        textColor,
        backgroundColor,
        fontSize,
        backgroundOpacity,
        serviceIconSize,
        borderRadius,
        serviceIconOn,
        twitchOwnHeightOn,
    ]);

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

                        <DefaultButton
                            title={title}
                            onClick={() => {
                                dispatch(resetStyles());
                                changeTitle();
                            }}
                            height="32px"
                            color={"var(--color-warning"}
                            hold
                        />

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

                        <SettingSwitch
                            title={"Показывать значок"}
                            state={serviceIconOn}
                            onSwitch={() => {
                                dispatch(setServiceIconOn(!serviceIconOn));
                            }}
                        />

                        <SettingSwitch
                            title={"Своя высота для Twitch"}
                            state={twitchOwnHeightOn}
                            onSwitch={() => {
                                dispatch(
                                    setTwitchOwnHeightOn(!twitchOwnHeightOn),
                                );
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

                        <SettingSlider
                            title={"Радиус закругления краев"}
                            selector={selectStatusBorderRadius}
                            dispatcher={setStatusBorderRadius}
                            min={0}
                            max={32}
                            step={1}
                            postfix={"px"}
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

                        <DefaultDivider />

                        <DefaultButton
                            title={"Ок"}
                            onClick={() => {
                                setSettingsOpen(false);
                            }}
                            height="32px"
                        />
                    </div>
                </DefaultModalWindow>
            )}
        </div>
    );
};
