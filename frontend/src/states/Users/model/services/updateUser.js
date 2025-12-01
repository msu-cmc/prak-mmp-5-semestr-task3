import {createAsyncThunk} from "@reduxjs/toolkit";
import UsersApi from "shared/api/UserApi";
import { toast } from "react-toastify";

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async (data, thunkAPI) => {
        try {
            const response = await UsersApi.updateUser(data)
            if(!response){
                throw "Не удалось изменить пользователя"
            }
            if(response.errors){
                if(Array.isArray(response.data?.detail)){
                    throw response.data?.detail[0]?.msg
                }
                else {
                    throw response.data?.detail
                }
            }
            toast.success("Пользователь успешно изменён")
            return response.data
        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
