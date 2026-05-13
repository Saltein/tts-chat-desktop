import { useState } from "react";
import s from "./WidgetUrlBlock.module.scss";
import { useDispatch } from "react-redux";
import { addNotice } from "../../../features/in-app-notices/model/slice";
import { genRandStr } from "../../lib/genRandStr";
import { DefaultButton, DefaultInput, DefaultTitle } from "..";

export const WidgetUrlBlock = ({ link, handleToSettings }) => {
    const [copied, setCopied] = useState(false);

    const dispatch = useDispatch();

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
                borderRadius={"32px"}
            />
            {handleToSettings && (
                <DefaultButton
                    title={"Перейти к настройкам"}
                    onClick={handleToSettings}
                    height="32px"
                    color={"var(--color-info)"}
                    textColor={"#fff"}
                />
            )}
        </div>
    );
};
