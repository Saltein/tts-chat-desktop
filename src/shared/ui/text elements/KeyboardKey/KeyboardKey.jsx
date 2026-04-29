import s from "./KeyboardKey.module.scss";

export const KeyboardKey = ({ keyName }) => {
    return <div className={s.wrapper}>{keyName}</div>;
};
