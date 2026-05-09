import s from "./PatchNoteButton.module.scss";
import PatchNoteIcon from "../../../../shared/assets/icons/note-favorite.svg?react";
import { DefaultModalWindow } from "../../../../shared/ui/DefaultModalWindow/DefaultModalWindow";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import markdown from "../../../../shared/assets/texts/updates.md?raw";

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
                    onClose={() => setIsModalOpen(false)}
                    title={"Список изменений"}
                >
                    <div className={s.markdown}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </DefaultModalWindow>
            )}
        </div>
    );
};
