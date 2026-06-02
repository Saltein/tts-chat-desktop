import { genRandStr } from "../../../../shared/lib/genRandStr";
import { DefaultOption, KeyboardKey } from "../../../../shared/ui";
import s from "./ShortcutOption.module.scss";

const KEYS_MAP = {
    Control: "Ctrl",
    Command: "Cmd",
};

export const ShortcutOption = ({ title, shortcutKeyList }) => {
    return (
        <DefaultOption name={title}>
            <div className={s.hotkeys}>
                {shortcutKeyList.map((key, index) => (
                    <>
                        <KeyboardKey
                            keyName={KEYS_MAP[key] ?? key}
                            key={index + genRandStr()}
                        />
                        {index < shortcutKeyList.length - 1 && (
                            <span className={s.spacer}>+</span>
                        )}
                    </>
                ))}
            </div>
        </DefaultOption>
    );
};
