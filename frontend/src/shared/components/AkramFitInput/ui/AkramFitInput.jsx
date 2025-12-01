import { Form } from "react-bootstrap";
import { useLayoutEffect, useRef } from "react";
import "./AkramFitInput.css";

const AkramFitInput = ({
    className = "",
    disabled = false,
    value,
    error,
    defaultValue = "",
    onChange,
    onBlur,
    placeholder,
    style,
    type = "text",
    as = "input",
    onKeyUp,
    onKeyDown,
    id,
    multiple = false,
    label = "",
    rows,
    autoResize = false,
    minRows = 1,
    maxRows = 8,
    ...rest
}) => {
    const inputClass = `akramfit-input__form ${className}`.trim();
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (as !== "textarea" || !autoResize || !ref.current) return;
        const el = ref.current;
        el.style.height = "auto";
        const cs = window.getComputedStyle(el);
        const line = parseFloat(cs.lineHeight) || 20;
        const minH = line * Number(minRows || 1);
        const maxH = line * Number(maxRows || 8);
        const next = Math.min(el.scrollHeight, maxH);
        el.style.height = `${Math.max(next, minH)}px`;
        el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
    }, [value, as, autoResize, minRows, maxRows]);

    return (
        <div className="akramfit-input" style={style}>
            {label && <Form.Label className="akramfit-input__label">{label}</Form.Label>}
            <Form.Control
                ref={ref}
                rows={as === "textarea" ? (rows || minRows) : undefined}
                placeholder={placeholder}
                className={inputClass}
                disabled={disabled}
                onKeyDown={onKeyDown}
                {...(value !== undefined ? { value } : { defaultValue })}
                onChange={onChange}
                isInvalid={!disabled && !!error}
                type={type}
                as={as}
                onKeyUp={onKeyUp}
                onBlur={onBlur}
                id={id}
                multiple={multiple}
                {...rest}
            />
            <Form.Control.Feedback type="invalid">
                {!disabled && error}
            </Form.Control.Feedback>
        </div>
    );
};

export default AkramFitInput;
