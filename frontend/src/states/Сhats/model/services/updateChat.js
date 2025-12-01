import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import ChatAPI from "shared/api/ChatAPI";

export const updateChat = createAsyncThunk(
    "chats/updateChat",
    async ({ project_id, chat_id, name }, thunkAPI) => {
        try {
            const response = await ChatAPI.updateChat(project_id, chat_id, { name });

            if (!response)
                throw "Не удалось обновить чат";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            
            toast.success("Чат обновлён");
            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);