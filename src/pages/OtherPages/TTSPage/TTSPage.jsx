import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectSpeechVolume,
    selectTwitchTTSOn,
    selectTwitchVoice,
    setClearTrigger,
    setSpeechVolume,
    setTwitchTTSOn,
    setTwitchVoice,
} from "../../../features/tts-chat/model/slice";
import {
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

export const TTSPage = () => {
    const dispatch = useDispatch();

    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);
    const twitchVoice = useSelector(selectTwitchVoice);
    const consoleWidgetOpen = useSelector(selectConsoleWidgetOpen);

    const baseUrl = import.meta.env.VITE_BASE_URL_API || "";
    const [optionList, setOptionList] = useState([]);

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
                console.log("optionList.length > 0", optionList.length);

                return;
            } else {
                console.log("optionList.length else", optionList.length);

                fetchSpeakers();
            }
        }, 1000);
        if (optionList.length > 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [optionList.length, fetchSpeakers]);

    const handleSwitch = () => {
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
                        onSwitch={handleSwitch}
                    />
                </DefaultOption>

                <div className={s.settingsBlock}>
                    <DefaultWidgetShape
                        title="Громкость сообщений"
                        width={"fit-content"}
                        margin={"0"}
                        padding={"0 16px 16px 16px"}
                        noBlock
                        justifyTitle={"center"}
                        backgroundColor={"var(--color-items)"}
                    >
                        <DefaultSlider
                            dispatcher={setSpeechVolume}
                            selector={selectSpeechVolume}
                        />
                    </DefaultWidgetShape>

                    <DefaultWidgetShape
                        title="Голос"
                        width={"fit-content"}
                        margin={"0"}
                        padding={"0 16px 16px 16px"}
                        noBlock
                        justifyTitle={"center"}
                        backgroundColor={"var(--color-items)"}
                    >
                        <DefaultSelectList
                            currentSelection={twitchVoice}
                            options={optionList}
                            onSelect={handleVoiceSelect}
                            onClick={fetchSpeakers}
                        />
                    </DefaultWidgetShape>
                </div>
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
