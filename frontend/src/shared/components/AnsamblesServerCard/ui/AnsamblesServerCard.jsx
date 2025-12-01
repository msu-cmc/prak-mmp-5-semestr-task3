import "./AnsamblesServerCard.css"

const AnsamblesServerCard = ({
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

export default AnsamblesServerCard