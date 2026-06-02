import {
    DefaultDivider,
    DefaultOption,
    DefaultTitle,
    KeyboardKey,
} from "../../../shared/ui";
import { ThemeSwitch } from "../../../shared/ui/switches/ThemeSwitch/ThemeSwitch";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import s from "./SettingsPage.module.scss";
import { ShortcutOption } from "./ShortcutOption/ShortcutOption";
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
                <ShortcutOption
                    title={"Пропуск аудио"}
                    shortcutKeyList={["Control", "Shift", "."]}
                />
                <ShortcutOption
                    title={"Озвучить последнее сообщение"}
                    shortcutKeyList={["Control", "Shift", ","]}
                />
            </DefaultWidgetShape>
        </div>
    );
};
