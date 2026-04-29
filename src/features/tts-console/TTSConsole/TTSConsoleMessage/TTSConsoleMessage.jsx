import { memo } from "react";
import s from "./TTSConsoleMessage.module.scss";

export const TTSConsoleMessage = memo(({ message }) => {
    return (
        <div
            className={`
                    ${s.messageWrapper} 
                    ${message.event === "[INFO]" ? s.info : ""}
                    ${message.event === "[SYSTEM]" ? s.system : ""}
                    ${message.event === "[WARNING]" ? s.warning : ""}
                    ${message.event === "[ERROR]" ? s.error : ""}
                `}
        >
            <span
                className={`
                    ${s.event} 
                    ${message.event === "[INFO]" ? s.info : ""}
                    ${message.event === "[SYSTEM]" ? s.system : ""}
                    ${message.event === "[WARNING]" ? s.warning : ""}
                    ${message.event === "[ERROR]" ? s.error : ""}
                `}
            >
                {message.event}
            </span>
            <span className={s.message}>
                {message.message.replaceAll(" * ", "\r\n")}
            </span>
        </div>
    );
});
