import {createAsyncThunk} from "@reduxjs/toolkit";
import UsersApi from "shared/api/UserApi";
import { toast } from "react-toastify";

export const addUser = createAsyncThunk(
    "users/addUser",
    async (data, thunkAPI) => {
        try {
            const response = await UsersApi.createUser(data)
            if(!response){
                throw "Не удалось добавить пользователя"
            }
            if(response.errors){
                if(Array.isArray(response.data?.detail)){
                    throw response.data?.detail[0]?.msg
                }
                else {
                    throw response.data?.detail
                }
            }
            toast.success("Пользователь успешно добавлен")
            return response.data
        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
