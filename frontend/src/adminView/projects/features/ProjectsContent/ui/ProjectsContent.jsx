import "./ProjectsContent.css";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton";
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index";
import { ProjectCard } from "adminView/projects/entities/ProjectCard";
import { ProjectModal } from "adminView/projects/features/ProjectModal";

import {
    returnProjects,
    returnProjectsLoading,
    returnProjectsPageLoading,
    getProjects,
    createProject,
    deleteProject as delProject
} from "states/Projects";

const ProjectsContent = () => {
    const dispatch = useDispatch();

    const projects = useSelector(returnProjects);
    const loading = useSelector(returnProjectsLoading);
    const pageLoading = useSelector(returnProjectsPageLoading);

    const [query, setQuery] = useState("");
    const [show, setShow] = useState(false);
    const [formValue, setFormValue] = useState({});

    useEffect(() => {
        dispatch(getProjects());
    }, [dispatch]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (projects || []).filter(p => {
            const name = (p?.name || "").toLowerCase();
            return q.length === 0 || name.includes(q);
        });
    }, [projects, query]);

    const handleCreate = async (data) => {
        const toastId = toast.loading("Создаём проект…");
        try {
            await dispatch(createProject(data)).unwrap();
            toast.update(
                toastId,
                {
                    render: "Проект успешно создан",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                }
            );
            setShow(false);
            setFormValue({});
        } catch (e) {
            const msg = typeof e === "string" ? e : e?.message || "Не удалось создать проект";
            toast.update(
                toastId,
                {
                    render: msg,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                }
            );
        }
    };

    const deleteProject = (id) => {
        dispatch(delProject(id));
    };

    return (
        <div className="content projects-content">
            <p className="content__title">
                Проекты
            </p>

            <div className="content__main projects-content__controls">
                <AnsamblesServerInput
                    className="projects-content__controls__control--input"
                    placeholder="Поиск по названию"
                    onChange={(e) => setQuery(e.target.value)}
                />
                <AnsamblesServerButton
                    className="projects-content__controls__control--button"
                    text="Добавить"
                    onClick={() => setShow(true)}
                />
            </div>

            <div className="projects-content__body">
                {!pageLoading && !loading && filtered.length === 0 && (
                    <div className="projects-content--nothing">
                        По заданным критериям проекты не найдены
                    </div>
                )}

                {filtered.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onDelete={deleteProject}
                    />
                ))}
            </div>

            <ProjectModal
                loading={loading}
                show={show}
                formData={formValue}
                setFormData={setFormValue}
                submit={handleCreate}
                setShow={setShow}
            />
        </div>
    );
};

export default ProjectsContent;
