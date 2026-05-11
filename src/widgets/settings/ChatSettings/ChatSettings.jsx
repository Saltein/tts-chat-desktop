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
import { setWidgetMessage } from "../../../entities/connection/model/slice";
import { convertObjToStr } from "../../../shared/lib/convertObjToStr";
import {
    selectFontSize,
    selectMessageBackground,
    selectMessageBackgroundOpacity,
    selectMessageBorder,
    selectMessageDisappearing,
    selectMessageGap,
    selectMessageLifeTime,
    selectMessageNameBackground,
    selectMessageNameBackgroundColor,
    selectMessageNameBackgroundOpacity,
    selectMessageNameBorder,
    selectMessageTextColor,
    selectPreview,
    selectServiceIcon,
    setFontSize,
    setMessageBackground,
    setMessageBackgroundOpacity,
    setMessageBorder,
    setMessageGap,
    setMessageLifeTime,
    setMessageNameBackground,
    setMessageNameBackgroundColor,
    setMessageNameBackgroundOpacity,
    setMessageNameBorder,
    setMessageTextColor,
    setServiceIcon,
    toggleMessageDisappearing,
    togglePreview,
} from "../../../entities/message/model/slice";
import { SimpleWidgetShape } from "../../../shared/widgets/SimpleWidgetShape/SimpleWidgetShape";
import { SettingSwitch } from "./SettingSwitch/SettingSwitch";
import { SettingSlider } from "./SettingSlider/SettingSlider";
import { SettingApplyInput } from "./SettingApplyInput/SettingApplyInput";
import { SettingColorPicker } from "./SettingsColorPicker/SettingColorPicker";
import { addNotice } from "../../../features/in-app-notices/model/slice";
import { genRandStr } from "../../../shared/lib/genRandStr";
import { getRandomInt } from "../../../shared/lib/getRandomInt";
import { nameColors } from "../../../shared/lib/generateColorFromUsername";

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

    const dispatch = useDispatch();

    const currentMessageBackgroundColor = useSelector(selectMessageBackground);
    const currentMessageBackgroundOpacity = useSelector(
        selectMessageBackgroundOpacity,
    );
    const currentMessageNameBackground = useSelector(
        selectMessageNameBackground,
    );
    const currentMessageNameBackgroundColor = useSelector(
        selectMessageNameBackgroundColor,
    );
    const currentMessageNameBackgroundOpacity = useSelector(
        selectMessageNameBackgroundOpacity,
    );
    const currentMessageNameBorder = useSelector(selectMessageNameBorder);

    const currentMessageTextColor = useSelector(selectMessageTextColor);
    const currentFontSize = useSelector(selectFontSize);

    const currentMessageDisappearing = useSelector(selectMessageDisappearing);
    const currentPreview = useSelector(selectPreview);

    const chatCustomizationQueryParamObj = {
        messageNameBackground: String(currentMessageNameBackground),
        messageNameBackgroundColor: currentMessageNameBackgroundColor,
        messageNameBackgroundOpacity: currentMessageNameBackgroundOpacity,
        messageNameBorder: String(currentMessageNameBorder),
        serviceIcon: String(serviceIconLocal),

        messageBackgroundColor: currentMessageBackgroundColor,
        messageBackgroundOpacity: currentMessageBackgroundOpacity,
        messageTextColor: currentMessageTextColor,
        messageBorder: String(messageBorderLocal),

        messageGap: String(useSelector(selectMessageGap)),
        messageLifeTime: lifetime,
        fontSize: String(currentFontSize),
    };

    const baseUrl = import.meta.env.VITE_BASE_URL_WIDGET || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const queryParamList = [chatCustomizationQueryParamObj];

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLink(`${baseUrl}/#/widget/chat?${convertObjToStr(queryParamList)}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...queryParamList, baseUrl, queryParamList]);

    useEffect(() => {
        dispatch(setMessageBorder(messageBorderLocal));
    }, [messageBorderLocal, dispatch]);

    useEffect(() => {
        dispatch(setServiceIcon(serviceIconLocal));
    }, [serviceIconLocal, dispatch]);

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

    const handlePickNameBackgroundColor = (e) => {
        dispatch(setMessageNameBackgroundColor(e.target.value));
    };

    const handlePickBackgroundColor = (e) => {
        dispatch(setMessageBackground(e.target.value));
    };

    const handlePickTextColor = (e) => {
        dispatch(setMessageTextColor(e.target.value));
    };

    const handleChangeLifeTime = () => {
        dispatch(setMessageLifeTime(lifetime));
    };

    const getRandomService = () => {
        const services = ["vk", "twitch", "youtube", "ttschat"];
        return services[getRandomInt(0, services.length - 1)];
    };

    const handleTestMessage = () => {
        dispatch(
            setWidgetMessage({
                id: genRandStr(),
                user: "Тестер сообщений",
                text:
                    getRandomInt(0, 2) === 0
                        ? "Привет, я очень длинное тестовое сообщение, пришло сюда, чтобы проверить как будет выглядеть перенос на новую строчку!"
                        : // ? "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                          "Привет, я тестовое сообщение!",
                time: Date.now(),
                service: getRandomService(),
                color: getRandomInt(0, nameColors.length - 1),
            }),
        );
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
                title={"Имя"}
                titleStyles={{ fontSize: "1rem" }}
            />

            <SettingSwitch
                title={"Фон имени"}
                state={currentMessageNameBackground}
                onSwitch={() =>
                    dispatch(
                        setMessageNameBackground(!currentMessageNameBackground),
                    )
                }
            />

            {currentMessageNameBackground && (
                <>
                    <SettingSwitch
                        title={"Обводка имени"}
                        state={currentMessageNameBorder}
                        onSwitch={() =>
                            dispatch(
                                setMessageNameBorder(!currentMessageNameBorder),
                            )
                        }
                    />
                    <div className={`${s.colorContainer} ${s.container}`}>
                        <SettingColorPicker
                            title={"Цвет фона имени"}
                            value={currentMessageNameBackgroundColor}
                            onChange={handlePickNameBackgroundColor}
                            alignContent="start"
                        />
                    </div>
                    <SettingSlider
                        title={"Прозрачность фона имени"}
                        selector={selectMessageNameBackgroundOpacity}
                        dispatcher={setMessageNameBackgroundOpacity}
                        isCoefficient
                    />
                </>
            )}

            <SettingSwitch
                title={"Значок сервиса"}
                state={serviceIconLocal}
                onSwitch={setServiceIconLocal}
            />

            <DefaultDivider />

            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={"Сообщение"}
                titleStyles={{ fontSize: "1rem" }}
            />

            <SettingSwitch
                title={"Обводка"}
                state={messageBorderLocal}
                onSwitch={setMessageBorderLocal}
            />

            <div className={`${s.colorContainer} ${s.container}`}>
                <SettingColorPicker
                    title={"Цвет фона"}
                    value={currentMessageBackgroundColor}
                    onChange={handlePickBackgroundColor}
                />
                <SettingColorPicker
                    title={"Цвет текста"}
                    value={currentMessageTextColor}
                    onChange={handlePickTextColor}
                />
            </div>

            <SettingSlider
                title={"Прозрачность фона"}
                selector={selectMessageBackgroundOpacity}
                dispatcher={setMessageBackgroundOpacity}
                isCoefficient
            />

            <DefaultDivider />

            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={"Общее"}
                titleStyles={{ fontSize: "1rem" }}
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
                title={"Интервал"}
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

            <DefaultDivider />

            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={"В приложении"}
                titleStyles={{ fontSize: "1rem" }}
            />

            <SettingSwitch
                title={"Исчезновение сообщений"}
                state={currentMessageDisappearing}
                onSwitch={() => dispatch(toggleMessageDisappearing())}
            />

            <SettingSwitch
                title={"Предпросмотр с фоном"}
                state={currentPreview}
                onSwitch={() => dispatch(togglePreview())}
            />

            <DefaultButton
                title={"Тестовое сообщение"}
                onClick={handleTestMessage}
                height="32px"
            />
        </div>
    );
};
