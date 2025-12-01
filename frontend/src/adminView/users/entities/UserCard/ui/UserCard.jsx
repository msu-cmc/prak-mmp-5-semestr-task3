import "./UserCard.css";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ReactComponent as EditIcon } from "shared/assets/items/Edit.svg";
import { ReactComponent as CrossIcon } from "shared/assets/items/x-square.svg";

import { AnsamblesServerDeletionModal } from "shared/components/AnsamblesServerDeletionModal";
import { AnsamblesServerCard } from "shared/components/AnsamblesServerCard";
import { ROLES } from "shared/consts/roles";
import { deleteUser } from "states/Users/model/services/deleteUser";
import { returnUsersLoading } from "states/Users";

const UserCard = ({ user }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector(returnUsersLoading);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await dispatch(deleteUser(user.id)).unwrap();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AnsamblesServerCard className="user-card">
            <div className="user-card__body">
                <div className="user-card__row user-card__row--title">
                    <div className="user-card__title">
                        {user.fio}
                    </div>
                </div>

                <div className="user-card__row user-card__row--info">
                    <div className="user-card__info-label">
                        Роль:
                    </div>
                    <div className="user-card__info-value">
                        {ROLES[user.role]}
                    </div>
                </div>

                <div className="user-card__row user-card__row--info">
                    <div className="user-card__info-label">
                        Email:
                    </div>
                    <div className="user-card__info-value">
                        {user.email}
                    </div>
                </div>
            </div>

            <div className="user-card__actions">
                <EditIcon
                    className="user-card__action-icon user-card__action-icon--edit"
                    onClick={() => navigate(`/users/${user.id}`)}
                />
                <CrossIcon
                    className="user-card__action-icon user-card__action-icon--delete"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            <AnsamblesServerDeletionModal
                loading={loading}
                show={isModalOpen}
                setShow={setIsModalOpen}
                header="Удаление пользователя"
                submit={handleDelete}
            />
        </AnsamblesServerCard>
    );
};

export default UserCard;