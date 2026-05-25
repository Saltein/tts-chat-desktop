import { useDispatch } from "react-redux";
import s from "./WhiteListItem.module.scss";
import { removeFromBlackList, removeFromWhiteList } from "../../model/slice";
import RemoveIcon from "../../../../shared/assets/icons/close.svg?react";

export const WhiteListItem = ({ item, black }) => {
    const { name } = item;
    const dispatch = useDispatch();

    const handleRemove = () => {
        dispatch(black ? removeFromBlackList(name) : removeFromWhiteList(name));
    };

    return (
        <div className={s.wrapper_WhiteListItem}>
            <span className={s.name}>{name}</span>
            <div className={s.removeButton} onClick={handleRemove}>
                <RemoveIcon className={s.icon} title={"Удалить"} />
            </div>
        </div>
    );
};
