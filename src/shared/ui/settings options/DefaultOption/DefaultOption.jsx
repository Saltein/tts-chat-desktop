import s from "./DefaultOption.module.scss";

export const DefaultOption = ({
    name,
    children,
    paddingRight,
    position,
    disabled = false,
}) => {
    const styles = {
        paddingRight: paddingRight ?? undefined,
        position: position ?? undefined,
        opacity: disabled ? 0.3 : undefined,
        pointerEvents: disabled ? "none" : undefined,
    };

    return (
        <div className={s.wrapper} style={styles}>
            <h4 className={s.name}>{name}</h4>
            <div className={s.children}>{children}</div>
        </div>
    );
};
