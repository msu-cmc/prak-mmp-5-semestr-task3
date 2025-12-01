import "./AnsamblesServerRatingScale.css";

export const AnsamblesServerRatingScale = ({setter, value, max = 10, disabled=false, className = ""}) => {
        const points = Array.from({length: max}, (_, i) => i + 1);

        return (
            <div className={`akramfit-rating-scale ${disabled ? "akramfit-rating-scale--disabled" : ""} ${className}`}>
                <div className="akramfit-rating-scale__wrapper">
                    <div className="akramfit-rating-scale__container">
                        <div className="akramfit-rating-scale__lines">
                            {points.map((point, index) => {
                                if (index === points.length - 1) return null;

                                const nextPoint = points[index + 1];
                                const isActive = point <= value;
                                const isNextActive = nextPoint <= value;

                                return (
                                    <div
                                        key={`line-${point}`}
                                        className={`akramfit-rating-scale__line ${isActive && isNextActive ? "akramfit-rating-scale__line--active" : ""}`}
                                        style={{
                                            left: `${(index / (max-1)) * 100}%`,
                                            width: `${(1 / (max-1)) * 100}%`
                                        }}
                                    ></div>
                                );
                            })}
                        </div>

                        <div className="akramfit-rating-scale__points">
                            {points.map((point) => (
                                <div
                                    key={`dot-${point}`}
                                    className={`akramfit-rating-scale__point ${point <= value ? "akramfit-rating-scale__point--active" : ""}`}
                                    onClick={() => {
                                        if(disabled) return;
                                        setter(point);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };