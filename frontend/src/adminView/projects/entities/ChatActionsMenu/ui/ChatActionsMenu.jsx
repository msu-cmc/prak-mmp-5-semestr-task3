import { useEffect, useRef, useState } from "react";
import "./ChatActionsMenu.css";

import { ReactComponent as X_item } from "shared/assets/items/x-lg.svg";
import { AnsamblesServerDeletionModal } from "shared/components/AnsamblesServerDeletionModal";

const ChatActionsMenu = ({ chat, onRenameChat, onDeleteChat }) => {
    const [open, setOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);
    const btnRef = useRef(null);

    const toggle = (e) => {
        e.stopPropagation();
        setOpen((v) => !v);
    };

    const handleRename = (e) => {
        e.stopPropagation();
        const next = window.prompt("Новое имя чата:", chat.name || "");
        if (next && next.trim() && typeof onRenameChat === "function") {
            onRenameChat(chat.id, next.trim());
        }
        setOpen(false);
    };

    const openDeleteModal = (e) => {
        e.stopPropagation();
        setOpen(false);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (typeof onDeleteChat === "function") {
            await onDeleteChat(chat.id);
        }
        setIsModalOpen(false);
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (!menuRef.current || !btnRef.current) return;
            if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onEsc = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    return (
        <div className={`pd-chat__actions${open ? " is-open" : ""}`}>
            <button
                ref={btnRef}
                className="pd-iconbtn pd-kebab"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Действия"
                onClick={toggle}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="5" cy="12" r="1.6"></circle>
                    <circle cx="12" cy="12" r="1.6"></circle>
                    <circle cx="19" cy="12" r="1.6"></circle>
                </svg>
            </button>

            {open && (
                <div ref={menuRef} className="pd-menu" role="menu">
                    <button className="pd-menu__item" role="menuitem" onClick={handleRename}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                        <span>Переименовать</span>
                    </button>
                    <button className="pd-menu__item is-danger" role="menuitem" onClick={openDeleteModal}>
                        <X_item className="pd-iconbtn--delete" />
                        <span>Удалить</span>
                    </button>
                </div>
            )}

            <AnsamblesServerDeletionModal
                loading={false}
                show={isModalOpen}
                setShow={setIsModalOpen}
                header="Удаление чата"
                submit={handleConfirmDelete}
            />
        </div>
    );
};

export default ChatActionsMenu;
