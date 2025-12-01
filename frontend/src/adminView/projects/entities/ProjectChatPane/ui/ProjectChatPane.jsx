import "./ProjectChatPane.css";

import {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { NewChatDraft } from "adminView/projects/entities/NewChatDraft";
import { ChatMessages } from "adminView/projects/entities/ChatMessages";

import { ComposerBar } from "shared/components/ComposerBar/Index";
import { ReactComponent as Icon } from "shared/assets/items/1.svg";

import {
    getChat,
    createChat,
    getChats,
    chatsActions
} from "states/Сhats";
import {
    getMessages,
    createMessage,
    selectMessagesByChat,
    selectLoadingByChat,
    messagesActions
} from "states/Messages";
import { returnLoggedUser } from "states/LoggedUser";
import { getUserIdForMessages } from "shared/lib/getUserIdForMessages";

const ProjectChatPane = forwardRef(({
    collapsed,
    topTitle,
    onToggleCollapse,
    projectId,
    activeChatId,
    newChatDraft,
    onCloseDraft,
    onChatCreated,
    showHeader = true,
    disabled = false,
    onOpenUploadModal
}, ref) => {
    const dispatch = useDispatch();

    // Получаем авторизованного пользователя или используем гостя (id=3)
    const loggedUser = useSelector(returnLoggedUser);
    const userId = getUserIdForMessages(loggedUser);

    const messages = useSelector(selectMessagesByChat(activeChatId));
    const loadingMessages = useSelector(selectLoadingByChat(activeChatId));

    const [draftText, setDraftText] = useState("");
    const [msgText, setMsgText] = useState("");

    // Ref для отслеживания чатов, для которых НЕ нужно вызывать getMessages
    const skipGetMessagesRef = useRef(new Set());

    const mode = useMemo(() => {
        if (newChatDraft) return "draft";
        if (activeChatId) return "chat";
        return "empty";
    }, [newChatDraft, activeChatId]);

    const chainInfo = useMemo(() => {
        const list = Array.isArray(messages) ? messages.filter(m => Number.isInteger(m?.id)) : [];
        const first = list.length ? list[0].id : null;
        const last = list.length ? list[list.length - 1].id : null;
        return { root_id: first, parent_id: last };
    }, [messages]);

    useEffect(() => {
        if (!projectId || !activeChatId || newChatDraft) return;

        // Если этот чат только что создан - не загружаем сообщения (они уже добавлены оптимистично)
        if (skipGetMessagesRef.current.has(activeChatId)) {
            skipGetMessagesRef.current.delete(activeChatId);
            dispatch(getChat({ project_id: projectId, chat_id: activeChatId }));
            return;
        }

        dispatch(getChat({ project_id: projectId, chat_id: activeChatId }));
        dispatch(getMessages({ project_id: projectId, chat_id: activeChatId }));
    }, [dispatch, projectId, activeChatId, newChatDraft]);

    const addOptimisticMessages = useCallback((chatId, userText) => {
        const now = Date.now();
        const userMsg = {
            id: `tmp-u-${now}`,
            user_id: userId,
            text: userText,
            role: "user",
            pending: false,
            client_ts: now
        };
        const thinkingMsg = {
            id: `tmp-thinking-${now}`,
            user_id: 0,
            text: "Думает...",
            role: "assistant",
            thinking: true,
            client_ts: now + 1
        };
        dispatch(messagesActions.addOptimisticMessages({
            chat_id: chatId,
            messages: [userMsg, thinkingMsg]
        }));
    }, [dispatch, userId]);

    const submitDraft = async (textFromDraft) => {
        if (!projectId) return;
        const uid = Number(userId);
        if (!Number.isInteger(uid)) return;
        const text = String(textFromDraft ?? draftText).trim();
        if (!text) return;

        if (activeChatId) {
            setDraftText("");
            return sendInExisting(text);
        }

        const name = text.split(/\s+/).slice(0, 3).join(" ") || "Новый чат";

        try {
            // 1. Создаем чат
            const created = await dispatch(createChat({
                project_id: projectId,
                name: name
            })).unwrap();
            const newId = (created?.chat ?? created)?.id;
            if (!newId) return;

            // 2. Помечаем чат как "не загружать сообщения из API"
            skipGetMessagesRef.current.add(newId);

            // 3. Устанавливаем активный чат (это вызовет useEffect, но он пропустит getMessages)
            if (chatsActions?.setCurrentChatId)
                dispatch(chatsActions.setCurrentChatId(newId));

            onChatCreated?.(newId);
            onCloseDraft?.();
            setDraftText("");

            await dispatch(getChats({ project_id: projectId })).unwrap();

            // 4. Добавляем оптимистичные сообщения (user + thinking) в Redux
            addOptimisticMessages(newId, text);

            // 5. Отправляем сообщение - backend вернет и user и assistant сообщения
            await dispatch(createMessage({
                project_id: projectId,
                chat_id: newId,
                user_id: uid,
                text: text
            })).unwrap();

        } catch (error) {
            console.error(error);
        }
    };

    const sendInExisting = async (textArg) => {
        if (disabled) {
            toast.error("Загрузите для начала модель");
            return;
        }
        if (!projectId || !activeChatId) return;
        const uid = Number(userId);
        if (!Number.isInteger(uid)) return;

        const text = String(textArg ?? msgText).trim();
        if (!text) return;

        const payload = {
            user_id: uid,
            text: text
        };

        if (Number.isInteger(chainInfo.parent_id))
            payload.parent_id = chainInfo.parent_id;
        if (Number.isInteger(chainInfo.root_id))
            payload.root_id = chainInfo.root_id;

        try {
            setMsgText("");

            // Добавляем оптимистичные сообщения (user + thinking) в Redux
            addOptimisticMessages(activeChatId, text);

            // Отправляем сообщение - backend вернет и user и assistant сообщения
            await dispatch(createMessage({
                project_id: projectId,
                chat_id: activeChatId,
                ...payload
            })).unwrap();

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (mode !== "chat") {
            setMsgText("");
        }
        if (mode === "draft") setDraftText("");
    }, [mode]);

    const hasThinking = useMemo(() =>
        messages.some(m => m.thinking || (typeof m.id === "string" && m.id.startsWith("tmp-thinking"))),
        [messages]
    );
    const showLoading = Boolean(loadingMessages) && !hasThinking;

    return (
        <div ref={ref} className="pd-pane">
            {showHeader && (
                <div className="pd-pane__head">
                    <div className="pd-head-end">
                        {collapsed && (
                            <Icon
                                className="pd-iconbtn pd-iconbtn--stroke"
                                onClick={onToggleCollapse}
                            />
                        )}
                    </div>
                    <span className="pd-title">
                        {topTitle || "Чат с нейросетью"}
                    </span>
                </div>
            )}
            <div className="pd-pane__body">
                {mode === "draft" && (
                    <NewChatDraft
                        value={draftText}
                        onChange={setDraftText}
                        onSubmit={submitDraft}
                        disabled={disabled}
                        onOpenUploadModal={onOpenUploadModal}
                    />
                )}
                {mode === "chat" && (
                    <>
                        <div className="pd-pane__chat">
                            <ChatMessages messages={messages} />
                        </div>
                        <div className="pd-pane__composer">
                            <ComposerBar
                                value={msgText}
                                onChange={setMsgText}
                                onSend={sendInExisting}
                                disabled={Boolean(loadingMessages)}
                                placeholder="Напишите сообщение…"
                            />
                            {disabled && (
                                <div className="pd-pane__hint">
                                    Для начала загрузите модель
                                </div>
                            )}
                        </div>
                    </>
                )}
                {mode === "empty" &&
                    <NewChatDraft
                        value={draftText}
                        onChange={setDraftText}
                        onSubmit={submitDraft}
                        disabled={disabled}
                        onOpenUploadModal={onOpenUploadModal}
                    />
                }
            </div>
        </div>
    );
});

export default ProjectChatPane;