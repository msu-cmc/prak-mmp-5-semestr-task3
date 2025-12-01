import { RESET_STORE } from "./resetActions";

import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { usersReducer } from "states/Users";
import { loggedUserReducer } from "states/LoggedUser";
import { uiReducer } from "states/UI";
import { projectsReducer } from "states/Projects";
import { chatsReducer } from "states/Сhats";
import { messagesReducer } from "states/Messages";

const appReducer = combineReducers({
    loggedUser: loggedUserReducer,
    users: usersReducer,
    ui: uiReducer,
    projects: projectsReducer,
    chats: chatsReducer,
    messages: messagesReducer,
});

const rootReducer = (state, action) => {
    if (action.type === RESET_STORE)
        state = undefined;
    return appReducer(state, action);
};

export function createReduxStore() {
    return configureStore({
        reducer: rootReducer,
    });
}
