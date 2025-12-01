import "./AnsamblesServerDatePicker.css";

import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import ru from "date-fns/locale/ru";
registerLocale("ru", ru);

const AnsamblesServerDatePicker = ({
    disabled = false,
    value,
    error,
    onChange,
    placeholder,
    style,
    type = "text",
    as = "input",
    onKeyUp,
    id,
    label = "",
    isClearable = false,
    defaultValue = "",
}) => {
    const [startDate, setStartDate] = useState(isClearable ? "" : value ? value : new Date());

    useEffect(() => {
        setStartDate(value);
    }, [value]);

    return (
        <div
            className="akramfit-date-picker"
            style={{ ...style, display: "flex", flexDirection: "column" }}
        >
            {label !== "" &&
                <Form.Label className="akramfit-date-picker__label">
                    {label}
                </Form.Label>
            }
            <DatePicker
                selected={startDate}
                defaultValue={defaultValue}
                locale="ru"
                onChange={(date) => {
                setStartDate(date);
                onChange(date);
                }}
                dateFormat="dd/MM/yyyy"
                className={`akramfit-date-picker__input ${disabled ? "akramfit-date-picker__input--disabled" : ""}`}
                isInvalid={!disabled && !!error}
                disabled={disabled}
                onKeyUp={onKeyUp}
                id={id}
                placeholderText={placeholder}
                isClearable={isClearable}
            />
            {(!!error || error !== "") && !disabled && (
                <div className="akramfit-date-picker__error">
                    {error}
                </div>
            )}
        </div>
    );
};

export default AnsamblesServerDatePicker;
