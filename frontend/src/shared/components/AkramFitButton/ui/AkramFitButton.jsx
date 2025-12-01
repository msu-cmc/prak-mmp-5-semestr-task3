import { useRef } from "react";
import "./AkramFitButton.css";

const AkramFitButton = ({
    className = "",
    text,
    children,
    onClick,
    loading = false,
    disabled = false,
    style = {},
    ...rest
}) => {
    const ref = useRef();
    const isDisabled = disabled || loading;

    return (
        <button
            className={`akramfit-button ${className}`}
            ref={ref}
            disabled={isDisabled}
            onClick={onClick}
            style={style}
            onTouchStart={() => ref.current?.classList.add("akramfit-button--mobile-active")}
            onTouchEnd={() => ref.current?.classList.remove("akramfit-button--mobile-active")}
            {...rest}
        >
            {loading ? <div className="akramfit-button__loader" /> : (children ?? text)}
        </button>
    );
};

export default AkramFitButton;
