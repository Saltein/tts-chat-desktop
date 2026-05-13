import s from "./NavPanel.module.scss";
import { useSelector } from "react-redux";
import {
    DefaultButton,
    DefaultDivider,
    DefaultInput,
    DefaultTitle,
    NavButton,
} from "../../../shared/ui";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import { selectNavPanelCurrentPageID } from "./model/slice";
import ConnectionIcon from "../../../shared/assets/icons/connection.svg?react";
import ChatsIcon from "../../../shared/assets/icons/chats.svg?react";
import TTSIcon from "../../../shared/assets/icons/tts.svg?react";
import SettingsIcon from "../../../shared/assets/icons/settings.svg?react";
import WidgetsIcon from "../../../shared/assets/icons/widgets.svg?react";
import { useMediaQuery } from "react-responsive";
import { mobileBreakpoint } from "../../../shared/styles/consts";

export const NavPanel = () => {
    const currentPageID = useSelector(selectNavPanelCurrentPageID);
    const isMobile = useMediaQuery({ maxWidth: mobileBreakpoint });

    return (
        <div className={`${s.wrapper} ${isMobile ? s.mobile : ""}`}>
            <DefaultWidgetShape
                width={"256px"}
                backgroundColor={"transparent"}
                padding={"0"}
                title={"TTS Chat"}
                noTitle={isMobile}
                isMobile={isMobile}
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
                <NavButton
                    title={"Виджеты"}
                    index={2}
                    link="/page-widgets"
                    Icon={WidgetsIcon}
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
        </div>
    );
};
