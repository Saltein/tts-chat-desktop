import s from "./ShortcutOption.module.scss";

export const ShortcutOption = () => {
    return (
        <DefaultOption name={"Пропуск аудио"}>
            <div className={s.hotkeys}>
                <KeyboardKey keyName={"Ctrl"} /> +{" "}
                <KeyboardKey keyName={"Shift"} /> +{" "}
                <KeyboardKey keyName={"."} />
            </div>
        </DefaultOption>
    );
};
