import { useRef, useState } from "react";
import "./FileDropzone.css";

const extsFromAccept = (accept) => accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

const formatSize = (n) =>
    n < 1024 ? `${n} B`
    : n < 1048576 ? `${(n / 1024).toFixed(1)} KB`
    : n < 1073741824 ? `${(n / 1048576).toFixed(1)} MB`
    : `${(n / 1073741824).toFixed(1)} GB`;

const FileDropzone = ({
    value,
    onChange,
    onInvalid,
    disabled = false,
    accept = ".ifc",
    label = "IFC модель",
    placeholderPrimary = "Перетащите файл сюда",
    placeholderSecondary = "или",
    actionText = "нажмите для выбора",
    className = "",
    ariaLabel = "Загрузить файл",
    name,
    loading = false,
    progress = null,
    onCancel
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [localError, setLocalError] = useState("");
    const inputRef = useRef(null);
    const acceptedExts = extsFromAccept(accept);

    const isValid = (file) => {
        if (!file) return false;
        if (!acceptedExts.length) return true;
        const n = file.name.toLowerCase();
        return acceptedExts.some((ext) => n.endsWith(ext));
    };

    const handleFiles = (list) => {
        if (!list || list.length === 0) return;
        const file = list[0];
        if (!file) return;
        if (!isValid(file)) {
            const msg = `Только ${accept} файл`;
            setLocalError(msg);
            if (typeof onInvalid === "function") onInvalid(msg);
            if (typeof onChange === "function") onChange(null);
            return;
        }
        setLocalError("");
        if (typeof onChange === "function") onChange(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (disabled || loading) return;
        handleFiles(e.dataTransfer.files);
    };

    const onPaste = (e) => {
        if (disabled || loading) return;
        const items = e.clipboardData?.files;
        if (items && items.length) handleFiles(items);
    };

    const pct = typeof progress === "number" ? Math.max(0, Math.min(100, Math.round(progress))) : null;

    return (
        <div className={`filedz ${className}`}>
            <label className="filedz__label">{label}</label>
            <div
                className={`filedz__drop ${dragActive ? "filedz__drop--active" : ""} ${disabled ? "filedz__drop--disabled" : ""}`}
                onDragEnter={() => !disabled && !loading && setDragActive(true)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => !disabled && !loading && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (disabled || loading) return;
                    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                onPaste={onPaste}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={ariaLabel}
                aria-busy={loading ? "true" : "false"}
            >
                {value ? (
                    <div className="filedz__file">
                        <div className="filedz__meta">
                            <span className="filedz__name">
                                {value.name}
                            </span>
                            <span className="filedz__size">
                                {formatSize(value.size)}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="filedz__remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (inputRef.current) inputRef.current.value = "";
                                if (typeof onChange === "function") onChange(null);
                            }}
                            disabled={loading}
                            aria-label="Удалить файл"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="filedz__placeholder">
                        <span>{placeholderPrimary}</span>
                        <span className="filedz__or">{placeholderSecondary}</span>
                        <span className="filedz__action">{actionText}</span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    className="filedz__input"
                    type="file"
                    name={name}
                    accept={accept}
                    disabled={disabled || loading}
                    onChange={(e) => {
                        handleFiles(e.target.files);
                    }}
                    onClick={(e) => {
                        e.target.value = "";
                    }}
                />
            </div>
            {localError && (
                <div className="filedz__error">
                    {localError}
                </div>
            )}
        </div>
    );
};

export default FileDropzone;