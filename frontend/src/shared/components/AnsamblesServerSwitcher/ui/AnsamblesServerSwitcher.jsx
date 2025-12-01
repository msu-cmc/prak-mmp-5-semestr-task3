import React from "react";
import "./AnsamblesServerSwitcher.css";

export const AnsamblesServerSwitcher = ({
    checked,
    onChange,
    leftLabel = "",
    rightLabel = "",
    disabled = false,
    size = "sm",
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
                "akramfit-switcher",
                `akramfit-switcher--${size}`,
                disabled ? "akramfit-switcher--disabled" : "",
                className
            ].join(" ").trim()}
        >
            {leftLabel && (
                <span className={`akramfit-switcher__label ${!checked ? "akramfit-switcher__label--active" : ""}`}>
                    {leftLabel}
                </span>
            )}

            <input
                type="checkbox"
                className="akramfit-switcher__input"
                checked={!!checked}
                onChange={handleChange}
                disabled={disabled}
                aria-label={ariaLabel}
            />

            <span className="akramfit-switcher__track" />

            {rightLabel && (
                <span className={`akramfit-switcher__label ${checked ? "akramfit-switcher__label--active" : ""}`}>
                    {rightLabel}
                </span>
            )}
        </label>
    );
};

export default AnsamblesServerSwitcher;
