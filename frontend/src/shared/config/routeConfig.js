import { AuthenticationPage }   from "authentication/pages/AuthenticationPage";
import { PasswordRecoveryPage } from "authentication/pages/PasswordRecoveryPage";

import { HomePage }             from "adminView/home/pages/HomePage";

import { UserPage }             from "adminView/users/pages/UserPage";
import { UsersPage }            from "adminView/users/pages/UsersPage";

import {
    AUTH_ROUTE,
    HOME_ROUTE,
    RECOVERY_ROUTE,
    USERS_ROUTE,
    USER_ROUTE,
    FIRST_PAGE_ROUTE,
    PROJECTS_ROUTE,
    PROJECT_ROUTE,
    NEW_PROJECT_ROUTE
} from "shared/consts/paths";

import { FirstPage } from "adminView/projects/pages/FirstPage";
import { ProjectsPage } from "adminView/projects/pages/ProjectsPage";
import { ProjectPage } from "adminView/projects/pages/ProjectPage";
import { NewProjectPage } from "adminView/projects/pages/NewProjectPage";

export const routeConfig = [
    {
        path: FIRST_PAGE_ROUTE,
        element: <FirstPage />,
        authOnly: false,  // Публичная страница
        roles: ["admin", "user"],
    },
    {
        path: AUTH_ROUTE,
        element: <AuthenticationPage />,
        authOnly: false,  // Страница авторизации - публичная
        roles: ["admin", "user"],
    },
    {
        path: RECOVERY_ROUTE,
        element: <PasswordRecoveryPage />,
        authOnly: false,  // Страница восстановления пароля - публичная
        roles: ["admin", "user"],
    },
    {
        path: USERS_ROUTE,
        element: <UsersPage />,
        authOnly: true,  // Требует авторизацию
        roles: ["admin"],
    },
    {
        path: USER_ROUTE,
        element: <UserPage />,
        authOnly: true,  // Требует авторизацию
        roles: ["admin", "user"],
    },
    {
        path: HOME_ROUTE,
        element: <HomePage />,
        authOnly: true,  // Требует авторизацию
        roles: ["admin", "user"],
    },
    {
        path: PROJECTS_ROUTE,
        element: <ProjectsPage />,
        authOnly: true,  // Требует авторизацию
        roles: ["admin", "user"],
    },
    {
        path: PROJECT_ROUTE,
        element: <ProjectPage />,
        authOnly: true,  // Требует авторизацию
        roles: ["admin", "user"],
    },
    {
        path: NEW_PROJECT_ROUTE,
        element: <NewProjectPage />,
        authOnly: true,  // Требует авторизацию
        roles: ["admin", "user"],
    },
];
