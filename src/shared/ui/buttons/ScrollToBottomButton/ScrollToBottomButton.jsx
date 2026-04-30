import s from "./ScrollToBottomButton.module.scss";
import DownIcon from "../../../assets/icons/chevron-down.svg?react";

export const ScrollToBottomButton = ({ onClick }) => {
    return (
        <button
            className={s.scrollButton}
            onClick={onClick}
            title="Прокрутить вниз"
        >
            <DownIcon height={32} width={32} />
        </button>
    );
};
