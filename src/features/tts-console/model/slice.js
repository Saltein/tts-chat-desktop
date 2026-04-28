import { createSlice } from "@reduxjs/toolkit";
import { genRandStr } from "../../../shared/lib/genRandStr";

const initialState = {
    consoleWidgetOpen: false,
    messages: [],
};

const ttsConsoleSlice = createSlice({
    name: "ttsConsole",
    initialState,
    reducers: {
        setConsoleWidgetOpen: (state, action) => {
            state.consoleWidgetOpen = action.payload;
        },
        addConsoleMessage: (state, action) => {
            state.messages.push({
                ...action.payload,
                id: genRandStr(),
                time: Date.now(),
            });
            if (state.messages.length > 1000) {
                state.messages.shift();
            }
        },
        clearConsoleMessages: (state) => {
            state.messages = [];
        },
    },
});

export const { addConsoleMessage, clearConsoleMessages, setConsoleWidgetOpen } =
    ttsConsoleSlice.actions;
export default ttsConsoleSlice.reducer;

export const selectConsoleWidgetOpen = (state) =>
    state.ttsConsole.consoleWidgetOpen;
export const selectConsoleMessages = (state) => state.ttsConsole.messages;
