import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
    createProject,
    returnProjectsLoading,
    getProject,
    returnCurrentProject
} from "states/Projects";

import { IfcPane } from "adminView/projects/entities/IfcPane";
import { ProjectChatPane } from "adminView/projects/entities/ProjectChatPane";
import { ProjectModal } from "adminView/projects/features/ProjectModal";

import "./FirstPageContent.css";


const FirstPageContent = ({ onRequestUpload, onProjectCreated }) => {
    const dispatch = useDispatch();

    const loading = useSelector(returnProjectsLoading);
    const currentProject = useSelector(returnCurrentProject);

    const [showModal, setShowModal] = useState(true);
    const [formValue, setFormValue] = useState({});
    const [createdProjectId, setCreatedProjectId] = useState(null);
    const [createdChatId, setCreatedChatId] = useState(null);
    const [newChatDraft, setNewChatDraft] = useState(true);
    const [projectCreated, setProjectCreated] = useState(false);

    const gridRef = useRef(null);
    const chatPaneRef = useRef(null);

    useEffect(() => {
        const el = gridRef.current;
        if (!el)
            return;
        const handler = () => {
            window.dispatchEvent(new Event("resize"));
        };
        el.addEventListener("transitionend", handler);
        return () => el.removeEventListener(
            "transitionend",
            handler
        );
    }, []);

    useEffect(() => {
        setShowModal(true);
    }, []);

    const handleCreate = async (data) => {
        const toastId = toast.loading("Создаём проект…");
        try {
            const result = await dispatch(createProject(data)).unwrap();
            const projectId = result?.id;

            if (!projectId) {
                throw new Error("Не удалось получить ID проекта");
            }

            await dispatch(getProject(projectId)).unwrap();

            setCreatedProjectId(projectId);
            setProjectCreated(true);
            onProjectCreated?.(true);

            toast.update(
                toastId,
                {
                    render: "Проект успешно создан",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                }
            );
            setShowModal(false);
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

    const handleOpenModal = useCallback(() => {
        setShowModal(true);
    }, []);

    useEffect(() => {
        if (onRequestUpload) {
            onRequestUpload(handleOpenModal);
        }
    }, [onRequestUpload, handleOpenModal]);

    const downloadUrl = currentProject?.file_url || null;

    return (
        <>
            <div
                ref={gridRef}
                className="fp-content pd-grid"
            >
                <ProjectChatPane
                    ref={chatPaneRef}
                    collapsed={true}
                    topTitle="Чат с нейросетью"
                    onToggleCollapse={() => {}}
                    projectId={createdProjectId}
                    activeChatId={createdChatId}
                    newChatDraft={newChatDraft}
                    onCloseDraft={() => setNewChatDraft(false)}
                    onChatCreated={setCreatedChatId}
                    showHeader={false}
                    disabled={!projectCreated}
                    onOpenUploadModal={handleOpenModal}
                />
                <IfcPane
                    highlightIds={[]}
                    url={downloadUrl}
                    showHeader={false}
                />
            </div>
            <ProjectModal
                loading={loading}
                show={showModal}
                formData={formValue}
                setFormData={setFormValue}
                submit={handleCreate}
                setShow={setShowModal}
                headerText="Для начала загрузите модель"
            />
        </>
    );
};

export default FirstPageContent;
