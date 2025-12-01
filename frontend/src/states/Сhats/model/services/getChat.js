import { createAsyncThunk } from "@reduxjs/toolkit";
import ChatAPI from "shared/api/ChatAPI";

export const getChat = createAsyncThunk(
    "chats/getChat",
    async ({ project_id, chat_id }, thunkAPI) => {
        try {
            const response = await ChatAPI.getChat(project_id, chat_id);

            if (!response)
                throw "Не удалось получить чат";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            
            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);