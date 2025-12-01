import "./AuthenticationForm.css";

import { useState } from "react";
import { Spinner } from "react-bootstrap";

import { AkramFitButton } from "shared/components/AkramFitButton";

import { AuthForm } from "authentication/entities/AuthForm";

const AuthenticationForm = ({ info, onSubmit, error, loading }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const { email } = formData;
        const newErrors = {};

        if (info.email) {
        if (!email)
            newErrors.email = "Поле не должно быть пустым";
        else if (!/\S+@\S+\.\S+/.test(email))
            newErrors.email = "Неверный формат почты";
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
        } else {
            onSubmit(formData);
        }
    };

    const setField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field])
            setErrors({ ...errors, [field]: null });
    };

    return (
        <div className="authform-container">
            <h1 className="auth-header">
                {info.header}
            </h1>

            {!!error && 
                <div className="error-container">
                    {error}
                </div>
            }

            <AuthForm
                info={info}
                formData={formData}
                errors={errors}
                setField={setField}
                handleSubmit={handleSubmit}
            />

            <AkramFitButton
                className="auth-btn"
                onClick={handleSubmit}
                text={info.action}
                loading={loading}
            />
        </div>
    );
};

export default AuthenticationForm;
