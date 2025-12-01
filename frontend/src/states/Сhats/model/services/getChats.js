import { createAsyncThunk } from "@reduxjs/toolkit";
import ChatAPI from "shared/api/ChatAPI";

export const getChats = createAsyncThunk(
    "chats/getChats",
    async ({ project_id, name = "" }, thunkAPI) => {
        try {
            const response = await ChatAPI.getChats(project_id, name);
            
            if (!response)
                throw "Не удалось получить список чатов";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            return response.data.values;

        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);