import "./UserModal.css"

import { Modal } from "react-bootstrap"
import { useEffect, useState } from "react"

import { AkramFitButton } from "shared/components/AkramFitButton"

import { UserForm } from "adminView/users/features/UserForm"

const UserModal = ({show, setShow, formData, loading=false, setFormData, submit}) => {
    const [errors, setErrors] = useState({})

    const isPhoneValid = (phoneNumber) => {
        return /^\+7[0-9]{10}$/.test(phoneNumber) ||  /^8[0-9]{10}$/.test(phoneNumber)
    }
    
    const isFioValid = (fio) => {
        return /^[A-Za-zА-Яа-яёЁ\s]+$/.test(fio);
    };

    const validateForm = () => {

        const {email, password, fio, role} = formData

        const newErrors = {}

        if (!email || email === "")
            newErrors.email = "Поле не должно быть пустым"
        else
            if (!/\S+@\S+\.\S+/.test(email))
                newErrors.email = "Неверный формат почты"

        if (!password || password === "")
            newErrors.password="Поле не должно быть пустым"

        if (!fio || fio === "")
            newErrors.fio = "Поле не должно быть пустым"
        else
            if(!isFioValid (fio))
                newErrors.fio = "В ФИО должны быть только буквы и пробелы"

        if (!role || role === "" || !role.value || role.value === "")
            newErrors.role = "Поле не должно быть пустым"

        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const formErrors = validateForm()

        console.log(formErrors)
        
        if (Object.keys(formErrors).length > 0)
            setErrors(formErrors)
        else {
            const data = {
                ...formData, 
                fio:formData?.fio?.trim(),
                email:formData?.email?.trim(),
                password:formData?.password?.trim(),
                role: formData.role?formData.role.value:null
            }
            submit(data)
        }
    }

    useEffect(() => {
        setFormData({})
        setErrors({})
    }, [show])

    return(
        <Modal 
            show={show}
            onHide={() => setShow(!show)}
            centered
            keyboard={false}
            dialogClassName="my-user-modal"
            contentClassName="my-user-modal-content"
            backdropClassName="my-user-modal-backdrop"
        >
            <Modal.Header style={{}}>
                <h1 
                    className="user-header"
                    style={{
                        width: "100%", 
                        textAlign: "center", 
                        paddingBottom: "0px",
                        marginTop: "10px",
                        color: "var(--red-color)",
                        fontWeight: "bold",
                        fontFamily: "Main"
                }}>
                    Добавить пользователя
                </h1>
            </Modal.Header>
            <Modal.Body
                className="my-modal-body-side-padding"
                style={{paddingTop:"20px", paddingBottom:"30px"}}
            >
                <UserForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                />
            </Modal.Body>
            <Modal.Footer className="modal-2-btn-footer">
                <AkramFitButton
                    style={{flex:"1"}}
                    onClick={() => setShow(!show)}
                    text="Отмена"
                />                
                <AkramFitButton
                    loading={loading}
                    style={{flex:"1"}}
                    onClick={(e) => handleSubmit(e)}
                    text="Добавить"
                />
            </Modal.Footer>
        </Modal>
    )
}

export default UserModal