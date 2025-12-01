import {createAsyncThunk} from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import UserApi from "shared/api/UserApi";


export const updateLoggedUser = createAsyncThunk(
    "loggedUser/updateLoggedUser",
    async (data, thunkAPI) => {
        try {
            const response = await UserApi.updateUser(data)
            if(!response){
                throw "Не удалось изменить пользователя"
            }
            if(response.errors){
                if(Array.isArray(response.data?.detail)) throw response.data?.detail[0]?.msg
                else throw response.data?.detail
            }
            toast.success("Пользователь успешно изменён")
            sessionStorage.setItem(USER, JSON.stringify(response.data))
            return response.data
        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
