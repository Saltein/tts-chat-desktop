/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import s from "./DefaultDivider.module.scss";

export const DefaultDivider = ({
    direction = "horizontal",
    color,
    width = "1px",
    margin = "0px",
}) => {
    const [directionValid, setDirectionValid] = useState("horizontal");
    const stylesWrapper = {
        height: directionValid === "horizontal" ? width : undefined,
        width: directionValid === "vertical" ? width : undefined,
    };
    const stylesLine = {
        backgroundColor: color && color,
        margin: directionValid === "horizontal" ? `0 ${margin}` : `${margin} 0`,
    };

    useEffect(() => {
        if (direction === "horizontal" || direction === "vertical") {
            setDirectionValid(direction);
            return;
        } else {
            setDirectionValid("horizontal");
            console.error(
                'Invalid DefaultDivider direction (use "horizontal" or "vertical" only)',
            );
        }
    }, [direction]);

    return (
        <div
            className={`${s.wrapper} ${directionValid === "horizontal" ? s.h : ""} ${directionValid === "vertical" ? s.v : ""}`}
            style={stylesWrapper}
        >
            <div className={s.line} style={stylesLine} />
        </div>
    );
};
