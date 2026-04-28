import s from "./NavPanel.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
    DefaultButton,
    DefaultDivider,
    DefaultInput,
    DefaultTitle,
    NavButton,
} from "../../../shared/ui";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import { selectNavPanelCurrentPageID } from "./model/slice";
import { useEffect, useState } from "react";
import {
    selectAccessStatus,
    setAccessStatus,
} from "../../../features/ws-lobby/model/slice";
import { LobbyBlock } from "../../../features/ws-lobby/ui/LobbyBlock/LobbyBlock";
import ConnectionIcon from "../../../shared/assets/icons/connection.svg?react";
import ChatsIcon from "../../../shared/assets/icons/chats.svg?react";
import TTSIcon from "../../../shared/assets/icons/tts.svg?react";
import SettingsIcon from "../../../shared/assets/icons/settings.svg?react";
import { useMediaQuery } from "react-responsive";
import { mobileBreakpoint } from "../../../shared/styles/consts";

export const NavPanel = () => {
    const currentPageID = useSelector(selectNavPanelCurrentPageID);

    const dispatch = useDispatch();
    const betaAccessPass = import.meta.env.VITE_BETA_ACCESS_PASSWORD;

    const [hasAccess, setHasAccess] = useState(useSelector(selectAccessStatus));
    const [password, setPassword] = useState("");
    const [isRoomWidgetOpen, setIsRoomWidgetOpen] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: mobileBreakpoint });

    const handleOpenBeta = () => {
        if (password === betaAccessPass) {
            setHasAccess(true);
            dispatch(setAccessStatus(true));
        }
    };

    const handleOpenRoomWidget = () => {
        setIsRoomWidgetOpen((prev) => !prev);
    };

    const infoBetaText = (
        <>
            <span>
                Пароль доступа к функциям <b>beta</b>
            </span>
            <span>Его знают только тестеры</span>
        </>
    );

    return (
        <div className={`${s.wrapper} ${isMobile ? s.mobile : ""}`}>
            <DefaultWidgetShape
                width={"256px"}
                backgroundColor={"transparent"}
                padding={"0"}
                title={"TTS Chat"}
                noTitle={isMobile}
                isMobile={isMobile}
                minimizable
            >
                <NavButton
                    title={"Подключения"}
                    index={0}
                    link="/connections"
                    position="first"
                    Icon={ConnectionIcon}
                    isMobile={isMobile}
                />
                <NavButton
                    title={"Мультичат"}
                    index={1}
                    link="/live-chat"
                    Icon={ChatsIcon}
                    isMobile={isMobile}
                />
                <NavButton
                    title={"Озвучка чата"}
                    index={2}
                    link="/tts"
                    Icon={TTSIcon}
                    isMobile={isMobile}
                />

                {currentPageID !== 2 && currentPageID !== 3 && (
                    <DefaultDivider direction="horizontal" />
                )}

                <NavButton
                    title={"Настройки"}
                    index={3}
                    link="/settings"
                    position="last"
                    Icon={SettingsIcon}
                    isMobile={isMobile}
                />
            </DefaultWidgetShape>

            {/* <DefaultWidgetShape width={'256px'} height={isRoomWidgetOpen ? 'fit-content' : '56px'} backgroundColor={'transparent'} padding={'0'}
                title={'Общий чат-канал (Beta)'}
                onClick={handleOpenRoomWidget}>
                {hasAccess ?
                    <div className={s.container}>
                        <LobbyBlock />
                    </div>
                    :
                    <div className={s.container}>
                        <DefaultInput placeholder='Пароль' info={infoBetaText} type='password' value={password} width={'100%'}
                            onChange={(e) => {
                                setPassword(e.target.value)
                            }} />
                        <DefaultButton title={'Открыть'} onClick={handleOpenBeta} />
                    </div>
                }
            </DefaultWidgetShape> */}
        </div>
    );
};
