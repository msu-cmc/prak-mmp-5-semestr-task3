import UserApi from "shared/api/UserApi";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getUsers = createAsyncThunk(
    "users/getUsers",
    async ({query="", role=""}, thunkAPI) => {
        try {
            const response = await UserApi.getUsers(query, role)
            if(!response){
                throw "Не удалось получить пользователей"
            }
            if(response.errors){
                if(Array.isArray(response.data?.detail)){
                    throw response.data?.detail[0]?.msg
                }
                else {
                    throw response.data?.detail
                }
            }
            return response.data.values
        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
