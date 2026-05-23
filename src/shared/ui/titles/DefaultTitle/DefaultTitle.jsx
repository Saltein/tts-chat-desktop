import s from "./DefaultTitle.module.scss";

export const DefaultTitle = ({
    title,
    margin,
    padding,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    alignContent,
    titleStyles = {},
    fontWeight,
    onClick,
    cursor,
    ChildComponent,
    titleChildComponentProps,
}) => {
    const styles = {
        margin: margin && margin,
        padding: padding && padding,
        paddingLeft: paddingLeft && paddingLeft,
        paddingRight: paddingRight && paddingRight,
        paddingTop: paddingTop && paddingTop,
        paddingBottom: paddingBottom && paddingBottom,
        fontWeight: fontWeight ?? undefined,
        textAlign: alignContent && alignContent,
        cursor: cursor && cursor,
        ...titleStyles,
    };

    return (
        <div className={s.wrapper}>
            <h2 className={s.title} style={styles} onClick={onClick}>
                {title}
            </h2>
            {ChildComponent && <ChildComponent {...titleChildComponentProps} />}
        </div>
    );
};
