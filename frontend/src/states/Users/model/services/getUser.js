import {createAsyncThunk} from "@reduxjs/toolkit";
import UserApi from "shared/api/UserApi";

export const getUser = createAsyncThunk(
    "users/getUser",
    async (id, thunkAPI) => {
        try {
            const response = await UserApi.getUser(id)
            if(!response){
                throw "Не удалось получить пользователя"
            }
            if(response.errors){
                if(Array.isArray(response.data?.detail)){
                    throw response.data?.detail[0]?.msg
                }
                else {
                    throw response.data?.detail
                }
            }
            return response.data

        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
