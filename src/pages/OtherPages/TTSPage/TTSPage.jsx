import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectSpeechVolume,
    selectTwitchTTSOn,
    selectTwitchVoice,
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
import { genRandStr } from "../../../shared/lib/genRandStr";
import { TTSConsole } from "../../../features/tts-console/TTSConsole/TTSConsole";
import {
    clearConsoleMessages,
    selectConsoleWidgetOpen,
    setConsoleWidgetOpen,
} from "../../../features/tts-console/model/slice";

export const TTSPage = () => {
    const dispatch = useDispatch();

    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);
    const twitchVoice = useSelector(selectTwitchVoice);
    const speechVolume = useSelector(selectSpeechVolume);
    const consoleWidgetOpen = useSelector(selectConsoleWidgetOpen);

    const baseUrl = import.meta.env.VITE_BASE_URL_API || "";
    const [optionList, setOptionList] = useState([]);

    // 🔥 Только загрузка голосов (никакого запуска сервера)
    useEffect(() => {
        const fetchSpeakers = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/speakers`);
                if (!res.ok) {
                    const error = await res.json();
                    console.error("Ошибка TTS:", error);
                    return;
                }

                const data = await res.json();

                const speakers = Array.isArray(data.speakers)
                    ? data.speakers.map((s) =>
                          typeof s === "string" ? s : s.name,
                      )
                    : [];

                setOptionList(speakers);
            } catch (err) {
                console.error("Ошибка запроса к TTS серверу:", err);
            }
        };

        fetchSpeakers();
    }, [baseUrl]);

    const handleSwitch = () => {
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
