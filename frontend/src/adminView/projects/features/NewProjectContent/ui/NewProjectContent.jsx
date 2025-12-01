import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
    chatsActions,
    returnChats,
    returnCurrentChatId
} from "states/Сhats";
import { messagesActions } from "states/Messages";
import { createProject, returnProjectsLoading } from "states/Projects";

import { IfcPane } from "adminView/projects/entities/IfcPane";
import { ProjectChatPane } from "adminView/projects/entities/ProjectChatPane";
import { ProjectChatsSidebar } from "adminView/projects/entities/ProjectChatsSidebar";
import { ProjectModal } from "adminView/projects/features/ProjectModal";

import "./NewProjectContent.css";


const NewProjectContent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const chats = useSelector(returnChats) || [];
    const activeChatId = useSelector(returnCurrentChatId);
    const loading = useSelector(returnProjectsLoading);

    const [collapsed, setCollapsed] = useState(true);
    const [newChatDraft, setNewChatDraft] = useState(false);
    const [showModal, setShowModal] = useState(true);
    const [formValue, setFormValue] = useState({});

    const gridRef = useRef(null);
    const chatPaneRef = useRef(null);

    const activeChatName = useMemo(() => {
        const c = chats.find(x => x.id === activeChatId);
        return c?.name || "";
    }, [chats, activeChatId]);

    const topTitle = useMemo(() => {
        if (collapsed && newChatDraft)
            return "Новый чат";
        return collapsed ? activeChatName : "Чат с нейросетью";
    }, [collapsed, activeChatName, newChatDraft]);

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
            if (result?.id) {
                navigate(`/projects/${result.id}`);
            }
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

    const toggleCollapsed = () => {
        if (!collapsed) {
            const w = chatPaneRef.current?.getBoundingClientRect().width || 0;
            const target = Math.max(280, Math.round(w * 0.75));
            gridRef.current?.style.setProperty("--chat-w-fixed", `${target}px`);
        }
        setCollapsed(v => !v);
    };

    const onStartNewChat = () => {
        if (chatsActions?.setCurrentChatId)
            dispatch(chatsActions.setCurrentChatId(null));
        setNewChatDraft(true);
        dispatch(messagesActions.clearMessages());
    };

    return (
        <>
            <div
                ref={gridRef}
                className={`content pd-grid ${collapsed ? "is-collapsed" : ""}`}
            >
                <ProjectChatsSidebar
                    projectTitle="Новый проект"
                    chats={chats}
                    activeChatId={activeChatId}
                    onPickChat={() => {}}
                    collapsed={collapsed}
                    onToggleCollapse={toggleCollapsed}
                    onRenameChat={() => {}}
                    onDeleteChat={() => {}}
                    onStartNewChat={onStartNewChat}
                />
                <ProjectChatPane
                    ref={chatPaneRef}
                    collapsed={collapsed}
                    topTitle={topTitle}
                    onToggleCollapse={toggleCollapsed}
                    projectId={null}
                    activeChatId={activeChatId}
                    newChatDraft={newChatDraft}
                    showHeader={false}
                    onCloseDraft={() => setNewChatDraft(false)}
                />
                <section className="pd-viewer">
                    <IfcPane
                        highlightIds={[]}
                        url={null}
                        showHeader={false}
                    />
                </section>
            </div>
            <ProjectModal
                loading={loading}
                show={showModal}
                formData={formValue}
                setFormData={setFormValue}
                submit={handleCreate}
                setShow={setShowModal}
            />
        </>
    );
};

export default NewProjectContent;