import { useEffect, useRef, useState } from "react";
import { IfcViewer } from "adminView/projects/components/IfcViewer";
import { AnsamblesServerSwitcher } from "shared/components/AnsamblesServerSwitcher";
import "./IfcPane.css";

const IfcPane = ({
    highlightIds = [],
    url = null,
    showHeader = true
}) => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [name, setName] = useState("");
    const [size, setSize] = useState(0);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const inputRef = useRef(null);
    const xhrRef = useRef(null);

    const isValid = (f) => !!f && /\.ifc$/i.test(f.name);
    const formatSize = (n) =>
        n < 1024 ? `${n} B`
        : n < 1048576 ? `${(n / 1024).toFixed(1)} KB`
        : n < 1073741824 ? `${(n / 1048576).toFixed(1)} MB`
        : `${(n / 1073741824).toFixed(1)} GB`;

    const handleFiles = (list) => {
        const f = list?.[0];
        if (!f) return;
        if (!isValid(f)) return;
        setFile(f);
        setName(f.name);
        setSize(f.size || 0);
    };

    const abortDownload = () => {
        try {
            xhrRef.current?.abort();
        } catch {}
        xhrRef.current = null;
        setLoading(false);
        setProgress(0);
    };

    useEffect(() => {
        if (!url) {
            setFile(null);
            setName("");
            setSize(0);
            return;
        }
        abortDownload();
        setLoading(true);
        setProgress(0);
        const guessName = () => {
            try {
                const u = new URL(url);
                const last = u.pathname.split("/").pop() || "model.ifc";
                return decodeURIComponent((last.split("?")[0] || last).replace(/\+/g, " "));
            } catch {
                return "model.ifc";
            }
        };
        const x = new XMLHttpRequest();
        xhrRef.current = x;
        x.open("GET", url, true);
        x.responseType = "blob";
        x.withCredentials = false;
        x.onprogress = (e) => {
            if (e.lengthComputable) {
                const p = Math.max(0, Math.min(100, Math.round((e.loaded / e.total) * 100)));
                setProgress(p);
            }
        };
        x.onload = () => {
            if (x.status >= 200 && x.status < 300) {
                const blob = x.response;
                const fname = guessName();
                const f = new File([blob], fname, { type: "application/octet-stream" });
                setFile(f);
                setName(fname);
                setSize(blob?.size || 0);
            }
            setLoading(false);
            setProgress(100);
            xhrRef.current = null;
        };
        x.onerror = () => {
            setLoading(false);
            setProgress(0);
            xhrRef.current = null;
        };
        x.onabort = () => {
            setLoading(false);
            setProgress(0);
            xhrRef.current = null;
        };
        x.send();
        return abortDownload;
    }, [url]);

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const onPaste = (e) => {
        const items = e.clipboardData?.files;
        if (items && items.length) handleFiles(items);
    };

    return (
        <div className="pd-pane">
            {showHeader && (
                <div className="pd-pane__header">
                    <div className="pd-pane__title">
                        Визуализация модели
                    </div>
                </div>
            )}
            <div className="pd-pane__body">
                {file ? (
                    <>
                        <div className={`pd-viewer-wrap ${isDarkTheme ? "pd-viewer-wrap--dark" : "pd-viewer-wrap--light"}`}>
                            <IfcViewer
                                file={file}
                                url={url}
                                highlightIds={highlightIds}
                                dark={isDarkTheme}
                            />
                        </div>
                        {(file || loading || name) && (
                            <div className="pd-pane__footer" title={name}>
                                <div className="pd-pane__fileinfo">
                                    <div className="pd-pane__filename">
                                        {name || "Загрузка..."}
                                    </div>
                                    <div className="pd-pane__filesize">
                                        {size ? formatSize(size) : null}
                                    </div>
                                </div>
                                <AnsamblesServerSwitcher
                                    checked={isDarkTheme}
                                    onChange={setIsDarkTheme}
                                    leftLabel="Светлая"
                                    rightLabel="Темная"
                                    size="sm"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className={`file-drop ${dragActive ? "file-drop--active" : ""}`}
                        onDragEnter={() => setDragActive(true)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                                inputRef.current?.click();
                        }}
                        onPaste={onPaste}
                        role="button"
                        tabIndex={0}
                        aria-label="Загрузить IFC файл"
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".ifc"
                            className="file-input-hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        {loading && (
                            <div className="pd-loading pd-loading--overlay">
                                <div className="pd-loading__bar">
                                    <div className="pd-loading__fill" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="pd-loading__text">
                                    Загрузка {progress}%
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IfcPane;