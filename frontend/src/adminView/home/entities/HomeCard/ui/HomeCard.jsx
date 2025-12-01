import "./HomeCard.css";

import { useNavigate } from "react-router-dom";

import { AkramFitCard } from "shared/components/AkramFitCard";
import { AkramFitDivider } from "shared/components/AkramFitDivider";

export const HomeCard = ({ card, loading = false }) => {
    const navigate = useNavigate();

    return (
        <AkramFitCard
            className="home-card"
            onClick={() => navigate(card.route)}
        >
            <div className="home-card__content">
                <header className="home-card__header">
                    <div className="home-card__title">
                        {card.icon}
                        <span className="home-card__name">
                            {card.name}
                        </span>
                    </div>
                </header>

                <AkramFitDivider className="home-card__divider" />

                <div className="home-card__body">
                    <p className="home-card__text">
                        {card.text}
                    </p>
                </div>
            </div>
        </AkramFitCard>
    );
};

export default HomeCard;