import "./ProjectChatsSidebar.css";

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFitTitle } from "./utils";

import { ChatActionsMenu } from "adminView/projects/entities/ChatActionsMenu";

import { ReactComponent as Left } from "shared/assets/items/chevron-left.svg";
import { ReactComponent as X_item } from "shared/assets/items/x-lg.svg";
import { ReactComponent as Icon } from "shared/assets/items/1.svg";
import { PROJECTS_ROUTE } from "shared/consts/paths";

const ProjectChatsSidebar = ({
    projectTitle,
    chats,
    activeChatId,
    onPickChat,
    collapsed,
    onToggleCollapse,
    onRenameChat,
    onDeleteChat,
    onStartNewChat
}) => {
    const navigate = useNavigate();
    const titleRef = useRef(null);
    const prefix = "";
    const shownTitle = useFitTitle(projectTitle || "", prefix, titleRef);

    return (
        <aside className={`pd-sidebar ${collapsed ? "is-collapsed" : ""}`}>
            <div className="pd-sidebar__head">
                <Left
                    className="pd-head-start__logo"
                    onClick={() => navigate(PROJECTS_ROUTE)}
                    aria-label="Вернуться к проектам"
                />
                <span
                    ref={titleRef}
                    className="pd-title"
                    title={prefix + (projectTitle || "")}
                >
                    {shownTitle}
                </span>
                <div className="pd-actions">
                    <X_item
                        className="pd-iconbtn--xitem"
                        onClick={onStartNewChat}
                        aria-label="Создать новый чат"
                    />
                    <Icon
                        className="pd-iconbtn pd-iconbtn--stroke"
                        onClick={onToggleCollapse}
                        aria-label={collapsed ? "Показать чаты" : "Скрыть чаты"}
                    />
                </div>
            </div>

            <div className="pd-chatlist">
                {chats.map((c) => {
                    const isActive = String(c.id) === String(activeChatId);
                    return (
                        <div key={c.id} className={`pd-chat ${isActive ? "is-active" : ""}`}>
                            <button
                                type="button"
                                className="pd-chat__main"
                                onClick={() => onPickChat(c.id)}
                                aria-pressed={isActive}
                                data-active={isActive ? "1" : "0"}
                            >
                                <div className="pd-chat__title">
                                    {c.name || "Без названия"}
                                </div>
                            </button>
                            <ChatActionsMenu
                                chat={c}
                                onRenameChat={onRenameChat}
                                onDeleteChat={onDeleteChat}
                            />
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default ProjectChatsSidebar;