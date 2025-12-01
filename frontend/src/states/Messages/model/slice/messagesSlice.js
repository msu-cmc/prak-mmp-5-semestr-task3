import { createSlice, createSelector } from "@reduxjs/toolkit";
import { getMessages, createMessage } from "../services";

const initialState = {
    byChatId: {},
    loadingByChatId: {},
    errorByChatId: {},
    lastReqIdByChatId: {},
    messages: [],
    loading: false,
    error: null,
    requestedChatId: null
};

function normalizePayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.values)) return payload.values;
    if (payload && Array.isArray(payload.messages)) return payload.messages;
    if (payload && payload.message) return [payload.message];
    return payload ? [payload] : [];
}

function isTmp(m) {
    const id = m?.id;
    return typeof id === "string" && id.startsWith("tmp-");
}

function toNumId(id) {
    return Number.isFinite(id) ? id : Number.isFinite(Number(id)) ? Number(id) : Number.NaN;
}

function sortMessages(arr) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    a.sort((x, y) => {
        const xi = toNumId(x?.id);
        const yi = toNumId(y?.id);
        if (Number.isFinite(xi) && Number.isFinite(yi) && xi !== yi) return xi - yi;
        const xt = x?.created_at || x?.createdAt || null;
        const yt = y?.created_at || y?.createdAt || null;
        if (xt && yt && xt !== yt) return new Date(xt) - new Date(yt);
        return 0;
    });
    return a;
}

function mergeUnique(prev, incoming, { dropTmp = true } = {}) {
    const map = new Map();
    for (const m of prev || []) {
        if (!m) continue;
        map.set(m.id ?? Symbol(), m);
    }
    for (const m of incoming || []) {
        if (!m) continue;
        map.set(m.id ?? Symbol(), m);
    }
    let res = Array.from(map.values());
    if (dropTmp) {
        const hasReal = res.some(m => Number.isFinite(toNumId(m?.id)));
        if (hasReal) res = res.filter(m => !isTmp(m));
    }
    return sortMessages(res);
}

