import {createSlice} from "@reduxjs/toolkit";
import { USER_ID, TOKEN, USER, CURRENT_PATH, RECOVERY_EMAIL } from "shared/consts/localstorage";
import { getLoggedUser } from "../services/getLoggesUser";
import { handlePending } from "shared/lib/handlePending";
import { handleRejected } from "shared/lib/handleRejected";
import { updateLoggedUser } from "../services/updateLoggesUser";
import AkramFitNetwork from "shared/config/httpConfig";

// Проверяем наличие токена при инициализации
const hasToken = () => {
    const token = sessionStorage.getItem(TOKEN);
    return !!token && token.trim() !== "";
};

const initialState = {
    loggedUser: {
        id:-1,
        email:"",
        fio:"",
        workshop:{},
        role:"",
        phone:"",
        password:"",
    },
    loading:false,
    error:null,
    isAuth: hasToken(), // Инициализируем на основе наличия токена
}

export const loggedUserSlice = createSlice({
    name: "loggedUser",
    initialState,
    reducers: {
        setLoggedUser: (state, action) => {
            state.loggedUser = action.payload
        },
        setIsAuth: (state, action) => {
            state.isAuth = action.payload
        },
        initUser: (state, action) => {
            // Проверяем наличие токена
            const token = sessionStorage.getItem(TOKEN);
            if (!token || token.trim() === "") {
                // Если токена нет - выходим
                state.loggedUser = initialState.loggedUser;
                state.isAuth = false;
                return;
            }

            // Если пользователь уже загружен, не делаем повторную загрузку
            if(state.loggedUser && state.loggedUser.id !== -1) return;

            // Пытаемся загрузить пользователя из sessionStorage
            const userData = sessionStorage.getItem(USER);
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user && user.id) {
                        state.loggedUser = user;
                        state.isAuth = true;
                        return;
                    }
                } catch (e) {
                    console.error("Ошибка парсинга данных пользователя:", e);
                }
            }

            // Если в sessionStorage нет USER, но есть USER_ID - загружаем с сервера
            const userId = sessionStorage.getItem(USER_ID);
            if(userId && userId !== "") {
                state.isAuth = true;
                // getLoggedUser будет вызван отдельно через dispatch
            }
        },
        deleteUser: (state, action) => {
            state.users = [...state.users.filter(u => u.id !== action.payload)]
        },
        logout: (state) => {
            // Очищаем все данные из sessionStorage
            sessionStorage.removeItem(TOKEN);
            sessionStorage.removeItem(USER);
            sessionStorage.removeItem(USER_ID);
            sessionStorage.removeItem(CURRENT_PATH);
            sessionStorage.removeItem(RECOVERY_EMAIL);

            // Очищаем токен в Network конфигурации
            AkramFitNetwork.updateToken(null);

            // Сбрасываем состояние пользователя
            state.loggedUser = initialState.loggedUser;
            state.isAuth = false;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getLoggedUser.pending, handlePending)
        .addCase(getLoggedUser.fulfilled, (state, action) => {
            state.loggedUser = action.payload
            state.loading = false;
            state.error = null;
        })
        .addCase(getLoggedUser.rejected, handleRejected)

        .addCase(updateLoggedUser.pending, handlePending)
        .addCase(updateLoggedUser.fulfilled, (state, action) => {
            state.loggedUser = action.payload
            state.loading = false;
            state.error = null;
        })
        .addCase(updateLoggedUser.rejected, handleRejected)
    }
})

export const { actions: loggedUserActions } = loggedUserSlice
export const { reducer: loggedUserReducer } = loggedUserSlice
