import "./Layout.css";
import "./Navbar.css";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SmallNavbar } from "adminView/layout/SmallNavbar";
import { BigNavbar } from "adminView/layout/BigNavbar";
import { TopNavbar } from "adminView/layout/TopNavbar";

import { USER } from "shared/consts/localstorage";

import { loggedUserActions, returnLoggedUser } from "states/LoggedUser";
import { getAuthFlag } from "states/LoggedUser/model/selectors/getAuthFlag";
import { returnSidebarOpen } from "states/UI";

const Layout = ({ children, onUploadClick }) => {
    const isOpen = useSelector(returnSidebarOpen);
    const loggedUser = useSelector(returnLoggedUser);
    const isAuthenticated = useSelector(getAuthFlag);
    const dispatch = useDispatch();

    useEffect(() => {
        // Инициализируем пользователя при монтировании
        dispatch(loggedUserActions.initUser());
    }, [dispatch]);

    if (!isAuthenticated) {
        return (
            <div className="layout layout--top">
                <TopNavbar onUploadClick={onUploadClick} />
                <div className="layout__children layout__children--full">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="layout">
            <div
                className={`
                    layout__sidebar
                    ${isOpen ? "sidebar--open" : "sidebar--close"}
                `}
            >
                {isOpen ? <BigNavbar user={loggedUser} /> : <SmallNavbar />}
            </div>
            <div
                className={`
                    layout__children
                    ${isOpen ? "children--open" : "children--close"}
                `}
            >
                {children}
            </div>
        </div>
    );
};

export default Layout;