export const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        clearAll(state) {
            state.byChatId = {};
            state.loadingByChatId = {};
            state.errorByChatId = {};
            state.lastReqIdByChatId = {};
            state.messages = [];
            state.loading = false;
            state.error = null;
            state.requestedChatId = null;
        },
        clearChat(state, action) {
            const chatId = String(action.payload);
            delete state.byChatId[chatId];
            delete state.loadingByChatId[chatId];
            delete state.errorByChatId[chatId];
            delete state.lastReqIdByChatId[chatId];
            if (String(state.requestedChatId) === chatId) {
                state.messages = [];
                state.loading = false;
                state.error = null;
                state.requestedChatId = null;
            }
        },
        clearMessages(state, action) {
            const chatId = action?.payload?.chat_id ?? action?.payload;
            if (chatId != null) {
                const id = String(chatId);
                delete state.byChatId[id];
                delete state.loadingByChatId[id];
                delete state.errorByChatId[id];
                delete state.lastReqIdByChatId[id];
                if (String(state.requestedChatId) === id) {
                    state.messages = [];
                    state.loading = false;
                    state.error = null;
                    state.requestedChatId = null;
                }
            } else {
                state.byChatId = {};
                state.loadingByChatId = {};
                state.errorByChatId = {};
                state.lastReqIdByChatId = {};
                state.messages = [];
                state.loading = false;
                state.error = null;
                state.requestedChatId = null;
            }
        },
        pushLocal(state, action) {
            const chat_id = action.payload?.chat_id;
            const messages = action.payload?.messages;
            if (chat_id == null) return;
            const id = String(chat_id);
            const prev = state.byChatId[id] || [];
            const inc = normalizePayload(messages);
            state.byChatId[id] = [...prev, ...inc];
            if (String(state.requestedChatId) === id) {
                state.messages = [...state.messages, ...inc];
            }
        },
        addOptimisticMessages(state, action) {
            const chat_id = action.payload?.chat_id;
            const messages = action.payload?.messages;
            if (chat_id == null || !messages) return;
            const id = String(chat_id);
            const prev = state.byChatId[id] || [];
            const inc = normalizePayload(messages);
            state.byChatId[id] = sortMessages([...prev, ...inc]);
            if (String(state.requestedChatId) === id) {
                state.messages = sortMessages([...state.messages, ...inc]);
            }
        },
        replaceOptimisticWithReal(state, action) {
            const chat_id = action.payload?.chat_id;
            const tmpIds = action.payload?.tmpIds || [];
            const realMessages = action.payload?.realMessages;
            if (chat_id == null) return;
            const id = String(chat_id);
            const prev = state.byChatId[id] || [];
            // Удаляем временные сообщения
            const filtered = prev.filter(m => !tmpIds.includes(m.id));
            // Добавляем реальные сообщения
            const inc = normalizePayload(realMessages);
            state.byChatId[id] = sortMessages([...filtered, ...inc]);
            if (String(state.requestedChatId) === id) {
                state.messages = state.byChatId[id];
            }
        },
        clearAnimationFlag(state, action) {
            const chat_id = action.payload?.chat_id;
            const message_id = action.payload?.message_id;
            if (chat_id == null || message_id == null) return;
            const id = String(chat_id);
            const messages = state.byChatId[id];
            if (messages) {
                const updated = messages.map(m => {
                    if (m.id === message_id && m.shouldAnimate) {
                        const { shouldAnimate, ...rest } = m;
                        return rest;
                    }
                    return m;
                });
                state.byChatId[id] = updated;
                if (String(state.requestedChatId) === id) {
                    state.messages = updated;
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMessages.pending, (state, action) => {
                const chatId = action.meta?.arg?.chat_id;
                const reqId = action.meta?.requestId;
                if (chatId == null) return;
                const id = String(chatId);
                state.loadingByChatId[id] = true;
                state.errorByChatId[id] = null;
                state.lastReqIdByChatId[id] = reqId;
                state.loading = true;
                state.error = null;
                state.requestedChatId = id;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                const chatId = action.meta?.arg?.chat_id;
                const reqId = action.meta?.requestId;
                if (chatId == null) return;
                const id = String(chatId);
                if (state.lastReqIdByChatId[id] !== reqId) return;
                const items = normalizePayload(action.payload);
                const sorted = sortMessages(items);
                state.byChatId[id] = sorted;
                state.loadingByChatId[id] = false;
                state.errorByChatId[id] = null;
                if (String(state.requestedChatId) === id) {
                    state.messages = sorted;
                    state.loading = false;
                    state.error = null;
                }
            })
            .addCase(getMessages.rejected, (state, action) => {
                const chatId = action.meta?.arg?.chat_id;
                const reqId = action.meta?.requestId;
                if (chatId == null) return;
                const id = String(chatId);
                if (state.lastReqIdByChatId[id] !== reqId) return;
                state.loadingByChatId[id] = false;
                state.errorByChatId[id] = action.payload ?? action.error?.message ?? "Ошибка загрузки сообщений";
                if (String(state.requestedChatId) === id) {
                    state.loading = false;
                    state.error = state.errorByChatId[id];
                }
            })
            .addCase(createMessage.pending, (state, action) => {
                const chatId = action.meta?.arg?.chat_id;
                if (chatId == null) return;
                const id = String(chatId);
                state.loadingByChatId[id] = true;
            })
            .addCase(createMessage.fulfilled, (state, action) => {
                const chatId = action.meta?.arg?.chat_id;
                if (chatId == null) return;
                const id = String(chatId);
                state.loadingByChatId[id] = false;
                const prev = state.byChatId[id] || [];
                const incoming = normalizePayload(action.payload);
                if (incoming.length) {
                    // Удаляем временные сообщения (начинающиеся с tmp-)
                    const withoutTmp = prev.filter(m => !isTmp(m));
                    // Помечаем новые сообщения ассистента флагом для анимации
                    const withAnimFlag = incoming.map(m => {
                        const role = m.role ?? (m.user_id === 0 || m.user_id === 2 ? "assistant" : "user");
                        if (role === "assistant") {
                            return { ...m, shouldAnimate: true };
                        }
                        return m;
                    });
                    // Добавляем новые сообщения от сервера
                    const merged = mergeUnique(withoutTmp, withAnimFlag, { dropTmp: false });
                    state.byChatId[id] = merged;
                    if (String(state.requestedChatId) === id) {
                        state.messages = merged;
                    }
                }
            })
            .addCase(createMessage.rejected, (state, action) => {
                const chatId = action.meta?.arg?.chat_id;
                if (chatId == null) return;
                const id = String(chatId);
                state.loadingByChatId[id] = false;
            });
    }
});

export const { actions: messagesActions } = messagesSlice;
export const { reducer: messagesReducer } = messagesSlice;

export const selectMessagesByChat = (chatId) =>
    createSelector(
        (state) => state?.messages?.byChatId?.[String(chatId)],
        (messages) => messages ?? []
    );

export const selectLoadingByChat = (chatId) => (s) =>
    Boolean(s?.messages?.loadingByChatId?.[String(chatId)]);

export const selectErrorByChat = (chatId) => (s) =>
    s?.messages?.errorByChatId?.[String(chatId)] ?? null;

export const selectChainInfoByChat = (chatId) => (s) => {
    const arr = s?.messages?.byChatId?.[String(chatId)] ?? [];
    const list = Array.isArray(arr) ? arr.filter(m => Number.isFinite(Number(m?.id))) : [];
    const first = list.length ? Number(list[0].id) : null;
    const last = list.length ? Number(list[list.length - 1].id) : null;
    return { root_id: Number.isFinite(first) ? first : null, parent_id: Number.isFinite(last) ? last : null };
};
