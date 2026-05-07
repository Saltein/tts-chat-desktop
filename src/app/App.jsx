import s from "./App.module.scss";
import TgLogo from "../shared/assets/icons/telegram-logo-filled.svg";
import { useLocation } from "react-router-dom";
import { GlobalPage } from "../pages/GlobalPage/GlobalPage";
import { ChatWidget } from "../pages/Widgets/ChatWidget/ChatWidget";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QRWidget } from "../pages/Widgets/QRWidget/QRWidget";
import { NoticeStack } from "../features/in-app-notices";
import { initVkChatListener } from "../features/live-chat/lib/vk/vkChatListener";
import { initTTSConsoleListener } from "../features/tts-console/lib/ttsConsoleListener";
import { SendToWidget } from "../features/live-chat/lib/SendToWidget/SendToWidget";
import { useTTSServer } from "../shared/hooks/useTTSServer";
import { UpdateNotice } from "../features/check-updates/ui/UpdateNotice/UpdateNotice";
import { EmoteProvider } from "../shared/context/emotes/EmoteContext";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
    const location = useLocation();
    const starts = (path) => location.pathname.startsWith(path);
    const isWidget = starts("/widget");

    useTTSServer(isWidget);
    if (!isWidget) initVkChatListener();
    if (!isWidget) initTTSConsoleListener();

    const text = (
        <div>
            <h3>Подпишись</h3>
            <p>Не пропускай стримы</p>
            <h2>@SALTEIN</h2>
        </div>
    );

    if (isWidget) {
        if (starts("/widget/chat")) {
            return <ChatWidget />;
        } else if (starts("/widget/qrcode")) {
            return (
                <QRWidget
                    value={"https://t.me/saltein"}
                    logoImage={TgLogo}
                    text={text}
                    frequency={300}
                    showTime={30}
                />
            );
        }
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <EmoteProvider>
                <div className={s.App}>
                    {!isWidget && <SendToWidget />}
                    <UpdateNotice />
                    <NoticeStack />
                    <GlobalPage />
                </div>
            </EmoteProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
