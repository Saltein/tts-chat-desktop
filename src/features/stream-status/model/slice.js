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
    twitch: {
        viewers: 0,
    },
    style: {
        previewBackgroundOn: false,
        stretchInWidth: false,
        verticalArrange: false,
        serviceIconSize: 16,
        fontSize: 12,
        textColor: "#fff",
        backgroundColor: "#2a2a2a",
        backgroundOpacity: 1,
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

        setTwitchViewers: (state, action) => {
            state.twitch.viewers = action.payload;
        },

        //styles
        setStatusPreviewBackgroundOn: (state, action) => {
            state.style.previewBackgroundOn = action.payload;
        },
        setStretchInWidth: (state, action) => {
            state.style.stretchInWidth = action.payload;
        },
        setVerticalArrange: (state, action) => {
            state.style.verticalArrange = action.payload;
        },
        setServiceIconSize: (state, action) => {
            state.style.serviceIconSize = action.payload;
        },
        setStatusFontSize: (state, action) => {
            state.style.fontSize = action.payload;
        },
        setStatusTextColor: (state, action) => {
            state.style.textColor = action.payload;
        },
        setStatusBackgroundColor: (state, action) => {
            state.style.backgroundColor = action.payload;
        },
        setStatusBackgroundOpacity: (state, action) => {
            state.style.backgroundOpacity = action.payload;
        },
    },
});

export const {
    setYoutubeLikes,
    setYoutubeViewers,
    setVkLikes,
    setVkViewers,
    setTwitchViewers,
    //styles
    setStatusPreviewBackgroundOn,
    setStretchInWidth,
    setVerticalArrange,
    setServiceIconSize,
    setStatusFontSize,
    setStatusTextColor,
    setStatusBackgroundColor,
    setStatusBackgroundOpacity,
} = streamStatusSlice.actions;
export default streamStatusSlice.reducer;

export const selectYoutubeStatus = (state) => state.streamStatus.youtube;
export const selectVkStatus = (state) => state.streamStatus.vk;
export const selectTwitchStatus = (state) => state.streamStatus.twitch;

//styles
export const selectStatusPreviewBackgroundOn = (state) =>
    state.streamStatus.style.previewBackgroundOn;
export const selectStretchInWidth = (state) =>
    state.streamStatus.style.stretchInWidth;
export const selectVerticalArrange = (state) =>
    state.streamStatus.style.verticalArrange;
export const selectServiceIconSize = (state) =>
    state.streamStatus.style.serviceIconSize;
export const selectStatusFontSize = (state) =>
    state.streamStatus.style.fontSize;
export const selectStatusTextColor = (state) =>
    state.streamStatus.style.textColor;
export const selectStatusBackgroundColor = (state) =>
    state.streamStatus.style.backgroundColor;
export const selectStatusBackgroundOpacity = (state) =>
    state.streamStatus.style.backgroundOpacity;