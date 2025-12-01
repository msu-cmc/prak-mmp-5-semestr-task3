import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    getChats,
    deleteChat,
    updateChat,
    chatsActions,
    returnChats,
    returnCurrentChatId
} from "states/Сhats";
import { getMessages, messagesActions } from "states/Messages";
import { returnProjectNames, getProject, returnCurrentProject } from "states/Projects";

import { IfcPane } from "adminView/projects/entities/IfcPane";
import { ProjectChatPane } from "adminView/projects/entities/ProjectChatPane";
import { ProjectChatsSidebar } from "adminView/projects/entities/ProjectChatsSidebar";

import "./ProjectContent.css";


const ProjectContent = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();

    const chats = useSelector(returnChats) || [];
    const activeChatId = useSelector(returnCurrentChatId);

    const projectNames = useSelector(returnProjectNames) || {};
    const currentProject = useSelector(returnCurrentProject);
    const downloadUrl = currentProject?.file_url || null;

    const p = projectNames[projectId] || "Без названия";

    const [collapsed, setCollapsed] = useState(false);
    const [newChatDraft, setNewChatDraft] = useState(false);

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
        if (!projectId)
            return;
        dispatch(getChats({
            project_id: projectId
        }));
    }, [dispatch, projectId]);

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
        if ((!projectId) || (!chats.length))
            return;
        if (activeChatId == null && !newChatDraft) {
            const firstId = chats[0]?.id;
            if (firstId != null) {
                if (chatsActions?.setCurrentChatId)
                    dispatch(chatsActions.setCurrentChatId(
                        firstId
                    ));
                dispatch(getMessages({
                    project_id: projectId,
                    chat_id: firstId
                }));
            }
        }
    }, [dispatch, projectId, chats, activeChatId, newChatDraft]);

    useEffect(() => {
        if (!projectId)
            return;
        if (chats.length === 0 && activeChatId == null) {
            if (chatsActions?.setCurrentChatId)
                dispatch(chatsActions.setCurrentChatId(null));
            setNewChatDraft(true);
            dispatch(messagesActions.clearMessages());
        }
    }, [dispatch, projectId, chats, activeChatId]);

    useEffect(() => {
        dispatch(getProject(projectId))
    }, [dispatch, projectId]);

    const onPickChat = (chat_id) => {
        if (!projectId) return;
        setNewChatDraft(false);
        if (chatsActions?.setCurrentChatId)
            dispatch(chatsActions.setCurrentChatId(
                chat_id
            ));
        dispatch(getMessages({
            project_id: projectId,
            chat_id
        }));
    };

    const onRenameChat = (chat_id, name) => {
        if (!projectId) return;
        dispatch(updateChat({
            project_id: projectId,
            chat_id: chat_id,
            name: name
        }));
    };

    const onDeleteChat = async (chat_id) => {
        if (!projectId) return;
        await dispatch(deleteChat({
            project_id: projectId,
            chat_id: chat_id
        })).unwrap();
        const nextList = await dispatch(getChats({
            project_id: projectId
        })).unwrap();
        const hasActive = nextList.some(c => {
            c.id === activeChatId
        });
        const nextActive = hasActive ? activeChatId : (nextList[0]?.id ?? null);
        if (chatsActions?.setCurrentChatId)
            dispatch(chatsActions.setCurrentChatId(nextActive));
        dispatch(messagesActions.clearMessages());
        if (nextActive != null) {
            dispatch(getMessages({
                project_id: projectId,
                chat_id: nextActive
            }));
        } else {
            setNewChatDraft(true);
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
        <div
            ref={gridRef}
            className={`content pd-grid ${collapsed ? "is-collapsed" : ""}`}
        >
            <ProjectChatsSidebar
                projectTitle={p}
                chats={chats}
                activeChatId={activeChatId}
                onPickChat={onPickChat}
                collapsed={collapsed}
                onToggleCollapse={toggleCollapsed}
                onRenameChat={onRenameChat}
                onDeleteChat={onDeleteChat}
                onStartNewChat={onStartNewChat}
            />
            <ProjectChatPane
                ref={chatPaneRef}
                collapsed={collapsed}
                topTitle={topTitle}
                onToggleCollapse={toggleCollapsed}
                projectId={projectId}
                activeChatId={activeChatId}
                newChatDraft={newChatDraft}
                showHeader={false}
                onCloseDraft={() => setNewChatDraft(false)}
            />
            <section className="pd-viewer">
                <IfcPane
                    highlightIds={[]}
                    url={downloadUrl}
                    showHeader={false}
                />
            </section>
        </div>
    );
};

export default ProjectContent;