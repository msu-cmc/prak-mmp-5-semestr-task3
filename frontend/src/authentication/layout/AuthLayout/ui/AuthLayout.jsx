import "./AuthLayout.css"

import { useEffect } from "react"

import { ReactComponent as Logo }  from "shared/assets/items/favicon.svg"
import { USER, USER_ID } from "shared/consts/localstorage"

const AuthLayout = ({children}) => {
    useEffect(() => {
        localStorage.removeItem(USER_ID)
        localStorage.removeItem(USER)
    }, [])

    return(
        <div className="authlayout">
            <Logo className="logo-auth"/>
            <div className="authlayout-content">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout