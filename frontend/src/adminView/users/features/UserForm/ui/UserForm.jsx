import "./UserForm.css"

import { AnsamblesServerSelect } from "shared/components/AnsamblesServerSelect";
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index";
import { ROLES_OPTIONS } from "shared/consts/roles";

const UserForm = ({
    formData,
    setFormData,
    errors,
    setErrors,
    disabled=false,
    type=""
}) => {

    const setField = (field, value) => {
        setFormData({...formData, [field]:value})
        if (errors[field])
            setErrors({...errors, [field]:null})
    }
    
    return (
        <div className="user-form__container">
            <div className="form-user-input-container">
                <AnsamblesServerInput
                    className="input"
                    disabled={disabled}
                    placeholder={"Введите ФИО"}
                    label="Фио"
                    error={errors?.fio}
                    value={formData?.fio}
                    onChange={(e) => setField("fio", e.target.value)}
                />
            </div>
            <div className="form-user-input-container">
                <AnsamblesServerInput
                    disabled={disabled}
                    placeholder={"Введите почту"}
                    label="Почта"
                    error={errors?.email}
                    value={formData?.email}
                    onChange={(e) => setField("email", e.target.value)}
                />
            </div>
            <div className="form-user-input-container">
                <AnsamblesServerSelect 
                    options={ROLES_OPTIONS}
                    onChange={(role) => setField("role", role)}
                    label="Роль"
                    error={errors?.role}
                    disabled={disabled}
                    value={formData?.role || ""}
                    placeholder="Выберите роль"
                />
            </div>
            {type === "edit" &&
                <div className="form-user-input-container">
                    <AnsamblesServerInput
                        disabled={disabled}
                        placeholder={"Введите новый пароль"}
                        label="Пароль"
                        onChange={(e) => setField("password", e.target.value)}
                    />  
                </div>
            }
            {type !== "edit" &&
                <div className="form-user-input-container">
                    <AnsamblesServerInput
                        disabled={disabled}
                        placeholder={"Введите пароль"}
                        label="Пароль"
                        type="password"
                        onChange={(e) => setField("password", e.target.value)}
                    />  
                </div>
            }
        </div>
    );
};

export default UserForm;
