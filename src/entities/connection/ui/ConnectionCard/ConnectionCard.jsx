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
} from "../../model/slice";

export const ConnectionCard = ({
    IconComponent,
    isActive = true,
    inputs = [],
    title,
    dispatcher,
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
    const [shouldAutoConnect, setShouldAutoConnect] = useState(false);
    const [shouldReconnect, setShouldReconnect] = useState(false);

    const handleSubmit = (shouldConnect = false) => {
        const isConnected =
            title === "Twitch"
                ? twitchData?.chatChannelName
                : title === "YouTube"
                  ? youtubeData?.youtubeVideoId
                  : vkData?.vkChannelId;

        const newValue = Object.values(formData)[0];

        const hasChanged = isConnected !== newValue;

        dispatch(dispatcher(formData));
        setIsModalOpen(false);

        if (shouldConnect) {
            if (hasChanged) {
                setShouldReconnect(true);
            } else {
                setShouldAutoConnect(true);
            }
        }
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
    }, [twitchData, youtubeData, title, vkData.vkChannelId]);

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
                {IconComponent && (
                    <IconComponent
                        className={s.icon}
                        onClick={
                            isActive ? () => setIsModalOpen(true) : () => {}
                        }
                    />
                )}
                <ConnectionSwitch
                    serviceName={title}
                    isActive={isActive}
                    autoConnect={shouldAutoConnect}
                    onAutoConnectHandled={() => setShouldAutoConnect(false)}
                    reconnect={shouldReconnect}
                    onReconnectHandled={() => setShouldReconnect(false)}
                />

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
                            <DefaultButton
                                title={"Применить"}
                                onClick={() => handleSubmit(true)}
                                active={funcActive(formData)}
                            />
                        </div>
                    </DefaultModalWindow>
                )}
            </div>
        </div>
    );
};
