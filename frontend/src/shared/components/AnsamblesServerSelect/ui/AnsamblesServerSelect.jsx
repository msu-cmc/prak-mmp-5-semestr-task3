import "./AnsamblesServerSelect.css"

import Select from "react-select"
import { Form } from "react-bootstrap"

const AnsamblesServerSelect = ({
    className="",
    options,
    isMulti = false,
    isSearchable = false,
    error,
    onInputChange,
    value,
    defaultValue = "",
    disabled = false,
    onChange,
    label = "",
    placeholder = "Выберите"
}) => {
    return (
        <div className={`akramfit-select ${className}`.trim()}>
            {label &&
                <Form.Label className="akramfit-select__label">
                    {label}
                </Form.Label>
            }
            <Select
                className="akramfit-select__control-wrapper"
                classNamePrefix="akramfit-select"
                isMulti={isMulti}
                placeholder={placeholder}
                value={value}
                isSearchable={isSearchable}
                isDisabled={disabled}
                defaultValue={defaultValue}
                onChange={onChange}
                onInputChange={onInputChange}
                options={options}
            />
            {error &&
                <div className="akramfit-select__error">
                    {error}
                </div>
            }
        </div>
    )
}

export default AnsamblesServerSelect