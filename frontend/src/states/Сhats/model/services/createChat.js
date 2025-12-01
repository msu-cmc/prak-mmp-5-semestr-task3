import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import ChatAPI from "shared/api/ChatAPI";

export const createChat = createAsyncThunk(
    "chats/createChat",
    async ({ project_id, name }, thunkAPI) => {
        try {
            const response = await ChatAPI.createChat(project_id, { name });

            if (!response)
                throw "Не удалось создать чат";
            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            toast.success("Чат создан");
            
            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);