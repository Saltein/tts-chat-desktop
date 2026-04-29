import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chatFullscreen: false,
};

const liveChatSlice = createSlice({
    name: "liveChat",
    initialState,
    reducers: {
        toggleChatFullscreen: (state) => {
            state.chatFullscreen = !state.chatFullscreen;
        },
    },
});

export const { toggleChatFullscreen } = liveChatSlice.actions;
export default liveChatSlice.reducer;

export const selectChatFullscreen = (state) => state.liveChat.chatFullscreen;
