import React from "react";
import "./AkramFitToggle.css";

export const AkramFitToggle = ({
    checked,
    onChange,
    label = "",
    labelPosition = "left",          // "left" | "right"
    disabled = false,
    size = "md",                     // "sm" | "md" | "lg"
    id,
    name,
    className = "",
    ariaLabel
}) => {
    const handleChange = (e) => {
        if (disabled) return;
        onChange?.(e.target.checked);
    };

    return (
        <label
            className={[
                "akramfit-toggle",
                `akramfit-toggle--${size}`,
                disabled ? "akramfit-toggle--disabled" : "",
                className
            ].join(" ").trim()}
        >
            {label && labelPosition === "left" && (
                <span className="akramfit-toggle__label">
                    {label}
                </span>
            )}

            <input
                id={id}
                name={name}
                type="checkbox"
                className="akramfit-toggle__input"
                checked={!!checked}
                onChange={handleChange}
                disabled={disabled}
                aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
            />

            <span className="akramfit-toggle__track" />

            {label && labelPosition === "right" && (
                <span className="akramfit-toggle__label">
                    {label}
                </span>
            )}
        </label>
    );
};

export default AkramFitToggle;
