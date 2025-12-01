import "./ProjectCard.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as EditIcon } from "shared/assets/items/Edit.svg";
import { ReactComponent as CrossIcon } from "shared/assets/items/x-square.svg";

import { AnsamblesServerCard } from "shared/components/AnsamblesServerCard";
import { AnsamblesServerDeletionModal } from "shared/components/AnsamblesServerDeletionModal";

const ProjectCard = ({ project, onDelete }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        onDelete?.(project.id);
        setIsModalOpen(false);
    };

    const ifcName = project?.ifc_url || "";

    return (
        <AnsamblesServerCard className="project-card">
            <div className="project-card__body" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="project-card__row project-card__row--title">
                    <div className="project-card__title">
                        {project.name}
                    </div>
                </div>

                <div className="project-card__row project-card__row--info">
                    <div className="project-card__info-label">
                        IFC файл:
                    </div>
                    <div className="project-card__info-value">
                        {ifcName}
                    </div>
                </div>
            </div>

            <div className="project-card__actions">
                <EditIcon
                    className="project-card__action-icon project-card__action-icon--edit"
                    onClick={() => setIsModalOpen(true)}
                />
                <CrossIcon
                    className="project-card__action-icon project-card__action-icon--delete"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            <AnsamblesServerDeletionModal
                loading={false}
                show={isModalOpen}
                setShow={setIsModalOpen}
                header="Удаление проекта"
                submit={handleDelete}
            />
        </AnsamblesServerCard>
    );
};

export default ProjectCard;
