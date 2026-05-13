import { DefaultWidgetShape } from "../../../shared/widgets/DefaultWidgetShape/DefaultWidgetShape";
import { ChatSettings } from "../../../widgets/settings/ChatSettings/ChatSettings";
import s from "./WidgetsPage.module.scss";

export const WidgetsPage = () => {
    return (
        <div className={s.wrapper}>
            <DefaultWidgetShape
                marginLeft={"0"}
                backgroundColor={"transparent"}
                padding={"0"}
                title="Виджеты"
                paddingBlock={"0 0 0 16px"}
            >
                <DefaultWidgetShape
                    marginLeft={"0"}
                    backgroundColor={"transparent"}
                    padding={"0"}
                    title="Чат"
                    minimizable
                    initialStateMinimized={false}
                    backgroundColor={"var(--color-items)"}
                >
                    <ChatSettings full={false} />
                </DefaultWidgetShape>
                <DefaultWidgetShape
                    marginLeft={"0"}
                    backgroundColor={"transparent"}
                    padding={"0"}
                    title="Статистика"
                    minimizable
                    initialStateMinimized={false}
                    backgroundColor={"var(--color-items)"}
                >
                    виджет онлайна и лайков
                </DefaultWidgetShape>
            </DefaultWidgetShape>
        </div>
    );
};
