import "./AuthForm.css";

import { Form } from "react-bootstrap";

import { AkramFitInput } from "shared/components/AkramFitInput/Index";

const AuthForm = ({
    info,
    formData,
    errors,
    setField,
    handleSubmit,
}) => (
    <Form.Group className="auth-form-group">
        {info.email && (
            <div className="auth-input-container">
                <AkramFitInput
                    id="email-input"
                    className={`auth-input${errors.email? " red-border" : ""}`}
                    placeholder="Почта"
                    value={formData.email}
                    error={errors.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key.toLowerCase() === "enter") {
                            e.currentTarget.blur();
                            document.getElementById("password-input")?.focus();
                        }
                    }}
                />
            </div>
        )}

        {info.password && (
            <div className="auth-input-container">
                <AkramFitInput
                    id="password-input"
                    type="password"
                    className={`auth-input${errors.password ? " red-border" : ""}`}
                    placeholder="Пароль"
                    value={formData.password}
                    error={errors.password}
                    onChange={(e) => setField("password", e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key.toLowerCase() === "enter") {
                            e.currentTarget.blur();
                            handleSubmit(e);
                        }
                    }}
                />
            </div>
        )}
    </Form.Group>
);

export default AuthForm;