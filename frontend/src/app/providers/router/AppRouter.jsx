import { memo, Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import { FIRST_PAGE_ROUTE, NEW_PROJECT_ROUTE } from "shared/consts/paths";
import { routeConfig } from "shared/config/routeConfig";
import { CURRENT_PATH, USER } from "shared/consts/localstorage";
import { AnsamblesServerLoader } from "shared/components/AnsamblesServerLoader";

import { loggedUserActions, returnLoggedUser } from "states/LoggedUser";

const AppRouter = memo(() => {
    const dispatch = useDispatch()
    const loggedUser = useSelector(returnLoggedUser);

    const user = JSON.parse(sessionStorage.getItem(USER));
    const isLoggedIn = !!user && user.id;
    const defaultPath = isLoggedIn ? NEW_PROJECT_ROUTE : FIRST_PAGE_ROUTE;
    const currPath = sessionStorage.getItem(CURRENT_PATH) ?? defaultPath;

    const [loaded, setLoaded] = useState()

    const routes = useMemo(() => Object.values(routeConfig).filter((route) => {
        const user = JSON.parse(sessionStorage.getItem(USER))

        if ((!user || !user.id) && route.authOnly)
            return false
        if(!route.authOnly)
            return true
        if(!(route.roles.some(str => str.includes(user.role)) && route.authOnly) && route.authOnly)
            return false
        if ((!loggedUser || loggedUser.id === -1) && loaded)
            dispatch(loggedUserActions.setLoggedUser(user))
        return true
    }), [loggedUser])

    useEffect(() => {
        setLoaded(true)
    }, [])
    
    const elem = (eq) => (
        <Suspense
            fallback={
                <div
                    style={{
                        height:"100%",
                        width:"100%",
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center"
                    }}
                >
                    <AnsamblesServerLoader/>
                </div>
            }
        >
            {eq}
        </Suspense>
    )

    return (
        <Routes>
            {routes.map(({ path, element }) => (
                <Route
                    key={path}
                    path={path}
                    element={elem(element)}
                />
            ))}
            <Route
                path="*"
                element={
                    <Navigate
                        to={!!loggedUser && (loggedUser.id !== -1)? currPath : FIRST_PAGE_ROUTE}
                    />
                }
            />
        </Routes>
    );
});

export default AppRouter;
