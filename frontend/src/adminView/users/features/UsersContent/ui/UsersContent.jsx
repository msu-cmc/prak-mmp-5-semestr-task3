import "./UsersContent.css"

import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { UserModal } from "adminView/users/entities/UserModal"
import { UserCard } from "adminView/users/entities/UserCard"
import { UserNothing } from "adminView/users/entities/UserNothing"

import { AnsamblesServerSelect } from "shared/components/AnsamblesServerSelect"
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index"
import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton"
import { ROLES_OPTIONS_WITH_EMPTY } from "shared/consts/roles"

import { getUsers } from "states/Users/model/services/getUsers"
import { addUser } from "states/Users/model/services/addUser"
import { returnUsers } from "states/Users"
import { returnUsersLoading, returnUsersPageLoading } from "states/Users/model/selectors/returnUsers"
import { UserPlaceHolderSecond } from "adminView/users/entities/UserPlaceHolderSecond"

const UsersContent = () => {
    const dispatch = useDispatch()
    const pageLoading = useSelector(returnUsersPageLoading)
    const usersList = useSelector(returnUsers)
    const loading = useSelector(returnUsersLoading)
    const firstUpdate = useRef(true);

    const [value, setValue] = useState({
        fio:"",
        role:"",
        password:"",
        email:""
    })
    const [show, setShow] = useState(false)
    const [query, setQuery] = useState("")
    const [selectedRole, setSelectedRole] = useState("")

    const createUser = async (data) => {
        try {
            dispatch(addUser(data)).unwrap()
            setShow(!show)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }
        const getData = setTimeout(() => {
            dispatch(getUsers({query:query, role:selectedRole}))
        }, 200)

        return () => clearTimeout(getData)
    }, [query])
    
    return (
        <div className="content users-content">
            <p className="content__title">
                Пользователи
            </p>
            <div className="content__main users-content__controls">
                <AnsamblesServerInput
                    className="users-content__controls__control--input"
                    placeholder="Поиск"
                    onChange={(e) => setQuery(e.target.value)}
                />
                <AnsamblesServerSelect
                    className="users-content__controls__control--select"
                    placeholder="Роль"
                    options={ROLES_OPTIONS_WITH_EMPTY}
                    onChange={(role) => {
                        setSelectedRole(role.value)
                        dispatch(getUsers({
                            query:query,
                            role:role.value
                        }))
                    }}
                />
                <AnsamblesServerButton
                    className="users-content__controls__control--button"
                    text="Добавить"
                    onClick={() => setShow(!show)}
                />
            </div>
            <div className="users-content__body">
                {pageLoading?
                    <UserPlaceHolderSecond/>
                : 
                    <>
                        {!usersList || usersList.length === 0 &&
                            <UserNothing
                                query={query}
                                selectedRole={selectedRole}
                            />
                        }
                        {usersList?.map((user) => 
                            <UserCard
                                key={user.id}
                                user={user}
                            />
                        )}
                    </>
                }
            </div>
            <UserModal
                loading={loading}
                show={show}
                formData={value}
                setFormData={setValue}
                submit={createUser}
                setShow={setShow}
            />
        </div>
    )
}

export default UsersContent