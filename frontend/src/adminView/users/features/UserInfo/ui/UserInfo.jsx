import "./UserInfo.css"

import { UserForm } from "adminView/users/features/UserForm"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import { USERS_ROUTE } from "shared/consts/paths"
import { AnsamblesServerDeletionModal } from "shared/components/AnsamblesServerDeletionModal"
import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton"
import { ROLES_OPTIONS } from "shared/consts/roles"
import { UserPlaceHolderSecond } from "adminView/users/entities/UserPlaceHolderSecond"

import { updateUser } from "states/Users/model/services/updateUser"
import { deleteUser } from "states/Users/model/services/deleteUser"
import { returnCurrentUser, returnUsersLoading } from "states/Users"

const UserInfo = ({label}) => {
    const dispatch = useDispatch()
    const user = useSelector(returnCurrentUser)
    const pageLoading = useSelector(returnUsersLoading)
    const loading = useSelector(returnUsersLoading)
    const navigate = useNavigate()

    const [errors, setErrors] = useState({})
    const [deleteShow, setDeleteShow] = useState(false)
    const [show, setShow] = useState(false)
    const [formData, setFormData] = useState({})
    const [edit, setEdit] = useState(false)
    const { userId } = useParams()

    const isFioValid = (fio) => {
        return /^[A-Za-zА-Яа-я\s]+$/.test(fio);
    }

    const validateForm = () => {
        const {email, fio, role, password} = formData

        const newErrors = {}

        if(!email || email === "")
            newErrors.email = "Поле не должно быть пустым"
        else 
            if (!/\S+@\S+\.\S+/.test(email))
                newErrors.email = "Неверный формат почты"

        if (password && (password.length < 5 || password.length > 50)) {
            newErrors.password = "Пароль должен быть от 5 до 50 символов";
        }
        if(!fio || fio === "")
            newErrors.fio = "Поле не должно быть пустым"
        else 
            if(!isFioValid (fio))
                newErrors.fio = "В ФИО должны быть только буквы и пробелы"
        if(!role || role === "" || !role.value || role.value === "")
            newErrors.role = "Поле не должно быть пустым"

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        const formErrors = validateForm()

        if(Object.keys(formErrors).length > 0)
            setErrors(formErrors)
        else{
            const data = {
                id:formData.id,
                fio:formData?.fio?.trim(),
                email:formData?.email?.trim(),
                role: formData.role?formData.role.value:null
            }
            if (formData.password) {
                data.password = formData.password;
            }
            try {
                await dispatch(updateUser(data)).unwrap()
                setEdit(!edit)            
                setErrors({})
            } catch (e) {
                console.log(e)
            }
        }
    }
    
    const onDelete = async () => {
        try{
            await dispatch(deleteUser(userId)).unwrap()
            setShow(!show)
            navigate(USERS_ROUTE)
        }catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        if(!pageLoading)
            setFormData({
                ...user,
                role:ROLES_OPTIONS.find(r => r.value===user.role)
            })
    }, [edit])

    return(
        <div className="content user-content">
            <div className="content__title user-content__title">
                {label}
            </div>
            {!edit? 
                <div className="user-content__container">
                    {pageLoading ?
                        <UserPlaceHolderSecond/>
                    :
                        <UserForm
                            key="1"
                            formData={{
                                ...user,
                                role:ROLES_OPTIONS.find(r => r.value===user.role)
                            }}
                            setFormData={setFormData}
                            disabled={true}
                            type="edit"
                        />
                    }
                    <div className="user-info-btn-container">
                        <AnsamblesServerButton
                            onClick={() => setEdit(!edit)}
                            text="Редактировать"
                        />                
                        <AnsamblesServerButton
                            loading={loading}
                            style={{width: "43%"}}
                            onClick={() => setDeleteShow(!deleteShow)}
                            text="Удалить"
                        />
                    </div>
                    <AnsamblesServerDeletionModal
                        show={deleteShow}
                        setShow={setDeleteShow}
                        submit={onDelete}
                    />
                </div>
                :
                <div className="user-content__container">
                    {pageLoading ?
                        <UserPlaceHolderSecond/>
                    :
                        <UserForm
                            key="2"
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            setErrors={setErrors}
                            type="edit"
                        />
                    }
                    <div className="user-info-btn-container">
                        <AnsamblesServerButton
                            onClick={() => setEdit(!edit)}
                            text="Отменить"
                        />                
                        <AnsamblesServerButton
                            loading={loading}
                            onClick={(e) => handleSubmit(e)}
                            style={{width: "43%"}}
                            text="Сохранить"
                        />
                    </div>
                </div>
            }
            <AnsamblesServerDeletionModal
                show={show}
                setShow={setShow}
                header="Удаление пользователя"
                submit={deleteUser}
            />
        </div>
    )
}

export default UserInfo