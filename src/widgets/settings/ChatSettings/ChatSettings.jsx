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
import {
    resetMessageStyles,
    selectFontSize,
    selectMessageBackground,
    selectMessageBackgroundOpacity,
    selectMessageBorder,
    selectMessageBorderRadius,
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
    setMessageBorderRadius,
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
import { genRandStr } from "../../../shared/lib/genRandStr";
import { getRandomInt } from "../../../shared/lib/getRandomInt";
import { nameColors } from "../../../shared/lib/generateColorFromUsername";
import { useNavigate } from "react-router-dom";
import { WidgetUrlBlock } from "../../../shared/ui/WidgetUrlBlock/WidgetUrlBlock";
import { useChangeAfterButtonTitle } from "../../../shared/hooks/useChangeAfterButtonTitle";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";

export const ChatSettings = ({ full = true }) => {
    const { isConnected, sendMessage } = useWebSocket("client", "client");

    const navigate = useNavigate();

    const { title, changeTitle } = useChangeAfterButtonTitle({
        mainTitle: "Сбросить настройки",
        tempTitle: "Сброшено",
    });

    const [link, setLink] = useState("");

    const dispatch = useDispatch();

    const currentMessageBorder = useSelector(selectMessageBorder);
    const currentServiceIcon = useSelector(selectServiceIcon);
    const currentMessageLifeTime = useSelector(selectMessageLifeTime);

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
    const currentMessageBorderRadius = useSelector(selectMessageBorderRadius);

    const currentMessageDisappearing = useSelector(selectMessageDisappearing);
    const currentPreview = useSelector(selectPreview);

    const currentMessageGap = useSelector(selectMessageGap);

    const baseUrl = import.meta.env.VITE_BASE_URL_WIDGET || "";

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLink(`${baseUrl}/#/widget/chat`);
    }, [baseUrl]);

    const onChangeLifeTime = (e) => {
        const value = e.target.value;
        if (value === "") {
            dispatch(setMessageLifeTime(0));
            return;
        }
        if (
            value.length <= 3 &&
            !isNaN(value) &&
            !isNaN(parseFloat(value)) &&
            isFinite(value)
        ) {
            dispatch(setMessageLifeTime(parseFloat(value) * 1000));
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

    const getRandomService = () => {
        const services = ["vk", "twitch", "youtube"];
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

    const handleToSettings = () => {
        navigate("/live-chat");
    };

    useEffect(() => {
        // ================================ Отправка стилей в виджет ================================
        const stylesObject = {
            nameBackground: currentMessageNameBackground,
            nameBorder: currentMessageNameBorder,
            nameBackgroundColor: currentMessageNameBackgroundColor,
            nameBackgroundOpacity: currentMessageNameBackgroundOpacity,
            serviceIcon: currentServiceIcon,

            messageBorder: currentMessageBorder,
            messageBackgroundColor: currentMessageBackgroundColor,
            messageBackgroundOpacity: currentMessageBackgroundOpacity,
            messageTextColor: currentMessageTextColor,
            messageBorderRadius: currentMessageBorderRadius,

            fontSize: currentFontSize,
            messageGap: currentMessageGap,
            messageLifeTime: currentMessageLifeTime,
        };

        let interval;

        if (isConnected) {
            interval = setInterval(() => {
                sendMessage(
                    JSON.stringify({
                        ...stylesObject,
                        type: "chatStyles",
                    }),
                );
            }, 1000);
            sendMessage(
                JSON.stringify({ ...stylesObject, type: "chatStyles" }),
            );
        }

        return () => clearInterval(interval);
    }, [
        isConnected,
        sendMessage,
        currentMessageNameBackground,
        currentFontSize,
        currentMessageBackgroundColor,
        currentMessageBackgroundOpacity,
        currentMessageGap,
        currentMessageNameBorder,
        currentMessageNameBackgroundColor,
        currentMessageTextColor,
        currentMessageBorderRadius,
        currentMessageNameBackgroundOpacity,
        currentServiceIcon,
        currentMessageBorder,
        currentMessageLifeTime,
    ]);

    if (!full) {
        return (
            <WidgetUrlBlock link={link} handleToSettings={handleToSettings} />
        );
    }

    return (
        <div className={s.wrapper}>
            <WidgetUrlBlock link={link} />

            <DefaultDivider />

            <DefaultButton
                title={title}
                onClick={() => {
                    dispatch(resetMessageStyles());
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
                state={currentServiceIcon}
                onSwitch={() => {
                    dispatch(setServiceIcon(!currentServiceIcon));
                }}
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
                state={currentMessageBorder}
                onSwitch={() => {
                    dispatch(setMessageBorder(!currentMessageBorder));
                }}
            />

            <SettingSlider
                title={"Радиус закругления"}
                selector={selectMessageBorderRadius}
                dispatcher={setMessageBorderRadius}
                min={0}
                max={21}
                postfix={"px"}
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
                value={currentMessageLifeTime / 1000}
                onChange={onChangeLifeTime}
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
