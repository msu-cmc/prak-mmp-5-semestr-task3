import { useCallback } from "react";
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index";
import "./ChatComposer.css";
import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton";

const ChatComposer = ({ value, onChange, onSend, disabled }) => {
    const trimmed = typeof value === "string" ? value.trim() : "";

    const handleSend = useCallback(() => {
        if (disabled) return;
        if (!trimmed) return;
        onSend?.(trimmed);
        onChange?.("");
    }, [disabled, trimmed, onSend, onChange]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (
        <div className="pd-composer">
            <AnsamblesServerInput
                as="textarea"
                rows={1}
                minRows={1}
                maxRows={8}
                autoResize
                value={value}
                onChange={(v) => onChange(typeof v === "string" ? v : (v?.target?.value ?? ""))}
                placeholder="Напишите сообщение…"
                onKeyDown={handleKeyDown}
            />
            <AnsamblesServerButton
                className="pd-composer__sendbtn"
                onClick={handleSend}
                disabled={disabled || !trimmed}
                aria-label="Отправить"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
            </AnsamblesServerButton>
        </div>
    );
};

export default ChatComposer;
