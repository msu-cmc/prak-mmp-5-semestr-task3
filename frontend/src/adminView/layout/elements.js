import { ReactComponent as Group }   from "shared/assets/items/Group.svg"
import { ReactComponent as Home }    from "shared/assets/items/house.svg"
import { ReactComponent as Architecture } from "shared/assets/items/architecture.svg"

import {
    HOME_ROUTE,
    USERS_ROUTE,
    PROJECTS_ROUTE,
} from "shared/consts/paths"

const ELEMENTS = [
    {
        route: HOME_ROUTE,
        Icon: Home,
        label: "Главная",
        tip: "Домашняя страница",
        small_navbar: true,
        big_navbar: true,
    },
    {
        route: PROJECTS_ROUTE,
        Icon: Architecture,
        label: "Проекты",
        tip: "Проекты",
        small_navbar: true,
        big_navbar: false,
    },
    {
        route: USERS_ROUTE,
        Icon: Group,
        label: "Пользователи",
        tip: "Пользователи",
        small_navbar: false,
        big_navbar: false,
    },
]

export default ELEMENTS;
