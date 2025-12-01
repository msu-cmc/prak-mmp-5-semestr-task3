import {createAsyncThunk} from "@reduxjs/toolkit";
import UsersApi from "shared/api/UserApi";
import { toast } from "react-toastify";

export const deleteUser = createAsyncThunk(
    "users/deleteUser",
    async (id, thunkAPI) => {
        try {
            const response = await UsersApi.deleteUser(id)
            if(!response){
                throw "Не удалось удалить пользователя"
            }
            if(response.errors){
                if(Array.isArray(response.data?.detail)){
                    throw response.data?.detail[0]?.msg
                }
                else {
                    throw response.data?.detail
                }
            }
            toast.success("Пользователь успешно удален")
            return id
        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
