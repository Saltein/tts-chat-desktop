import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "streamStatusStyle";

// загрузка style
const loadStyle = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                previewBackgroundOn: parsed.previewBackgroundOn ?? false,
                stretchInWidth: parsed.stretchInWidth ?? false,
                verticalArrange: parsed.verticalArrange ?? false,
                serviceIconSize: parsed.serviceIconSize ?? 16,
                fontSize: parsed.fontSize ?? 12,
                textColor: parsed.textColor ?? "#fff",
                backgroundColor: parsed.backgroundColor ?? "#2a2a2a",
                backgroundOpacity: parsed.backgroundOpacity ?? 1,
                borderRadius: parsed.borderRadius ?? "12px",
                serviceIconOn: parsed.serviceIconOn ?? true,
                twitchOwnHeightOn: parsed.twitchOwnHeightOn ?? false,
            };
        }
    } catch (e) {
        console.error("Error loading streamStatus style:", e);
    }

    return {
        previewBackgroundOn: false,
        stretchInWidth: false,
        verticalArrange: false,
        serviceIconSize: 16,
        fontSize: 12,
        textColor: "#fff",
        backgroundColor: "#2a2a2a",
        backgroundOpacity: 1,
        borderRadius: "12px",
        serviceIconOn: true,
        twitchOwnHeightOn: false,
    };
};

// сохранение style
const saveStyle = (style) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(style));
    } catch (e) {
        console.error("Error saving streamStatus style:", e);
    }
};

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
    style: loadStyle(),
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

        // styles
        setStatusPreviewBackgroundOn: (state, action) => {
            state.style.previewBackgroundOn = action.payload;
            saveStyle(state.style);
        },
        setStretchInWidth: (state, action) => {
            state.style.stretchInWidth = action.payload;
            saveStyle(state.style);
        },
        setVerticalArrange: (state, action) => {
            state.style.verticalArrange = action.payload;
            saveStyle(state.style);
        },
        setServiceIconSize: (state, action) => {
            state.style.serviceIconSize = action.payload;
            saveStyle(state.style);
        },
        setStatusFontSize: (state, action) => {
            state.style.fontSize = action.payload;
            saveStyle(state.style);
        },
        setStatusTextColor: (state, action) => {
            state.style.textColor = action.payload;
            saveStyle(state.style);
        },
        setStatusBackgroundColor: (state, action) => {
            state.style.backgroundColor = action.payload;
            saveStyle(state.style);
        },
        setStatusBackgroundOpacity: (state, action) => {
            state.style.backgroundOpacity = action.payload;
            saveStyle(state.style);
        },
        setStatusBorderRadius: (state, action) => {
            state.style.borderRadius = action.payload;
            saveStyle(state.style);
        },
        setServiceIconOn: (state, action) => {
            state.style.serviceIconOn = action.payload;
            saveStyle(state.style);
        },
        setTwitchOwnHeightOn: (state, action) => {
            state.style.twitchOwnHeightOn = action.payload;
            saveStyle(state.style);
        },
        // styles reset
        resetStyles: (state) => {
            state.style.previewBackgroundOn = false;
            state.style.stretchInWidth = false;
            state.style.verticalArrange = false;
            state.style.serviceIconSize = 16;
            state.style.fontSize = 12;
            state.style.textColor = "#fff";
            state.style.backgroundColor = "#2a2a2a";
            state.style.backgroundOpacity = 1;
            state.style.borderRadius = 12;
            state.style.serviceIconOn = true;
            state.style.twitchOwnHeightOn = false;
            saveStyle(state.style);
        },
    },
});

export const {
    setYoutubeLikes,
    setYoutubeViewers,
    setVkLikes,
    setVkViewers,
    setTwitchViewers,

    // styles
    setStatusPreviewBackgroundOn,
    setStretchInWidth,
    setVerticalArrange,
    setServiceIconSize,
    setStatusFontSize,
    setStatusTextColor,
    setStatusBackgroundColor,
    setStatusBackgroundOpacity,
    setStatusBorderRadius,
    setServiceIconOn,
    setTwitchOwnHeightOn,
    // styles reset
    resetStyles,
} = streamStatusSlice.actions;

export default streamStatusSlice.reducer;

// selectors
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
export const selectStatusBorderRadius = (state) =>
    state.streamStatus.style.borderRadius;
export const selectServiceIconOn = (state) =>
    state.streamStatus.style.serviceIconOn;
export const selectTwitchOwnHeightOn = (state) =>
    state.streamStatus.style.twitchOwnHeightOn;
