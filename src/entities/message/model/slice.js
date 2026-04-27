import { createSlice } from "@reduxjs/toolkit";

let initialState = {
    // Name
    messageNameBackground: true,
    messageNameBackgroundColor: "#1e1e1e",
    messageNameBackgroundOpacity: 1,
    messageNameBorder: true,
    serviceIcon: true,

    // Message
    messageBackground: "#2a2a2a",
    messageBackgroundOpacity: 1,
    messageBorder: true,
    messageTextColor: "#ffffff",

    // General
    messageLifeTime: 30000,
    messageGap: "8",
    fontSize: 16,
};

// Загружаем параметры из localStorage
try {
    const saved = JSON.parse(localStorage.getItem("chatCustomization"));
    if (saved) {
        initialState = {
            // Name
            messageNameBackground: saved.messageNameBackground ?? true,
            messageNameBackgroundColor:
                saved.messageNameBackgroundColor ?? "",
            messageNameBackgroundOpacity:
                saved.messageNameBackgroundOpacity ?? 1,
            messageNameBorder: saved.messageNameBorder ?? true,
            serviceIcon: saved.serviceIcon ?? true,

            // Message
            messageBackground: saved.messageBackground ?? "#2a2a2a",
            messageBackgroundOpacity: saved.messageBackgroundOpacity ?? 1,
            messageBorder: saved.messageBorder ?? true,
            messageTextColor: saved.messageTextColor ?? "",

            // General
            messageLifeTime: saved.messageLifeTime ?? 30000,
            messageGap: saved.messageGap ?? "8",
            fontSize: saved.fontSize ?? "16px",
        };
    }
} catch {
    // просто игнорируем ошибку
}

// Сохраняем localStorage
const saveToLocalStorage = (state) => {
    localStorage.setItem("chatCustomization", JSON.stringify(state));
};

const messageCustomizationSlice = createSlice({
    name: "messageCustomization",
    initialState,
    reducers: {
        // Name
        setMessageNameBackground: (state, action) => {
            state.messageNameBackground = action.payload;
            saveToLocalStorage(state);
        },
        setMessageNameBackgroundColor: (state, action) => {
            state.messageNameBackgroundColor = action.payload;
            saveToLocalStorage(state);
        },
        setMessageNameBackgroundOpacity: (state, action) => {
            state.messageNameBackgroundOpacity = action.payload;
            saveToLocalStorage(state);
        },
        setMessageNameBorder: (state, action) => {
            state.messageNameBorder = action.payload;
            saveToLocalStorage(state);
        },
        setServiceIcon: (state, action) => {
            state.serviceIcon = action.payload;
            saveToLocalStorage(state);
        },

        // Message
        setMessageBackground: (state, action) => {
            state.messageBackground = action.payload;
            saveToLocalStorage(state);
        },
        setMessageBackgroundOpacity: (state, action) => {
            state.messageBackgroundOpacity = action.payload;
            saveToLocalStorage(state);
        },
        setMessageBorder: (state, action) => {
            state.messageBorder = action.payload;
            saveToLocalStorage(state);
        },
        setMessageTextColor: (state, action) => {
            state.messageTextColor = action.payload;
            saveToLocalStorage(state);
        },

        // General
        setMessageLifeTime: (state, action) => {
            state.messageLifeTime = action.payload;
            saveToLocalStorage(state);
        },
        setMessageGap: (state, action) => {
            state.messageGap = action.payload;
            saveToLocalStorage(state);
        },
        setFontSize: (state, action) => {
            state.fontSize = action.payload;
            saveToLocalStorage(state);
        },
    },
});

export const {
    // Name
    setMessageNameBackground,
    setMessageNameBackgroundColor,
    setMessageNameBackgroundOpacity,
    setMessageNameBorder,
    setServiceIcon,

    // Message
    setMessageBackground,
    setMessageBackgroundOpacity,
    setMessageBorder,
    setMessageTextColor,

    // General
    setMessageLifeTime,
    setMessageGap,
    setFontSize,
} = messageCustomizationSlice.actions;

export default messageCustomizationSlice.reducer;

// Селекторы
// Name
export const selectMessageNameBackground = (state) =>
    state.messageCustomization.messageNameBackground;
export const selectMessageNameBackgroundColor = (state) =>
    state.messageCustomization.messageNameBackgroundColor;
export const selectMessageNameBackgroundOpacity = (state) =>
    state.messageCustomization.messageNameBackgroundOpacity;
export const selectMessageNameBorder = (state) =>
    state.messageCustomization.messageNameBorder;
export const selectServiceIcon = (state) =>
    state.messageCustomization.serviceIcon;

// Message
export const selectMessageBackground = (state) =>
    state.messageCustomization.messageBackground;
export const selectMessageBackgroundOpacity = (state) =>
    state.messageCustomization.messageBackgroundOpacity;
export const selectMessageBorder = (state) =>
    state.messageCustomization.messageBorder;
export const selectMessageTextColor = (state) =>
    state.messageCustomization.messageTextColor;

// General
export const selectMessageLifeTime = (state) =>
    state.messageCustomization.messageLifeTime;
export const selectMessageGap = (state) =>
    state.messageCustomization.messageGap;
export const selectFontSize = (state) => state.messageCustomization.fontSize;
