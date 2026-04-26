import { DefaultTitle } from "../../../../shared/ui";
import s from "./SettingColorPicker.module.scss";

export const SettingColorPicker = ({ title, value, onChange }) => {
    return (
        <div className={s.colorPickBlock}>
            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={title}
                titleStyles={{ fontSize: "0.9rem" }}
                fontWeight={"400"}
                alignContent={"center"}
            />
            <input
                className={s.colorPicker}
                value={value}
                type="color"
                onInput={onChange}
            />
        </div>
    );
};
