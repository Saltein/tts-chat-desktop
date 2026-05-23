import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectOwnVoice,
    selectSpeechVolume,
    selectTwitchTTSOn,
    selectTwitchVoice,
    setClearTrigger,
    setSpeechVolume,
    setTwitchTTSOn,
    setTwitchVoice,
    toggleOwnVoice,
} from "../../../features/tts-chat/model/slice";
import {
    DefaultButton,
    DefaultDivider,
    DefaultOption,
    DefaultSelectList,
    DefaultSlider,
    DefaultSwitch,
    InfoQuestion,
} from "../../../shared/ui";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import s from "./TTSPage.module.scss";
import { TTSConsole } from "../../../features/tts-console/TTSConsole/TTSConsole";
import {
    clearConsoleMessages,
    selectConsoleWidgetOpen,
    setConsoleWidgetOpen,
} from "../../../features/tts-console/model/slice";
import { genRandStr } from "../../../shared/lib/genRandStr";
import { DefaultModalWindow } from "../../../shared/ui/DefaultModalWindow/DefaultModalWindow";
import { TTSWhiteList } from "../../../features/tts-chat/TTSWhiteList/TTSWhiteList";

export const TTSPage = () => {
    const dispatch = useDispatch();

    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);
    const twitchVoice = useSelector(selectTwitchVoice);
    const consoleWidgetOpen = useSelector(selectConsoleWidgetOpen);
    const ownVoice = useSelector(selectOwnVoice);

    const baseUrl = import.meta.env.VITE_BASE_URL_API || "";

    const [optionList, setOptionList] = useState([]);
    const [whiteListOpen, setWhiteListOpen] = useState(true);

    const fetchSpeakers = useCallback(async () => {
        try {
            const res = await fetch(`${baseUrl}/api/speakers`);
            if (!res.ok) {
                const error = await res.json();
                console.error("Ошибка fetchSpeakers:", error);
                return;
            }

            const data = await res.json();

            const speakers = Array.isArray(data.speakers)
                ? data.speakers.map((s) => (typeof s === "string" ? s : s.name))
                : [];

            setOptionList(speakers);
        } catch (err) {
            console.error("Неизвестная ошибка fetchSpeakers:", err);
        }
    }, [baseUrl]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (optionList.length > 0) {
                return;
            } else if (!isTwitchTTSOn) {
                return;
            } else {
                fetchSpeakers();
            }
        }, 1000);
        if (optionList.length > 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [optionList.length, fetchSpeakers, isTwitchTTSOn]);

    const handleTTSOnSwitch = () => {
        dispatch(setClearTrigger(genRandStr()));
        dispatch(setTwitchTTSOn(!isTwitchTTSOn));
        isTwitchTTSOn && dispatch(clearConsoleMessages());
    };

    const handleVoiceSelect = (option) => {
        dispatch(setTwitchVoice(option));
    };

    return (
        <div className={s.wrapper}>
            <DefaultWidgetShape
                marginLeft={"0"}
                padding={"0"}
                title="Озвучка чата"
                paddingBlock={"16px"}
                flexDirection={"column"}
                display={"flex"}
                minimizable
            >
                <DefaultOption
                    name={"Включить озвучку сообщений?"}
                    position={"relative"}
                >
                    <div className={s.info}>
                        <InfoQuestion
                            info={
                                <>
                                    <span>
                                        Эта функция требует повышенного расхода
                                        памяти (от 0.5 Гб)
                                    </span>
                                    <span>оперативной памяти</span>
                                </>
                            }
                        />
                    </div>

                    <DefaultSwitch
                        state={isTwitchTTSOn}
                        onSwitch={handleTTSOnSwitch}
                    />
                </DefaultOption>

                <DefaultOption
                    name={"У каждого свой голос"}
                    position={"relative"}
                >
                    <div className={s.info}>
                        <InfoQuestion
                            info={
                                <>
                                    <span>У каждого пользователя будет</span>
                                    <span>
                                        фиксированный голос, выбранный случайно.
                                    </span>
                                    <span>
                                        Пользователь может его изменить,
                                    </span>
                                    <span>
                                        написав в чат: <b>"!голос"</b>
                                    </span>
                                </>
                            }
                        />
                    </div>
                    <DefaultSwitch
                        state={ownVoice}
                        onSwitch={() => {
                            dispatch(toggleOwnVoice());
                        }}
                    />
                </DefaultOption>

                <DefaultOption name={"Голос"} disabled={ownVoice}>
                    <DefaultSelectList
                        currentSelection={twitchVoice}
                        options={optionList}
                        onSelect={handleVoiceSelect}
                        onClick={fetchSpeakers}
                        height={32}
                    />
                </DefaultOption>

                <DefaultOption
                    name={"Громкость сообщений"}
                    position={"relative"}
                >
                    <DefaultSlider
                        dispatcher={setSpeechVolume}
                        selector={selectSpeechVolume}
                        height={24}
                    />
                </DefaultOption>

                <DefaultDivider />

                <DefaultOption name={"Белый список озвучки"} position={"relative"}>
                    <DefaultButton
                        title={"Редактировать"}
                        height={"24px"}
                        width={"144px"}
                        onClick={() => {
                            setWhiteListOpen((prev) => !prev);
                        }}
                    />
                    {whiteListOpen && (
                        <DefaultModalWindow
                            onClose={() => {
                                setWhiteListOpen(false);
                            }}
                            title={"Белый список озвучки"}
                            padding={"0"}
                        >
                            <TTSWhiteList />
                        </DefaultModalWindow>
                    )}
                </DefaultOption>
            </DefaultWidgetShape>
            <DefaultWidgetShape
                marginLeft={"0"}
                marginTop={"0"}
                marginBottom={"0"}
                padding={"0"}
                title="Консоль TTS сервера"
                paddingBlock={"16px"}
                flexDirection={"column"}
                display={"flex"}
                minimizable
                initialStateMinimized={false}
                flex={1}
                globalStateMinimized={consoleWidgetOpen}
                dispatcherStateMinimized={setConsoleWidgetOpen}
            >
                <TTSConsole />
            </DefaultWidgetShape>
        </div>
    );
};
