import { useMediaQuery } from "react-responsive";
import { LiveChat } from "../../../features/live-chat/ui/LiveChat/LiveChat";
import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import { ChatSettings } from "../../../widgets/settings/ChatSettings/ChatSettings";
import s from "./LiveChatPage.module.scss";

export const LiveChatPage = () => {
    const isMicroWindow = useMediaQuery({
        query: "(max-width: 640px), (max-height: 360px)",
    });

    return (
        <div className={s.wrapper}>
            <DefaultWidgetShape
                margin={"16px 16px 3px 0"}
                backgroundColor={"transparent"}
                padding={"0"}
                title="Чат"
                paddingBlock={"0"}
                flex={1}
                overflowBlock={"hidden"}
            >
                <LiveChat />
            </DefaultWidgetShape>
            {!isMicroWindow && (
                <DefaultWidgetShape
                    margin={"16px 16px 0 0"}
                    backgroundColor={"transparent"}
                    padding={"0"}
                    title="Настройки чата"
                    paddingBlock={"0 16px"}
                    height={"fit-content"}
                    width={"256px"}
                >
                    <ChatSettings />
                </DefaultWidgetShape>
            )}
        </div>
    );
};
