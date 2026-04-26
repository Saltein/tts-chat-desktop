import { DefaultButton, DefaultInput, DefaultTitle } from "../../../../shared/ui";
import { SimpleWidgetShape } from "../../../../shared/widgets/SimpleWidgetShape/SimpleWidgetShape";
import s from "./SettingApplyInput.module.scss";

export const SettingApplyInput = ({title, placeholder, value, width = "72px", onChange, dispatcher}) => {
    return (
        <SimpleWidgetShape>
            <DefaultTitle
                paddingTop={"0"}
                paddingBottom={"8px"}
                paddingLeft={"0"}
                paddingRight={"0"}
                title={title}
                titleStyles={{ fontSize: "1rem" }}
                fontWeight={"400"}
            />
            <div className={s.lifetimeContainer}>
                <DefaultInput
                    placeholder={placeholder}
                    height={"24px"}
                    value={value}
                    align={"center"}
                    width={width}
                    onChange={onChange}
                />
                <DefaultButton
                    height="24px"
                    title={"Применить"}
                    flex={1}
                    onClick={dispatcher}
                />
            </div>
        </SimpleWidgetShape>
    );
};
