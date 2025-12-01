import "./HomeContent.css"

import { HomeCard } from "adminView/home/entities/HomeCard"

import { ReactComponent as Architecture } from "shared/assets/items/architecture.svg"

import {
    PROJECTS_ROUTE,
    NEW_PROJECT_ROUTE,
    USERS_ROUTE
} from "shared/consts/paths"

const HomeContent = () => {
    const home_cards = {
        "structure": [
            {
                icon: <Architecture className="home-card__icon"/>,
                name: "AkramFit",
                route: NEW_PROJECT_ROUTE,
                text: "Быстрый старт для нового проекта"
            },
            {
                icon: <Architecture className="home-card__icon"/>,
                name: "Users Management",
                route: USERS_ROUTE,
                text: "Управление пользователями"
            },
            {
                icon: <Architecture className="home-card__icon"/>,
                name: "Projects Management",
                route: PROJECTS_ROUTE,
                text: "Управление проектами"
            },
        ],
    }

    return(
        <div className="content">
            <p className="content__title">
                Главная страница
            </p>
            <div className="content__main">
                <div className="home-content__part">
                    <div className="home-content__part-label">
                        <span className="home-content__part-title">
                            Структура
                        </span>
                    </div>
                    <div className="home-content__part-content">
                        {home_cards.structure.map(card => 
                            <HomeCard
                                key={card.name}
                                card={card}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeContent