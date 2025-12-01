import "./SmallNavbar.css";

import { ReactComponent as Logo } from "shared/assets/items/favicon.svg";
import { ReactComponent as Exit } from "shared/assets/items/Exit.svg";
import { ReactComponent as Profile } from "shared/assets/items/Profile.svg";

import { useState } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";

import {
    FIRST_PAGE_ROUTE,
    USERS_ROUTE,
    USER_ROUTE,
} from "shared/consts/paths";

import { AnsamblesServerModal } from "shared/components/AnsamblesServerModal";
import { CURRENT_PATH, USER } from "shared/consts/localstorage";

import ELEMENTS from "adminView/layout/elements";

import { openSidebar } from "states/UI";
import { loggedUserActions } from "states/LoggedUser";

const SmallNavbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);

    const exit = () => {
        dispatch(loggedUserActions.logout());
        navigate(FIRST_PAGE_ROUTE);
    };

    const currPath = sessionStorage.getItem(CURRENT_PATH) ?? USERS_ROUTE;
    const user = JSON.parse(sessionStorage.getItem(USER) || "{}");

    const profilePath = USER_ROUTE.replace(":userId", user?.id || "");

    const markActive = (route) => (route === currPath ? "navbar__active-style" : "");

    const go = (to) => () => {
        if (currPath !== to) navigate(to);
    };

    return (
        <>
            <div className={"navbar__container small-navbar__container"}>
                <div className={"navbar__icon-group small-navbar__icon-group"}>
                    <div
                        className="navbar__logo-icon-container small-navbar__logo-icon-container"
                        onClick={() => dispatch(openSidebar())}
                    >
                        <Logo className={"navbar__icon small-navbar__icon-logo"} />
                    </div>
                </div>

                <div className={"navbar__icon-group small-navbar__icon-group"}>
                    {ELEMENTS.filter((e) => e.small_navbar).map(({ route, Icon, tip, label }) => (
                        <React.Fragment key={route}>
                            <div
                                className={`navbar__icon-container small-navbar__icon-container ${markActive(route)} small-navbar__active-style`}
                                data-tooltip-id={`tooltip-${route}`}
                                data-tooltip-content={tip || label}
                                data-tooltip-place="right"
                                onClick={go(route)}
                            >
                                <Icon className="navbar__icon small-navbar__icon" />
                            </div>
                            <Tooltip id={`tooltip-${route}`} className="small-navbar__tooltip" />
                        </React.Fragment>
                    ))}
                </div>

                <div className={"navbar__icon-group small-navbar__icon-group"}>
                    <div
                        className={`navbar__icon-container small-navbar__icon-container ${markActive(profilePath)} small-navbar__active-style`}
                        data-tooltip-id="tooltip-profile"
                        data-tooltip-content="Профиль"
                        data-tooltip-place="right"
                        onClick={go(profilePath)}
                    >
                        <Profile className={"navbar__icon small-navbar__icon"} />
                    </div>

                    <Tooltip id="tooltip-profile" className={"small-navbar__tooltip"} />

                    <div
                        className="navbar__top-icon-container small-navbar__top-icon-container"
                        onClick={() => {
                            setShow(!show);
                        }}
                    >
                        <Exit className={"navbar__icon small-navbar__icon exit-icon"} />
                    </div>
                </div>
            </div>

            <AnsamblesServerModal
                show={show}
                warning="Вы точно хотите выйти?"
                submit={exit}
                setShow={setShow}
            />
        </>
    );
};

export default SmallNavbar;
