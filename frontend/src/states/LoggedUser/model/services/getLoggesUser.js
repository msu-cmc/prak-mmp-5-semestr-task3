import {createAsyncThunk} from "@reduxjs/toolkit";
import { USER } from "shared/consts/localstorage";
import UserApi from "shared/api/UserApi";


export const getLoggedUser = createAsyncThunk(
    "loggedUser/getLoggedUser",
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
            sessionStorage.setItem(USER, JSON.stringify(response.data))
            // if(response.data.role === "workshopmanager")managerUserActions.initUser(response.data)
            return response.data
        } catch (e) {
            return thunkAPI.rejectWithValue(e)
        }
    }
)
