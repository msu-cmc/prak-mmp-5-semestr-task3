import "./ComposerBar.css";
import { useCallback } from "react";
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index";
import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton";

const ComposerBar = ({
    value,
    onChange,
    onSend,
    disabled,
    placeholder = "Напишите сообщение…"
}) => {
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
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
            />
            <AnsamblesServerButton
                className="pd-composer__sendbtn"
                onClick={handleSend}
                disabled={disabled || !trimmed}
                aria-label="Отправить"
            >
                <span className="pd-sendicon" />
            </AnsamblesServerButton>
        </div>
    );
};

export default ComposerBar;
