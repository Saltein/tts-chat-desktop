import { DefaultSwitch, DefaultTitle } from "../../../../shared/ui";
import s from "./SettingSwitch.module.scss";

export const SettingSwitch = ({ title, state, onSwitch, disabled = false }) => {
    return (
        <div className={`${s.container}`}>
            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"0"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={title}
                titleStyles={{ fontSize: "1rem" }}
                fontWeight={"400"}
            />
            <DefaultSwitch state={state} onSwitch={onSwitch} disabled={disabled} />
        </div>
    );
};
