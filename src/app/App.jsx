import { useLocation, useNavigate } from "react-router-dom";
import { GlobalPage } from "../pages/GlobalPage/GlobalPage";
import s from "./App.module.scss";
import { ChatWidget } from "../pages/Widgets/ChatWidget/ChatWidget";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QRWidget } from "../pages/Widgets/QRWidget/QRWidget";
import TgLogo from "../shared/assets/icons/telegram-logo-filled.svg";
import { NoticeStack } from "../features/in-app-notices";
import { initVkChatListener } from "../features/live-chat/lib/vk/vkChatListener";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectTwitchTTSOn } from "../features/tts-chat/model/slice";
import { initTTSConsoleListener } from "../features/tts-console/lib/ttsConsoleListener";
import { addNotice } from "../features/in-app-notices/model/slice";
import { genRandStr } from "../shared/lib/genRandStr";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
    const location = useLocation();
    const dispatch = useDispatch();
    const starts = (path) => location.pathname.startsWith(path);

    const isTwitchTTSOn = useSelector(selectTwitchTTSOn);

    useEffect(() => {
        if (!window.electronAPI) return;

        const sync = async () => {
            try {
                if (isTwitchTTSOn) {
                    await window.electronAPI.startTTSServer();
                } else {
                    await window.electronAPI.stopTTSServer();
                }
            } catch (e) {
                window.electronAPI.vk.onNotice(() => {
                    dispatch(
                        addNotice({
                            id: genRandStr(),
                            type: "error",
                            message: "Ошибка запуска TTS сервера: " + e.message,
                        }),
                    );
                });
            }
        };

        sync();
    }, [isTwitchTTSOn]);

    useEffect(() => {
        let interval;
        let timeout;

        if (isTwitchTTSOn) {
            interval = setInterval(() => {
                window.electronAPI.stopTTSServer();
                timeout = setTimeout(() => {
                    window.electronAPI.startTTSServer();
                }, 500);
            }, 180000);
        } else {
            clearInterval(interval);
            clearTimeout(timeout);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isTwitchTTSOn]);

    initVkChatListener();
    initTTSConsoleListener();

    const text = (
        <div>
            <h3>Подпишись</h3>
            <p>Не пропускай стримы</p>
            <h2>@SALTEIN</h2>
        </div>
    );

    if (starts("/widget")) {
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
            <div className={s.App}>
                <NoticeStack />
                <GlobalPage />
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;
