import { createAsyncThunk } from "@reduxjs/toolkit";
import MessageAPI from "shared/api/MessageAPI";

export const getMessages = createAsyncThunk(
    "messages/getMessages",
    async ({ project_id, chat_id }, thunkAPI) => {
        try {
            const response = await MessageAPI.getMessages(project_id, chat_id);
            if (!response)
                throw "Не удалось получить список сообщений";
            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            const data = response.data;
            const values = Array.isArray(data) ? data : (Array.isArray(data?.values) ? data.values : []);
            values.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));
            return values;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);
