import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    shortcuts: {
        skipAudio: ["Control", "Shift", "."],
        playLastMessage: ["Control", "Shift", ","],
    },
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setSkipAudioShortcut: (state, action) => {
            state.shortcuts.skipAudio = action.payload;
        },
        setPlayLastMessageShortcut: (state, action) => {
            state.shortcuts.playLastMessage = action.payload;
        },
    },
});

export const { setSkipAudioShortcut, setPlayLastMessageShortcut } =
    settingsSlice.actions;
export default settingsSlice.reducer;

export const selectSettings = (state) => state.settings;
export const selectSkipAudioShortcut = (state) =>
    state.settings.shortcuts.skipAudio;
export const selectPlayLastMessageShortcut = (state) =>
    state.settings.shortcuts.playLastMessage;
