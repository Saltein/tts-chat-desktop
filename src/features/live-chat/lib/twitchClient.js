// twitchClient.js
import tmi from "tmi.js";
import { addNotice } from "../../in-app-notices/model/slice";
import { genRandStr } from "../../../shared/lib/genRandStr";

export function connectTwitchChat(
    { token, botNick, channel },
    dispatch = () => {},
) {
    console.warn("connectTwitchChat channel", channel);

    if (!token || !botNick || !channel) {
        console.error("Нет данных для подключения к Twitch");
        dispatch(
            addNotice({
                type: "error",
                message: "Заполните поля для подключения к Twitch",
            }),
        );
        return null;
    }

    const client = new tmi.Client({
        options: { debug: false },
        identity: {
            username: botNick,
            password: token.startsWith("oauth:") ? token : `oauth:${token}`,
        },
        channels: [channel?.chatChannelName || channel],
    });

    client.connect().catch((err) => {
        console.error("❌ Ошибка подключения к Twitch:", err);
        dispatch(
            addNotice({
                id: genRandStr(),
                type: "error",
                message: `Ошибка подключения к Twitch (${err})`,
            }),
        );
        return;
    });

    client.on("error", (err) => {
        console.error("❌ Twitch error:", err);
        dispatch(
            addNotice({
                id: genRandStr(),
                type: "error",
                message: `Ошибка Twitch (${err})`,
            }),
        );
    });

    client.on("connected", () => {
        console.log(`✅ Подключено к чату Twitch (#${channel})`);
    });

    client.on("disconnected", (reason) => {
        console.warn(`⚠️ Отключено от Twitch: ${reason}`);
        dispatch(
            addNotice({
                id: genRandStr(),
                type: "warning",
                message: `Отключено от Twitch${reason.includes("closed") ? "" : ": " + reason}`,
            }),
        );
    });

    client.on("connecting", () => {
        console.log("🔄 Подключение к Twitch...");
    });

    client.on("logon", () => {
        console.log("🔐 Логин успешен");
    });

    client.on("join", (ch, username, self) => {
        if (self) {
            console.log("✅ Успешно подключились к каналу:", ch);
            dispatch(
                addNotice({
                    id: genRandStr(),
                    type: "success",
                    message: `Подключено к каналу Twitch: ${ch}`,
                }),
            );
        }
    });

    client.on("notice", (channel, msgid, message) => {
        console.warn("⚠️ NOTICE:", msgid, message);
        dispatch(
            addNotice({
                id: genRandStr(),
                type: "warning",
                message: `Уведомление: ${msgid} ${message}`,
            }),
        );
    });

    return client;
}
