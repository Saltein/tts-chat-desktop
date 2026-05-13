import { createSlice } from "@reduxjs/toolkit";

let initialState = {
    youtube: {
        likes: 0,
        viewers: 0,
    },
    vk: {
        likes: 0,
        viewers: 0,
    },
};

const streamStatusSlice = createSlice({
    name: "streamStatus",
    initialState,
    reducers: {
        setYoutubeLikes: (state, action) => {
            state.youtube.likes = action.payload;
        },
        setYoutubeViewers: (state, action) => {
            state.youtube.viewers = action.payload;
        },

        setVkLikes: (state, action) => {
            state.vk.likes = action.payload;
        },
        setVkViewers: (state, action) => {
            state.vk.viewers = action.payload;
        },
    },
});

export const { setYoutubeLikes, setYoutubeViewers, setVkLikes, setVkViewers } =
    streamStatusSlice.actions;
export default streamStatusSlice.reducer;

export const selectYoutubeStatus = (state) => state.streamStatus.youtube;
export const selectVkStatus = (state) => state.streamStatus.vk;
