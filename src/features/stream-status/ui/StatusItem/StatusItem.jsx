import s from "./StatusItem.module.scss";
import YoutubeIcon from "../../../../shared/assets/icons/youtube-color-svgrepo-com.svg?react";
import VkIcon from "../../../../shared/assets/icons/vk-video-logo.svg?react";
import ViewersIcon from "../../../../shared/assets/icons/eye.svg?react";
import LikesIcon from "../../../../shared/assets/icons/like.svg?react";

export const StatusItem = ({ info, service }) => {
    return (
        <div className={s.wrapper}>
            {service === "youtube" && <YoutubeIcon className={s.serviceIcon} />}
            {service === "vk" && <VkIcon className={s.serviceIcon} />}
            <div className={s.info}>
                {info.viewers != null && (
                    <div className={`${s.viewers} ${s.metric}`}>
                        <ViewersIcon className={s.icon} />
                        <span className={s.number}>{info.viewers}</span>
                    </div>
                )}

                {info.likes != null && (
                    <div className={`${s.likes} ${s.metric}`}>
                        <LikesIcon className={s.icon} />
                        <span className={s.number}>{info.likes}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
