import "./AuthenticationPage.css";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { loggedUserActions } from "states/LoggedUser";

import { AuthLayout } from "authentication/layout/AuthLayout";
import { AuthenticationForm } from "authentication/features/AuthenticationForm";

import { IntroPostcard } from "authentication/features/IntroPostcard";
import frontSvg from "shared/assets/items/favicon.svg";

import AuthApi from "shared/api/AuthApi";
import AkramFitNetwork from "shared/config/httpConfig";
import { CURRENT_PATH, USER, USER_ID } from "shared/consts/localstorage";
import UserApi from "shared/api/UserApi";
import { HOME_ROUTE, RECOVERY_ROUTE } from "shared/consts/paths";

const AuthenticationPage = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    sessionStorage.setItem(CURRENT_PATH, location.pathname);

    const info = {
        header: "Вход",
        action: "Войти",
        email: true,
        password: true
    };

    const auth = async (val) => {
        setLoading(true);
        try {
            const res = await AuthApi.login(val.email, val.password);
            if (!res || res.errors) {
                setError("Неверная почта или пароль");
                return;
            }
            setError("");

            // ВАЖНО: Сначала сохраняем токен, ПОТОМ устанавливаем isAuth
            AkramFitNetwork.updateToken(res.data.access_token);
            sessionStorage.setItem(USER_ID, res.data.id);

            const response = await UserApi.getUser(res.data.id);
            if (!response) {
                // Откатываем изменения при ошибке
                AkramFitNetwork.updateToken(null);
                sessionStorage.removeItem(USER_ID);
                toast.error("Не удалось получить пользователя");
                return;
            }
            if (response.errors) {
                // Откатываем изменения при ошибке
                AkramFitNetwork.updateToken(null);
                sessionStorage.removeItem(USER_ID);
                const msg = Array.isArray(response.data?.detail) ? response.data.detail[0]?.msg : response.data.detail;
                toast.error(msg);
                return;
            }

            // Только после успешной загрузки пользователя устанавливаем всё
            dispatch(loggedUserActions.setLoggedUser(response.data));
            sessionStorage.setItem(USER, JSON.stringify(response.data));
            dispatch(loggedUserActions.setIsAuth(true));
            navigate(HOME_ROUTE);
        } catch (e) {
            // Откатываем изменения при любой ошибке
            AkramFitNetwork.updateToken(null);
            sessionStorage.removeItem(USER_ID);
            toast.error("Ошибка сервера. Попробуйте позже");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showIntro && (
                <IntroPostcard
                    src={frontSvg}
                    onDone={() => setShowIntro(false)}
                    fadeMs={700}
                    revealMs={1200}
                    holdMs={300}
                    exitMs={220}
                />
            )}
            <AuthLayout>
                <AuthenticationForm
                    info={info}
                    onSubmit={auth}
                    error={error}
                    loading={loading}
                />
                <Link
                    className="changepass-link"
                    to={RECOVERY_ROUTE}
                >
                    Сменить пароль
                </Link>
            </AuthLayout>
        </>
    );
};

export default AuthenticationPage;
