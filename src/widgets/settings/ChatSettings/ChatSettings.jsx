import { useEffect, useState } from "react";
import {
    DefaultButton,
    DefaultDivider,
    DefaultInput,
    DefaultSlider,
    DefaultSwitch,
    DefaultTitle,
} from "../../../shared/ui";
import s from "./ChatSettings.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    selectSpeechVolume,
    selectTwitchVoice,
} from "../../../features/tts-chat/model/slice";
import {
    selectTwitchConnectionData,
    selectTwitchConnectionStatus,
    selectVkConnectionData,
    selectVkConnectionStatus,
    selectYoutubeAccessToken,
    selectYoutubeConnectionStatus,
    selectYoutubeVideoId,
} from "../../../entities/connection/model/slice";
import { convertObjToStr } from "../../../shared/lib/convertObjToStr";
import {
    selectFontSize,
    selectMessageBackground,
    selectMessageBackgroundOpacity,
    selectMessageBorder,
    selectMessageGap,
    selectMessageLifeTime,
    selectMessageTextColor,
    selectServiceIcon,
    setFontSize,
    setMessageBackground,
    setMessageBackgroundOpacity,
    setMessageBorder,
    setMessageGap,
    setMessageLifeTime,
    setMessageTextColor,
    setServiceIcon,
} from "../../../entities/message/model/slice";
import {
    hexToRgbString,
    rgbStringToHex,
} from "../../../shared/lib/hexToRgbString";
import { SimpleWidgetShape } from "../../../shared/widgets/SimpleWidgetShape/SimpleWidgetShape";
import { SettingSwitch } from "./SettingSwitch/SettingSwitch";
import { SettingSlider } from "./SettingSlider/SettingSlider";
import { SettingApplyInput } from "./SettingApplyInput/SettingApplyInput";
import { SettingColorPicker } from "./SettingsColorPicker/SettingColorPicker";

