import "./ProjectsNavList.css";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { returnProjects, returnProjectsLoading, getProjects, createProject } from "states/Projects";
import { PROJECTS_ROUTE, PROJECT_ROUTE } from "shared/consts/paths";
import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton";
import { ProjectModal } from "adminView/projects/features/ProjectModal";

export const ProjectsNavList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const projects = useSelector(returnProjects);
    const loading = useSelector(returnProjectsLoading);

    const [show, setShow] = useState(false);
    const [formValue, setFormValue] = useState({});

    const currentProjectId = useMemo(() => {
        const match = location.pathname.match(/\/projects\/(\d+)/);
        return match ? match[1] : null;
    }, [location.pathname]);

    useEffect(() => {
        if (!projects || projects.length === 0)
            dispatch(getProjects());
    }, [dispatch]);

    const sorted = useMemo(() => {
        const toTs = (v) => (v ? new Date(v).getTime() : 0);
        return [...(projects || [])].sort((a, b) => {
            const ba = toTs(b.updatedAt || b.createdAt) || Number(b.id) || 0;
            const aa = toTs(a.updatedAt || a.createdAt) || Number(a.id) || 0;
            return ba - aa;
        });
    }, [projects]);

    const visible = useMemo(() => sorted.slice(0, 3), [sorted]);
    const hasMore = sorted.length > 3;

    const openProject = (id) => {
        navigate(PROJECT_ROUTE.replace(":projectId", id));
    };

    const handleCreate = async (data) => {
        const toastId = toast.loading("Создаём проект…");
        try {
            await dispatch(createProject(data)).unwrap();
            toast.update(toastId, { render: "Проект успешно создан", type: "success", isLoading: false, autoClose: 3000 });
            setShow(false);
            setFormValue({});
        } catch (e) {
            const msg = typeof e === "string" ? e : e?.message || "Не удалось создать проект";
            toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    return (
        <div className="projects-nav">
            <div className="projects-nav__title">
                Проекты
            </div>

            <div className="projects-nav__list">
                <AnsamblesServerButton
                    className="projects-nav__item"
                    title="Добавить проект"
                    onClick={() => setShow(true)}
                    text="+ Добавить"
                />

                {visible.length === 0 && (
                    <></>
                )}

                {visible.map((p) => {
                    const isActive = currentProjectId && String(p.id) === String(currentProjectId);
                    return (
                        <AnsamblesServerButton
                            key={p.id}
                            className={`projects-nav__item ${isActive ? "projects-nav__item--active" : ""}`}
                            title={p?.name || ""}
                            onClick={() => openProject(p?.id)}
                            text={p?.name || "Без названия"}
                        />
                    );
                })}

                {hasMore && (
                    <AnsamblesServerButton
                        className="projects-nav__more"
                        onClick={() => navigate(PROJECTS_ROUTE)}
                        text="⋯ Видеть больше"
                    />
                )}
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

export default ProjectsNavList;