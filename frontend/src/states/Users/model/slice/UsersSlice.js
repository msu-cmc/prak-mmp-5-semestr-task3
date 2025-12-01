import {createEntityAdapter, createSlice} from "@reduxjs/toolkit";
import { addUser } from "../services/addUser";
import { getUsers } from "../services/getUsers";
import { deleteUser } from "../services/deleteUser";
import { handlePagePending } from "shared/lib/handlePagePending";
import { handlePageRejected } from "shared/lib/handlePageRejected";
import { handleRejected } from "shared/lib/handleRejected";
import { handlePending } from "shared/lib/handlePending";
import { getUser } from "../services/getUser";
import { updateUser } from "../services/updateUser";

const initialState = {
    currentUser: {
        id:-1,
        email:"",
        fio:"",
        role:"",
        password:"",
    },
    users: [],
    loading:false,
    error:null,
    pageLoading: false,
}

export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setUsers: (state, action) => {
            state.users = [...action.payload]
        },
        deleteUser: (state, action) => {
            state.users = [...state.users.filter(u => u.id !== action.payload.id)]
        },
        addUser: (state, action) => {
            state.users = [...state.users, action.payload]
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(addUser.pending, handlePending)
        .addCase(addUser.fulfilled, (state, action) => {
            state.users = [...state.users, action.payload]
            state.loading = false;
            state.error = null;
        })
        .addCase(addUser.rejected, handleRejected)

        .addCase(getUsers.pending, handlePagePending)
        .addCase(getUsers.fulfilled, (state, action) => {
            state.users = [...action.payload]
            state.pageLoading = false;
            state.error = null;
        })
        .addCase(getUsers.rejected, handlePageRejected)

        .addCase(getUser.pending, handlePagePending)
        .addCase(getUser.fulfilled, (state, action) => {
            state.currentUser = action.payload
            state.pageLoading = false;
            state.error = null;
        })
        .addCase(getUser.rejected, handlePageRejected)

        .addCase(updateUser.pending, handlePagePending)
        .addCase(updateUser.fulfilled, (state, action) => {
            state.currentUser = action.payload
            state.users = state.users.map(u => u.id === action.payload.id? action.payload : u)
            state.pageLoading = false;
            state.error = null;
        })
        .addCase(updateUser.rejected, handlePageRejected)

        .addCase(deleteUser.pending, handlePending)
        .addCase(deleteUser.fulfilled, (state, action) => {
            state.users = [...state.users.filter(u => u.id !== action.payload)]
            state.loading = false;
            state.error = null;
        })
        .addCase(deleteUser.rejected, handleRejected);
    }
})

export const { actions: usersActions } = usersSlice
export const { reducer: usersReducer } = usersSlice
