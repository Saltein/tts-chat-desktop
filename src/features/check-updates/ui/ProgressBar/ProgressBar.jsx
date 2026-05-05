import s from "./ProgressBar.module.scss";

export const ProgressBar = ({ progress }) => {
    const progressBarStyles = {
        right: `${100 - progress}%`,
    };
    return (
        <div className={s.wrapper}>
            <div className={s.progressBar} style={progressBarStyles} />
            <span className={s.percentage}>{Math.floor(progress || 0)}%</span>
        </div>
    );
};
