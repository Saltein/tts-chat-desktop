import s from "./ConnectionsPage.module.scss";
import { ConnectionCard } from "../../../entities/connection/ui/ConnectionCard/ConnectionCard";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import TwitchIcon from "../../../shared/assets/icons/twitch-logo.svg?react";
import YoutubeIcon from "../../../shared/assets/icons/youtube-color-svgrepo-com.svg?react";
import VkVideoIcon from "../../../shared/assets/icons/vk-video-logo.svg?react";
import {
    selectYoutubeAccessToken,
    setYoutubeVideoId,
    setTwitchChatChannelName,
    setVkConnectionData,
} from "../../../entities/connection/model/slice";
import { useSelector } from "react-redux";

export const ConnectionsPage = () => {
    const youtubeAccessToken = useSelector(selectYoutubeAccessToken);

    const twitchInputs = [
        {
            name: "chatChannelName",
            placeholder: "Название канала",
            info: "Ссылка на канал Twitch или его название",
            type: "text",
        },
    ];

    const youtubeInputs = [
        {
            name: "youtubeVideoId",
            placeholder: "Ссылка на прямую трансляцию или её ID",
            info: "Ссылка на прямую трансляцию Youtube или его ID",
            type: "text",
        },
    ];

    const vkInputs = [
        {
            name: "vkChannelId",
            placeholder: "Ссылка на канал VK Видео Live",
            info: "Ссылка на канал VK Видео Live или его название",
            type: "text",
        },
    ];

    return (
        <div className={s.wrapper}>
            <DefaultWidgetShape
                marginLeft={"0"}
                backgroundColor={"transparent"}
                padding={"0"}
                title="Подключения"
            >
                <div className={s.connections}>
                    <ConnectionCard
                        IconComponent={TwitchIcon}
                        inputs={twitchInputs}
                        title={"Twitch"}
                        dispatcher={setTwitchChatChannelName}
                    />
                    <ConnectionCard
                        IconComponent={YoutubeIcon}
                        inputs={youtubeInputs}
                        title={"YouTube"}
                        dispatcher={setYoutubeVideoId}
                        funcActive={(formData) => {
                            if (
                                Object.values(formData)[0] &&
                                youtubeAccessToken
                            ) {
                                return true;
                            }
                            return false;
                        }}
                    />
                    <ConnectionCard
                        IconComponent={VkVideoIcon}
                        inputs={vkInputs}
                        title={"VK Видео Live"}
                        dispatcher={setVkConnectionData}
                    />
                </div>
            </DefaultWidgetShape>
        </div>
    );
};
