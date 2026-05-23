// features/tts-chat/model/slice.js
import { createSlice } from "@reduxjs/toolkit";

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
        resetSettings: () => {
            const defaultState = {
                common: { speechVolume: 50 },
                twitch: { ttsOn: true, voice: "random" },
                clearTrigger: "random string",
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
    resetSettings,
} = ttsSettingsSlice.actions;

export default ttsSettingsSlice.reducer;

export const selectSpeechVolume = (state) =>
    state.ttsSettings.common.speechVolume;
export const selectTwitchTTSOn = (state) => state.ttsSettings.twitch.ttsOn;
export const selectTwitchVoice = (state) => state.ttsSettings.twitch.voice;
export const selectClearTrigger = (state) => state.ttsSettings.clearTrigger;
export const selectOwnVoice = (state) => state.ttsSettings.ownVoice;
