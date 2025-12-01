import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

import { Layout } from "adminView/layout/Layout"
import { UserInfo } from "adminView/users/features/UserInfo"

import { CURRENT_PATH } from "shared/consts/localstorage";

import { getUser } from "states/Users/model/services/getUser";

const UserPage = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const {userId} = useParams();

    sessionStorage.setItem(CURRENT_PATH, location.pathname);

    useEffect(() => {
        dispatch(getUser(userId))
    }, [])
    
    return (
        <Layout>
            <UserInfo label="Профиль"/>
        </Layout>
    )
}

export default UserPage