export const ChatSettings = () => {
    const [link, setLink] = useState("");
    const [copied, setCopied] = useState(false);

    const [lifetime, setLifetime] = useState(
        useSelector(selectMessageLifeTime),
    );
    const [messageBorderLocal, setMessageBorderLocal] = useState(
        useSelector(selectMessageBorder),
    );
    const [serviceIconLocal, setServiceIconLocal] = useState(
        useSelector(selectServiceIcon),
    );
    const [messageGapLocal, setMessageGapLocal] = useState(
        useSelector(selectMessageGap),
    );

    const dispatch = useDispatch();

    const currentMessageBackgroundColor = useSelector(selectMessageBackground);
    const currentMessageBackgroundOpacity = useSelector(
        selectMessageBackgroundOpacity,
    );
    const currentMessageTextColor = useSelector(selectMessageTextColor);
    const currentFontSize = useSelector(selectFontSize);

    const currentTheme = localStorage.getItem("theme");
    const volume = useSelector(selectSpeechVolume) / 100;
    const twitchVoice = useSelector(selectTwitchVoice);

    const twitchChatChannelName = useSelector(
        selectTwitchConnectionData,
    )?.chatChannelName;
    const twitchConnectionStatus = useSelector(selectTwitchConnectionStatus);

    const youtubeVideoId = useSelector(selectYoutubeVideoId)?.youtubeVideoId;
    const youtubeAccessToken = useSelector(selectYoutubeAccessToken);
    const youtubeConnectionStatus = useSelector(selectYoutubeConnectionStatus);

    const vkConnectionData = useSelector(selectVkConnectionData);
    const vkConnectionStatus = useSelector(selectVkConnectionStatus);

    const generalQueryParamObj = {
        theme: currentTheme,
        volume: volume,
    };
    const chatCustomizationQueryParamObj = {
        messageBackgroundColor: currentMessageBackgroundColor,
        messageBackgroundOpacity: currentMessageBackgroundOpacity,
        messageTextColor: currentMessageTextColor,
        messageLifeTime: lifetime,
        messageBorder: String(messageBorderLocal),
        serviceIcon: String(serviceIconLocal),
        fontSize: String(currentFontSize),
    };
    const twitchQueryParamObj = {
        twitchChatChannelName: twitchChatChannelName,
        twitchConnectionStatus: twitchConnectionStatus,
        twitchVoice: twitchVoice,
    };
    const youtubeQueryParamObj = {
        youtubeVideoId: youtubeVideoId,
        youtubeAccessToken: youtubeAccessToken,
        youtubeConnectionStatus: youtubeConnectionStatus,
    };
    const vkQueryParamObj = {
        vkChannelId: vkConnectionData?.vkChannelId,
        vkAccessToken: vkConnectionData?.token,
        vkConnectionStatus: vkConnectionStatus,
    };

    const baseUrl = import.meta.env.VITE_BASE_URL_WIDGET || "";
    const queryParamList = [
        generalQueryParamObj,
        chatCustomizationQueryParamObj,
        twitchQueryParamObj,
        youtubeQueryParamObj,
        vkQueryParamObj,
    ];

    useEffect(() => {
        setLink(`${baseUrl}/#/widget/chat?${convertObjToStr(queryParamList)}`);
    }, queryParamList);

    useEffect(() => {
        dispatch(setMessageBorder(messageBorderLocal));
    }, [messageBorderLocal]);

    useEffect(() => {
        dispatch(setServiceIcon(serviceIconLocal));
    }, [serviceIconLocal]);

    const onChangeLifeTime = (e) => {
        const value = e.target.value;
        if (value === "") {
            setLifetime(0);
            return;
        }
        if (
            value.length <= 3 &&
            !isNaN(value) &&
            !isNaN(parseFloat(value)) &&
            isFinite(value)
        ) {
            setLifetime(parseFloat(value) * 1000);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Ошибка при копировании: ", err);
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "error",
                    message: "Ошибка при копировании",
                }),
            );
        }
    };

    const handlePickBackgroundColor = (e) => {
        dispatch(setMessageBackground(hexToRgbString(e.target.value)));
    };

    const handlePickTextColor = (e) => {
        dispatch(setMessageTextColor(hexToRgbString(e.target.value)));
    };

    const handleChangeLifeTime = () => {
        dispatch(setMessageLifeTime(lifetime));
    };

    const handleChangeGap = () => {
        dispatch(setMessageGap(messageGapLocal));
    };

    return (
        <div className={s.wrapper}>
            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={"URL виджета"}
                titleStyles={{ fontSize: "1rem" }}
            />
            <DefaultInput
                width={"100%"}
                info={
                    'Добавь источник "Браузер" в OBS и вставь туда эту ссылку.'
                }
                value={link}
                height={"32px"}
            />
            <DefaultButton
                title={copied ? "Скопировано" : "Скопировать ссылку"}
                onClick={handleCopy}
                active={copied ? false : true}
                height="32px"
            />

            <DefaultDivider />

            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={"Сообщения"}
                titleStyles={{ fontSize: "1rem" }}
            />

            <SettingSwitch
                title={"Обводка"}
                state={messageBorderLocal}
                onSwitch={setMessageBorderLocal}
            />

            <SettingSwitch
                title={"Значок сервиса"}
                state={serviceIconLocal}
                onSwitch={setServiceIconLocal}
            />

            <div className={`${s.colorContainer} ${s.container}`}>
                <SettingColorPicker
                    title={"Цвет фона"}
                    value={rgbStringToHex(currentMessageBackgroundColor)}
                    onChange={handlePickBackgroundColor}
                />
                <SettingColorPicker
                    title={"Цвет текста"}
                    value={rgbStringToHex(currentMessageTextColor)}
                    onChange={handlePickTextColor}
                />
            </div>

            <SettingSlider
                title={"Прозрачность фона"}
                selector={selectMessageBackgroundOpacity}
                dispatcher={setMessageBackgroundOpacity}
                min={0}
                max={32}
                isCoefficient
            />

            <SettingSlider
                title={"Размер шрифта"}
                selector={selectFontSize}
                dispatcher={setFontSize}
                postfix={"px"}
                min={12}
                max={32}
            />

            <SettingSlider
                title={"Расстояние между сообщениями"}
                selector={selectMessageGap}
                dispatcher={setMessageGap}
                postfix={"px"}
                min={0}
                max={32}
            />

            <SettingApplyInput
                title={"Исчезнут через (с)"}
                placeholder={"Время в секундах"}
                value={lifetime / 1000}
                onChange={onChangeLifeTime}
                dispatcher={handleChangeLifeTime}
            />
        </div>
    );
};
