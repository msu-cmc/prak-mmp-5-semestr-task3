export const returnMessages = (s) => s?.messages?.messages ?? [];

export const returnCurrentMessage = (s) => {
    const arr = s?.messages?.messages ?? [];
    return arr.length ? arr[arr.length - 1] : null;
};

export const returnMessagesLoading = (s) =>
    Boolean(s?.messages?.loading);

export const returnMessagesPageLoading = (s, chatId) => {
    const id = chatId != null ? String(chatId) : String(s?.messages?.requestedChatId ?? "");
    return Boolean(s?.messages?.loadingByChatId?.[id]);
};

export const returnMessagesError = (s) =>
    s?.messages?.error ?? null;
