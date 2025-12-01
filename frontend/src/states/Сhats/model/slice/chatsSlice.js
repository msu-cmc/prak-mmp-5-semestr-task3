import { createSlice } from "@reduxjs/toolkit";
import { createChat } from "../services/createChat";
import { getChats } from "../services/getChats";
import { getChat } from "../services/getChat";
import { updateChat } from "../services/updateChat";
import { deleteChat } from "../services/deleteChat";
import { handlePending } from "shared/lib/handlePending";
import { handleRejected } from "shared/lib/handleRejected";
import { handlePagePending } from "shared/lib/handlePagePending";
import { handlePageRejected } from "shared/lib/handlePageRejected";

const initialState = {
    currentChatId: null,
    currentChat: { id: -1, name: "" },
    chats: [],
    chatNames: {},
    loading: false,
    pageLoading: false,
    error: null,
};

export const chatsSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        clearChats: (state) => {
            state.chats = [];
            state.chatNames = {};
            state.currentChatId = null;
            state.currentChat = { id: -1, name: "" };
        },
        setChatName: (state, action) => {
            const { id, name } = action.payload || {};
            if (id != null && typeof name === "string") {
                state.chatNames[id] = name;
                if (state.currentChat?.id === id) state.currentChat.name = name;
                const i = state.chats.findIndex(c => (c?.chat ?? c)?.id === id);
                if (i !== -1) {
                    const plain = state.chats[i]?.chat ?? state.chats[i];
                    state.chats[i] = { ...plain, name };
                }
            }
        },
        setCurrentChatId: (state, action) => {
            const id = action.payload ?? null;
            state.currentChatId = id;
            if (id == null) state.currentChat = { id: -1, name: "" };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createChat.pending, handlePending)
            .addCase(createChat.fulfilled, (state, action) => {
                const chat = action.payload?.chat ?? action.payload;
                state.chats.push(chat);
                if (chat?.id != null && typeof chat?.name === "string") {
                    state.chatNames[chat.id] = chat.name;
                }
                if (state.currentChatId === null) state.currentChatId = chat.id;
                state.loading = false;
                state.error = null;
            })
            .addCase(createChat.rejected, handleRejected)

            .addCase(getChats.pending, handlePagePending)
            .addCase(getChats.fulfilled, (state, action) => {
                const arr = Array.isArray(action.payload)
                    ? action.payload.map(x => x?.chat ?? x)
                    : [];
                const prevActive = state.currentChatId;
                state.chats = arr;
                state.chatNames = {};
                for (const c of arr) {
                    if (c?.id != null && typeof c?.name === "string") {
                        state.chatNames[c.id] = c.name;
                    }
                }
                const exists = prevActive != null && arr.some(c => c.id === prevActive);
                if (exists) {
                    state.currentChatId = prevActive;
                } else {
                    state.currentChatId = arr[0]?.id ?? null;
                }
                state.pageLoading = false;
                state.error = null;
            })
            .addCase(getChats.rejected, handlePageRejected)

            .addCase(getChat.pending, handlePagePending)
            .addCase(getChat.fulfilled, (state, action) => {
                const chat = action.payload?.chat ?? action.payload;
                state.currentChat = chat;
                state.currentChatId = chat?.id ?? null;
                if (chat?.id != null && typeof chat?.name === "string") {
                    state.chatNames[chat.id] = chat.name;
                }
                state.pageLoading = false;
                state.error = null;
            })
            .addCase(getChat.rejected, handlePageRejected)

            .addCase(updateChat.pending, handlePending)
            .addCase(updateChat.fulfilled, (state, action) => {
                const updated = action.payload?.chat ?? action.payload;
                const i = state.chats.findIndex(c => (c?.chat ?? c)?.id === updated.id);
                if (i !== -1) {
                    const plain = state.chats[i]?.chat ?? state.chats[i];
                    state.chats[i] = { ...plain, ...updated };
                }
                if (state.currentChat?.id === updated.id) {
                    state.currentChat = { ...state.currentChat, ...updated };
                }
                if (updated?.id != null && typeof updated?.name === "string") {
                    state.chatNames[updated.id] = updated.name;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateChat.rejected, handleRejected)

            .addCase(deleteChat.pending, handlePending)
            .addCase(deleteChat.fulfilled, (state, action) => {
                const id = action.payload.chat_id;
                state.chats = state.chats.filter(c => (c?.chat ?? c)?.id !== id);
                delete state.chatNames[id];
                if (state.currentChatId === id) {
                    state.currentChatId = state.chats[0]?.id ?? null;
                    state.currentChat = state.chats.length
                        ? (state.chats[0]?.chat ?? state.chats[0])
                        : { id: -1, name: "" };
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteChat.rejected, handleRejected);
    },
});

export const { actions: chatsActions } = chatsSlice;
export const { reducer: chatsReducer } = chatsSlice;