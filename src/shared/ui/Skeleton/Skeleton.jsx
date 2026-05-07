import s from "./Skeleton.module.scss";

export const Skeleton = ({
    width = "100%",
    height = "100%",
    borderRadius = "12px",
    className,
}) => {
    return (
        <div
            className={`${s.skeleton} ${className}`}
            style={{
                width,
                height,
                borderRadius,
            }}
        />
    );
};
