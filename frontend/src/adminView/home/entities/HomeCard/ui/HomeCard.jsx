import "./HomeCard.css";

import { useNavigate } from "react-router-dom";

import { AnsamblesServerCard } from "shared/components/AnsamblesServerCard";
import { AnsamblesServerDivider } from "shared/components/AnsamblesServerDivider";

export const HomeCard = ({ card, loading = false }) => {
    const navigate = useNavigate();

    return (
        <AnsamblesServerCard
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

                <AnsamblesServerDivider className="home-card__divider" />

                <div className="home-card__body">
                    <p className="home-card__text">
                        {card.text}
                    </p>
                </div>
            </div>
        </AnsamblesServerCard>
    );
};

export default HomeCard;