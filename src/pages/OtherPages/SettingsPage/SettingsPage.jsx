import {
    DefaultDivider,
    DefaultOption,
    DefaultTitle,
    KeyboardKey,
} from "../../../shared/ui";
import { ThemeSwitch } from "../../../shared/ui/switches/ThemeSwitch/ThemeSwitch";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import s from "./SettingsPage.module.scss";
import { ClearStorageButton } from "./ui/ClearStorageButton";

export const SettingsPage = () => {
    return (
        <div className={s.wrapper}>
            <DefaultWidgetShape
                marginLeft={"0"}
                backgroundColor={"transparent"}
                padding={"0"}
                paddingBlock={"16px"}
                title="Настройки"
                display={"flex"}
                flexDirection={"column"}
            >
                <DefaultOption name={"Темная тема"}>
                    <ThemeSwitch />
                </DefaultOption>
                <DefaultOption
                    name={"Сбросить настройки, очистить данные и кэш"}
                    paddingRight={"8px"}
                >
                    <ClearStorageButton />
                </DefaultOption>
            </DefaultWidgetShape>
            <DefaultWidgetShape
                marginLeft={"0"}
                backgroundColor={"transparent"}
                padding={"0"}
                paddingBlock={"16px"}
                title="Горячие клавиши"
                display={"flex"}
                flexDirection={"column"}
            >
                <DefaultOption name={"Пропуск аудио"}>
                    <div className={s.hotkeys}>
                        <KeyboardKey keyName={"Ctrl"} /> +{" "}
                        <KeyboardKey keyName={"Shift"} /> +{" "}
                        <KeyboardKey keyName={"."} />
                    </div>
                </DefaultOption>
                <DefaultOption name={"Озвучить последнее сообщение"}>
                    <div className={s.hotkeys}>
                        <KeyboardKey keyName={"Ctrl"} /> +{" "}
                        <KeyboardKey keyName={"Shift"} /> +{" "}
                        <KeyboardKey keyName={","} />
                    </div>
                </DefaultOption>
            </DefaultWidgetShape>
        </div>
    );
};
