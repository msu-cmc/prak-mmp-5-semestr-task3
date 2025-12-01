import "./TopNavbar.css";

import { ReactComponent as Logo } from "shared/assets/items/favicon.svg";
import { useNavigate } from "react-router-dom";
import { AUTH_ROUTE } from "shared/consts/paths";
import { AkramFitButton } from "shared/components/AkramFitButton";

const TopNavbar = ({ onUploadClick }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate(AUTH_ROUTE);
    };

    const handleRegister = () => {
        navigate(AUTH_ROUTE);
    };

    const handleUpload = () => {
        if (onUploadClick) {
            onUploadClick();
        }
    };

    return (
        <div className="top-navbar">
            <div className="top-navbar__left">
                <Logo className="top-navbar__logo" />
            </div>
            {onUploadClick && (
                <div className="top-navbar__center">
                    <AkramFitButton
                        className="top-navbar__btn top-navbar__btn--upload"
                        onClick={handleUpload}
                        text="Загрузите модель"
                    />
                </div>
            )}
            <div className="top-navbar__right">
                <AkramFitButton
                    className="top-navbar__btn top-navbar__btn--login"
                    onClick={handleLogin}
                    text="Войти"
                />
                <AkramFitButton
                    className="top-navbar__btn top-navbar__btn--register"
                    onClick={handleRegister}
                    text="Зарегистрироваться"
                />
            </div>
        </div>
    );
};

export default TopNavbar;
