// features/tts-chat/model/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { genRandStr } from "../../../shared/lib/genRandStr";

// Функция загрузки настроек из localStorage
const loadSettings = () => {
    try {
        const savedSettings = localStorage.getItem("ttsSettings");
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            return {
                common: {
                    speechVolume: parsed.common?.speechVolume ?? 50,
                },
                twitch: {
                    ttsOn: parsed.twitch?.ttsOn ?? false, // Булево значение
                    voice: parsed.twitch?.voice ?? "random",
                },
                clearTrigger: parsed.clearTrigger ?? "random string",
                ownVoice: parsed.ownVoice ?? false,
                whiteListOn: parsed.whiteListOn ?? false,
                whiteList: parsed.whiteList ?? [],
                blackListOn: parsed.blackListOn ?? false,
                blackList: parsed.blackList ?? [],
            };
        }
    } catch (error) {
        console.error("Ошибка загрузки настроек TTS:", error);
    }

    // Дефолтное состояние
    return {
        common: {
            speechVolume: 50,
        },
        twitch: {
            ttsOn: false, // Булево значение
            voice: "random",
        },
        clearTrigger: "random string",
        ownVoice: false,
        whiteListOn: false,
        whiteList: [],
        blackListOn: false,
        blackList: [],
    };
};

const initialState = loadSettings();

const saveToLocalStorage = (state) => {
    try {
        localStorage.setItem(
            "ttsSettings",
            JSON.stringify({
                common: {
                    speechVolume: state.common.speechVolume,
                },
                twitch: {
                    ttsOn: state.twitch.ttsOn,
                    voice: state.twitch.voice,
                },
                clearTrigger: state.clearTrigger,
                ownVoice: state.ownVoice,
                whiteListOn: state.whiteListOn,
                whiteList: state.whiteList,
                blackListOn: state.blackListOn,
                blackList: state.blackList,
            }),
        );
    } catch (error) {
        console.error("Ошибка сохранения настроек TTS:", error);
    }
};

const ttsSettingsSlice = createSlice({
    name: "ttsSettings",
    initialState,
    reducers: {
        setSpeechVolume: (state, action) => {
            state.common.speechVolume = action.payload;
            saveToLocalStorage(state);
        },
        setTwitchTTSOn: (state, action) => {
            state.twitch.ttsOn = action.payload;
            saveToLocalStorage(state);
        },
        setTwitchVoice: (state, action) => {
            state.twitch.voice = action.payload;
            saveToLocalStorage(state);
        },
        setClearTrigger: (state, action) => {
            state.clearTrigger = action.payload;
            saveToLocalStorage(state);
        },
        toggleOwnVoice: (state) => {
            state.ownVoice = !state.ownVoice;
            saveToLocalStorage(state);
        },

        // white list
        setWhiteListOn: (state, action) => {
            state.whiteListOn = action.payload;
            saveToLocalStorage(state);
        },
        toggleWhiteList: (state) => {
            state.whiteListOn = !state.whiteListOn;
            saveToLocalStorage(state);
        },
        addWhiteListItem: (state, action) => {
            if (state.whiteList.some((item) => item.name === action.payload))
                return;
            state.whiteList.push({ name: action.payload, id: genRandStr() });
            saveToLocalStorage(state);
        },
        removeFromWhiteList: (state, action) => {
            state.whiteList = state.whiteList.filter(
                (item) => item.name !== action.payload,
            );
            saveToLocalStorage(state);
        },
        clearWhiteList: (state) => {
            state.whiteList = [];
            saveToLocalStorage(state);
        },

        // black list
        setBlackListOn: (state, action) => {
            state.blackListOn = action.payload;
            saveToLocalStorage(state);
        },
        toggleBlackList: (state) => {
            state.blackListOn = !state.blackListOn;
            saveToLocalStorage(state);
        },
        addBlackListItem: (state, action) => {
            if (state.blackList.some((item) => item.name === action.payload))
                return;
            state.blackList.push({ name: action.payload, id: genRandStr() });
            saveToLocalStorage(state);
        },
        removeFromBlackList: (state, action) => {
            state.blackList = state.blackList.filter(
                (item) => item.name !== action.payload,
            );
            saveToLocalStorage(state);
        },
        clearBlackList: (state) => {
            state.blackList = [];
            saveToLocalStorage(state);
        },

        resetSettings: () => {
            const defaultState = {
                common: { speechVolume: 50 },
                twitch: { ttsOn: true, voice: "random" },
                clearTrigger: "random string",
                ownVoice: false,
                whiteListOn: false,
                whiteList: [],
                blackListOn: false,
                blackList: [],
            };
            saveToLocalStorage(defaultState);
            return defaultState;
        },
    },
});

export const {
    setSpeechVolume,
    setTwitchTTSOn,
    setTwitchVoice,
    setClearTrigger,
    toggleOwnVoice,

    setWhiteListOn,
    toggleWhiteList,
    addWhiteListItem,
    removeFromWhiteList,
    clearWhiteList,
    
    setBlackListOn,
    toggleBlackList,
    addBlackListItem,
    removeFromBlackList,
    clearBlackList,

    resetSettings,
} = ttsSettingsSlice.actions;

export default ttsSettingsSlice.reducer;

export const selectSpeechVolume = (state) =>
    state.ttsSettings.common.speechVolume;
export const selectTwitchTTSOn = (state) => state.ttsSettings.twitch.ttsOn;
export const selectTwitchVoice = (state) => state.ttsSettings.twitch.voice;
export const selectClearTrigger = (state) => state.ttsSettings.clearTrigger;
export const selectOwnVoice = (state) => state.ttsSettings.ownVoice;
export const selectWhiteListOn = (state) => state.ttsSettings.whiteListOn;
export const selectWhiteList = (state) => state.ttsSettings.whiteList;
export const selectBlackListOn = (state) => state.ttsSettings.blackListOn;
export const selectBlackList = (state) => state.ttsSettings.blackList;
