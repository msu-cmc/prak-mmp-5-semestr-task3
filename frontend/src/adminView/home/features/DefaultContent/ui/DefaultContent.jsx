import "./DefaultContent.css"

import { HomeCard } from "adminView/home/entities/HomeCard"

import { ReactComponent as Architecture } from "shared/assets/items/architecture.svg"

import {
    PROJECTS_ROUTE,
} from "shared/consts/paths"

const DefaultContent = () => {
    const home_cards = {
        "structure": [
            {
                icon: <Architecture className="home-card__icon"/>,
                name: "AkramFit",
                route: PROJECTS_ROUTE,
                text: "Список и управление проектами"
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
};

export default DefaultContent;