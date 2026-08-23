import s from "./App.module.scss";
import TgLogo from "../shared/assets/icons/telegram-logo-filled.svg";
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
import { initYoutubeChatListener } from "../features/live-chat/lib/youtube/youtubeChatListener";
import { useEffect } from "react";
import { useStartsWith } from "../shared/hooks/useStartsWith";
import {
	initTwitchListener,
	stopTwitchPolling,
} from "../features/live-chat/lib/twitch/twitchListener";
import { useSelector } from "react-redux";
import {
	selectTwitchConnectionData,
	selectTwitchConnectionStatus,
} from "../entities/connection/model/slice";
import { getTwitchChannelName } from "../shared/lib/getTwitchChannelName";
import { StatisticsWidget } from "../pages/Widgets/StatisticsWidget/StatisticsWidget";
import { HeartRateWidget } from "../pages/Widgets/HeartRateWidget/HeartRateWidget";

function App() {
	const { starts, isWidget } = useStartsWith();

	const twitchChannelNameRaw = useSelector(selectTwitchConnectionData);
	const twitchChannelName = getTwitchChannelName(
		twitchChannelNameRaw.chatChannelName,
	);
	const twitchConnected = useSelector(selectTwitchConnectionStatus);

	useTTSServer(isWidget);

	const text = (
		<div>
			<h3>Подпишись</h3>
			<p>Не пропускай стримы</p>
			<h2>@SALTEIN</h2>
		</div>
	);

	useEffect(() => {
		if (!isWidget) {
			initVkChatListener();
			initYoutubeChatListener();
			initTTSConsoleListener();
		}
	}, [isWidget]);

	useEffect(() => {
		if (!isWidget && twitchChannelName && twitchConnected) {
			initTwitchListener(twitchChannelName);
		} else if (!twitchChannelName || !twitchConnected) {
			stopTwitchPolling();
		}

		return () => {
			stopTwitchPolling();
		};
	}, [twitchChannelName, isWidget, twitchConnected]);

	if (isWidget) {
		if (starts("/widget/chat")) {
			return (
				<EmoteProvider>
					<ChatWidget />
				</EmoteProvider>
			);
		}
		if (starts("/widget/qrcode")) {
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
		if (starts("/widget/statistics")) {
			return <StatisticsWidget />;
		}
		if (starts("/widget/heart_rate")) {
			return <HeartRateWidget />;
		}
	}

	return (
		<EmoteProvider>
			<div className={s.App}>
				{!isWidget && <SendToWidget />}
				<UpdateNotice />
				<NoticeStack />
				<GlobalPage />
			</div>
		</EmoteProvider>
	);
}

export default App;
