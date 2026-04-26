import { DefaultSlider, DefaultTitle } from "../../../../shared/ui";
import { SimpleWidgetShape } from "../../../../shared/widgets/SimpleWidgetShape/SimpleWidgetShape";
import s from "./SettingSlider.module.scss";

export const SettingSlider = ({ title, selector, dispatcher, postfix, min, max, isCoefficient = false }) => {
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
            <DefaultSlider
                selector={selector}
                dispatcher={dispatcher}
                width="100%"
                height="24px"
                postfix={postfix ? postfix : ""}
                min={isCoefficient ? 0 : min}
                max={isCoefficient ? 1 : max}
                isCoefficient={isCoefficient}
            />
        </SimpleWidgetShape>
    );
};
