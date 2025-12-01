import "./BigNavbar.css";

import { ReactComponent as Logo } from "shared/assets/items/favicon.svg";
import { ReactComponent as Exit } from "shared/assets/items/Exit.svg";
import { ReactComponent as Profile } from "shared/assets/items/Profile.svg";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { FIRST_PAGE_ROUTE, USER_ROUTE } from "shared/consts/paths";

import { AkramFitModal } from "shared/components/AkramFitModal";
import { CURRENT_PATH } from "shared/consts/localstorage";

import { closeSidebar } from "states/UI";
import { loggedUserActions } from "states/LoggedUser";

import ELEMENTS from "adminView/layout/elements";
import { ProjectsNavList } from "adminView/projects/entities/ProjectsNavList";

const BigNavbar = ({ user }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);

    const exit = () => {
        // Вызываем экшен logout для очистки всех данных
        dispatch(loggedUserActions.logout());
        // Переходим на главную страницу (корень)
        navigate(FIRST_PAGE_ROUTE);
    };

    const currPath = sessionStorage.getItem(CURRENT_PATH);
    const profilePath = USER_ROUTE.replace(":userId", user?.id || "");

    const go = (to) => () => {
        if (currPath !== to) navigate(to);
    };

    const markActive = (route) =>
        currPath === route ? "navbar__active-style big-navbar__active-style" : "";

    const bigElements = useMemo(
        () => ELEMENTS.filter((e) => e.big_navbar),
        []
    );

    return (
        <>
            <div className="navbar__container big-navbar__container">
                <div className="navbar__icon-group big-navbar__icon-group">
                    <div
                        className="navbar__logo-icon-container big-navbar__logo-icon-container"
                        onClick={() => dispatch(closeSidebar())}
                    >
                        <Logo className="big-navbar__logo" />
                    </div>
                </div>

                <div className="navbar__icon-group big-navbar__icon-group">
                    {bigElements.map(({ route, Icon, label }) => (
                        <div
                            key={route}
                            className="navbar__icon-container big-navbar__icon-container"
                            onClick={go(route)}
                        >
                            <div className={markActive(route)}>
                                <div className="navbar__icon-wrapper big-navbar__icon-wrapper">
                                    <Icon className="navbar__icon big-navbar__icon" />
                                </div>
                                <div className="big-navbar__icon-text-wrapper">
                                    {label}
                                </div>
                            </div>
                        </div>
                    ))}
                    <ProjectsNavList max={5} />
                </div>

                <div className="navbar__icon-group big-navbar__icon-group">
                    <div
                        className="navbar__top-icon-container big-navbar__top-icon-container"
                        onClick={go(profilePath)}
                    >
                        <div className={markActive(profilePath)}>
                            <div className="navbar__icon-wrapper big-navbar__icon-wrapper">
                                <Profile className="navbar__icon big-navbar__icon" />
                            </div>
                            <div className="big-navbar__icon-text-wrapper">
                                Профиль
                            </div>
                        </div>
                    </div>

                    <div
                        className="navbar__top-icon-container big-navbar__top-icon-container"
                        onClick={() => setShow(!show)}
                    >
                        <div>
                            <div className="navbar__icon-wrapper big-navbar__icon-wrapper">
                                <Exit className="navbar__icon big-navbar__icon exit-icon" />
                            </div>
                            <div className="big-navbar__icon-text-wrapper">
                                Выход
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AkramFitModal
                show={show}
                warning="Вы точно хотите выйти?"
                submit={exit}
                setShow={setShow}
            />
        </>
    );
};

export default BigNavbar;
