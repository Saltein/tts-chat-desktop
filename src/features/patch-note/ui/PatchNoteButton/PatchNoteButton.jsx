import s from "./PatchNoteButton.module.scss";
import PatchNoteIcon from "../../../../shared/assets/icons/note-favorite.svg?react";
import { DefaultModalWindow } from "../../../../shared/ui/DefaultModalWindow/DefaultModalWindow";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import markdown from "../../../../shared/assets/texts/updates.md?raw";
import { DefaultDivider } from "../../../../shared/ui";
import ExternalLinkIcon from "../../../../shared/assets/icons/external-link.svg?react";

export const PatchNoteButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleClick = () => {
        setIsModalOpen(true);
    };
    return (
        <div
            className={s.button}
            onClick={handleClick}
            title="Список изменений"
        >
            <PatchNoteIcon className={s.icon} />
            {isModalOpen && (
                <DefaultModalWindow
                    onClose={() => {
                        console.log("close");
                        setIsModalOpen(false);
                    }}
                    title={"Список изменений"}
                    padding={"0"}
                >
                    <div className={s.markdown}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {markdown}
                        </ReactMarkdown>
                        <DefaultDivider />
                        <div
                            className={s.link}
                            onClick={() => {
                                window.electronAPI?.openExternal(
                                    "https://github.com/Saltein/tts-electron-version/releases",
                                );
                            }}
                            title="https://github.com/Saltein/tts-electron-version/releases"
                        >
                            История изменений и прошлые версии
                            <ExternalLinkIcon className={s.linkIcon} />
                        </div>
                    </div>
                </DefaultModalWindow>
            )}
        </div>
    );
};
