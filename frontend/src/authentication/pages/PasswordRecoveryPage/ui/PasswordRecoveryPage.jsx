import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthLayout } from "authentication/layout/AuthLayout";
import { AuthenticationForm } from "authentication/features/AuthenticationForm";
import { CheckCodeForm } from "authentication/features/CheckCodeForm";

import AuthApi from "shared/api/AuthApi";
import { CURRENT_PATH, RECOVERY_EMAIL } from "shared/consts/localstorage";
import { AUTH_ROUTE, CHANGE_PASSWORD_ROUTE } from "shared/consts/paths";

const PasswordRecoveryPage = () => {
    const navigate = useNavigate()
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState("")
    const location = useLocation();
    sessionStorage.setItem(CURRENT_PATH, location.pathname);
    
    const info = {
        header:"Восстановить пароль",
        action:"Получить пароль", 
        email:true,
        password:false
    }
    const codeInfo = {
        header:"Введите код",
        action:"Продолжить", 
        email:false,
        password:true,
    }
    const getPassword = (val) => {
        AuthApi.sendCode(val.email).then((res) => {
            if(!res || res.errors){
                if(!res)
                    toast.error("Что-то пошло не так")
                else
                    if(Array.isArray(res.data?.detail))
                        toast.error(res.data?.detail[0]?.msg)
                    else
                        toast.error(res.data?.detail)
                return
            }
            toast.success("Код успешно отправлен")
            setError("")
            setIsSent(true)
            localStorage.setItem(RECOVERY_EMAIL, val.email)
        })
    }

    const checkCode = (val) => {
        AuthApi.checkCode(localStorage.getItem(RECOVERY_EMAIL), val.code).then((res) => {
            if(!res || res.errors){
                if(!res)
                    toast.error("Что-то пошло не так")
                else
                    if(Array.isArray(res.data?.detail))
                        toast.error(res.data?.detail[0]?.msg)
                else
                    toast.error(res.data?.detail)
                return
            }
            navigate(CHANGE_PASSWORD_ROUTE)
        })
    }

    return (
        <AuthLayout>
            {!isSent? 
                <>
                    <AuthenticationForm
                        info={info}
                        error={error}
                        onSubmit={getPassword}
                    />
                    <Link
                        className="changepass-link"
                        to={AUTH_ROUTE}
                    >
                        Обратно ко входу
                    </Link>
                </>
            :
                <CheckCodeForm
                    error={error}
                    onSubmit={checkCode}
                />
            }
        </AuthLayout>
    );
};

export default PasswordRecoveryPage;
