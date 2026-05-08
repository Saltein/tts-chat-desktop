import { useMediaQuery } from "react-responsive";
import { WindowControlButton } from "../../processes";
import s from "./Header.module.scss";
import { PatchNoteButton } from "../../features/patch-note/ui/PatchNoteButton/PatchNoteButton";

export const Header = () => {
    const isMicroWindow = useMediaQuery({
        query: "(max-width: 460px)",
    });

    return (
        <header className={s.header}>
            <div className={s.draggable}>
                <div className={s.logo}>
                    <h1 className={s.h1}>TTS {!isMicroWindow && "Chat"}</h1>
                    {!isMicroWindow ? (
                        <p className={s.p}>Сервис для озвучки чата</p>
                    ) : (
                        <p className={`${s.p} ${s.small}`}>Chat</p>
                    )}
                </div>
            </div>

            <div className={s.controls}>
                <PatchNoteButton />
                <WindowControlButton type={"minimize"} />
                <WindowControlButton type={"maximize"} />
                <WindowControlButton type={"close"} />
            </div>
        </header>
    );
};
