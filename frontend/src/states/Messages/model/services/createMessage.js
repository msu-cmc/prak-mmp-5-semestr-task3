import { createAsyncThunk } from "@reduxjs/toolkit";
import MessageAPI from "shared/api/MessageAPI";

export const createMessage = createAsyncThunk(
    "messages/createMessage",
    async ({ project_id, chat_id, text, user_id, parent_id, root_id }, thunkAPI) => {
        try {
            if (!text || user_id == null) {
                throw new Error("text и user_id обязательны");
            }
            const payload = { text, user_id };
            if (Number.isInteger(parent_id)) payload.parent_id = parent_id;
            if (Number.isInteger(root_id)) payload.root_id = root_id;
            const response = await MessageAPI.createMessage(project_id, chat_id, payload);
            const data = response?.data;
            const arr = Array.isArray(data)
                ? data
                : (Array.isArray(data?.values) ? data.values : [data].filter(Boolean));
            return arr;
        } catch (e) {
            const msg = e?.response?.data?.detail || e?.message || "Ошибка отправки сообщения";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);
