import s from "./DefaultInput.module.scss";
import { InfoQuestion } from "../../InfoQuestion/InfoQuestion";

export const DefaultInput = ({
    placeholder = "",
    info,
    type = "text",
    value,
    onChange = () => {},
    onKeyPress,
    width,
    height,
    align,
    flex,
    padding,
}) => {
    const inputStyles = {
        width,
        height,
        textAlign: align ?? undefined,
        flex,
        padding,
    };

    return (
        <div className={s.wrapper}>
            <input
                className={s.input}
                placeholder={placeholder}
                type={type}
                value={value}
                onChange={onChange}
                onKeyPress={onKeyPress}
                style={inputStyles}
            />
            {info && <InfoQuestion info={info} />}
        </div>
    );
};
