import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useLocation } from "react-router-dom"

import { Layout } from "adminView/layout/Layout"
import { UsersContent } from "adminView/users/features/UsersContent"

import { CURRENT_PATH } from "shared/consts/localstorage"

import { getUsers } from "states/Users/model/services/getUsers"

const UsersPage = () => {
    const dispatch = useDispatch()
    const location = useLocation();

    sessionStorage.setItem(CURRENT_PATH, location.pathname);
    
    useEffect(() => {
        dispatch(getUsers({}))
    }, [])

    return (
        <Layout style={{overflow:"hidden"}}>
            <UsersContent/>
        </Layout>
    )
}

export default UsersPage