import { createSlice } from "@reduxjs/toolkit";

let initialState = {
    youtube: {
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
    },
});

export const { setYoutubeLikes, setYoutubeViewers } = streamStatusSlice.actions;
export default streamStatusSlice.reducer;

export const selectYoutubeStatus = (state) => state.streamStatus.youtube;
