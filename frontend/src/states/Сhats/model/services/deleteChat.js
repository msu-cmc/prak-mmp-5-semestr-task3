import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import ChatAPI from "shared/api/ChatAPI";

export const deleteChat = createAsyncThunk(
    "chats/deleteChat",
    async ({ project_id, chat_id }, thunkAPI) => {
        try {
            const response = await ChatAPI.deleteChat(project_id, chat_id);

            if (!response)
                throw "Не удалось удалить чат";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            
            toast.success("Чат удалён");
            return { chat_id };
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);