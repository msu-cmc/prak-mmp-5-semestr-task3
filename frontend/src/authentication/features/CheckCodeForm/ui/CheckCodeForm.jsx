import "./CheckCodeForm.css"

import {Form} from "react-bootstrap";
import {useState} from "react";

import { AkramFitButton } from "shared/components/AkramFitButton";
import { AkramFitInput } from "shared/components/AkramFitInput/Index";

const CheckCodeForm = ({onSubmit, error}) => {
    const [formData, setFormData] = useState({code:""})
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const {code} = formData

        const newErrors = {}

        if(!code || code === "")
            newErrors.code = "Поле не должно быть пустым"

        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const formErrors = validateForm()

        if(Object.keys(formErrors).length > 0)
            setErrors(formErrors)
        else
            onSubmit(formData)
    }

    const setField = (field, value) => {
        setFormData({
            ...formData,
            [field]:value
        })
        if (errors[field])
            setErrors({
                ...errors,
                [field]:null
            })
    }

    return (
        <div className="authform-container">
            <h1 className="auth-header">
                Введите код
            </h1>
            {!!error &&
                <div className="error-container">
                    {error}
                </div>
            }
            <Form.Group className="input-group">
                <AkramFitInput
                    placeholder="Введите код"
                    type="number"
                    className="auth-input"
                    value={formData.password}
                    onChange={(e) => setField("code", e.target.value)}
                    error={errors.password}
                    onKeyUp={(e) => {
                        if(e.key.toLowerCase() === "enter")
                            handleSubmit(e)
                    }}
                />
            </Form.Group>
            <AkramFitButton
                className="auth-btn"
                onClick={(e) => handleSubmit(e)}
                text="Продолжить"
            />
        </div>
    );
};

export default CheckCodeForm;