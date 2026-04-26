import { useEffect, useState } from "react";
import {
    ConnectionSwitch,
    DefaultButton,
    DefaultInput,
    DefaultWarning,
    InfoQuestion,
} from "../../../../shared/ui";
import { DefaultModalWindow } from "../../../../shared/ui/DefaultModalWindow/DefaultModalWindow";
import s from "./ConnectionCard.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    selectTwitchConnectionData,
    selectVkConnectionData,
    selectYoutubeVideoId,
    setYoutubeAccessToken,
} from "../../model/slice";
import { GoogleLoginYouTube } from "../../../../features/auth/ui/GoogleLoginButton/GoogleLoginYoutube";

export const ConnectionCard = ({
    IconComponent,
    isActive = true,
    inputs = [],
    title,
    dispatcher,
    onMistake = () => {},
    funcActive = (formData) => {
        return Object.values(formData)[0] || false;
    },
}) => {
    const dispatch = useDispatch();

    const twitchData = useSelector(selectTwitchConnectionData);
    const youtubeData = useSelector(selectYoutubeVideoId);
    const vkData = useSelector(selectVkConnectionData);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const [warningText, setWarningText] = useState("");

    const handleSubmit = () => {
        dispatch(dispatcher(formData));
        setIsModalOpen(false);
    };

    const infoText = (
        <div>
            <p>В данный момент подключение чата из {title} невозможно</p>
            <p>Но разработка идет и скоро все будет!</p>
        </div>
    );

    useEffect(() => {
        if (title === "Twitch") {
            const channelName =
                typeof twitchData === "object"
                    ? twitchData.chatChannelName
                    : twitchData;
            setFormData({ chatChannelName: channelName || "" });
        } else if (title === "YouTube") {
            const videoId =
                typeof youtubeData === "object"
                    ? youtubeData.youtubeVideoId
                    : youtubeData;
            setFormData({ youtubeVideoId: videoId || "" });
        } else if (title === "VK Видео Live") {
            setFormData({
                vkChannelId: vkData.vkChannelId,
            });
        }
    }, [twitchData, youtubeData, title]);

    return (
        <div className={s.wrapperOfWrapper}>
            {!isActive && (
                <InfoQuestion
                    info={infoText}
                    height={"32px"}
                    width={"32px"}
                    plusLeft={320}
                    plusTop={48}
                />
            )}
            <div className={`${s.wrapper} ${isActive ? s.active : s.inactive}`}>
                <IconComponent
                    className={s.icon}
                    onClick={isActive ? () => setIsModalOpen(true) : () => {}}
                />
                <ConnectionSwitch serviceName={title} isActive={isActive} />

                {isModalOpen && (
                    <DefaultModalWindow
                        title={title}
                        onClose={() => {
                            setIsModalOpen(false);
                            handleSubmit();
                        }}
                        backgroundColor={"var(--color-background)"}
                        padding={"0"}
                    >
                        <div className={s.inputs}>
                            {inputs.map((input, index) => {
                                return (
                                    <DefaultInput
                                        key={index}
                                        type={input.type}
                                        placeholder={input.placeholder}
                                        info={input.info}
                                        value={formData[input.name] || ""}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                [input.name]: e.target.value,
                                            }))
                                        }
                                    />
                                );
                            })}
                            {warningText && (
                                <DefaultWarning text={warningText} />
                            )}
                            {title === "YouTube" ? (
                                <GoogleLoginYouTube
                                    onAccessToken={(token) => {
                                        dispatch(setYoutubeAccessToken(token));
                                    }}
                                />
                            ) : (
                                ""
                            )}
                            <DefaultButton
                                title={"Применить"}
                                onClick={handleSubmit}
                                active={funcActive(formData)}
                            />
                        </div>
                    </DefaultModalWindow>
                )}
            </div>
        </div>
    );
};
