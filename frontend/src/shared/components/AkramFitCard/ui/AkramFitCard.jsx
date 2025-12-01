import "./AkramFitCard.css"

const AkramFitCard = ({
    children,
    style={},
    className = "",
    onClick
}) => {
    return (
        <div
            style={style}
            className={`akramfit-card ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export default AkramFitCard