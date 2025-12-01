import "./ProjectModal.css";
import { Modal } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton";
import { ProjectForm } from "adminView/projects/features/ProjectForm";

const ProjectModal = ({
    show,
    setShow,
    formData,
    loading = false,
    setFormData,
    submit,
    headerText = "Добавить проект"
}) => {
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const abortRef = useRef(null);

    const validateForm = () => {
        const { name, file_name, ifc_file, ifc_library_file } = formData || {};
        const newErrors = {};
        if (!name || name.trim() === "")
            newErrors.name = "Поле не должно быть пустым";
        if (!file_name || file_name.trim() === "")
            newErrors.file_name = "Поле не должно быть пустым";
        if (!ifc_file && !ifc_library_file)
            newErrors.ifc_file = "Загрузите файл или выберите из списка";
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const generateUuid = () => Math.random().toString(36).substring(2, 8).toUpperCase();
        const projectName = formData?.name?.trim() || `Новый проект ${generateUuid()}`;
        const payload = {
            name: projectName,
            file_name: formData?.file_name?.trim()
        };
        if (formData?.ifc_file) payload.ifc_file = formData.ifc_file;
        else if (formData?.ifc_library_file?.hash) payload.hash = formData.ifc_library_file.hash;

        setUploading(true);
        setUploadProgress(null);
        abortRef.current = null;

        const opts = {
            onProgress: (p) => {
                if (typeof p === "number") {
                    const v = Math.max(0, Math.min(100, Math.round(p)));
                    setUploadProgress(v);
                }
            },
            setAbort: (fn) => {
                abortRef.current = typeof fn === "function" ? fn : null;
            }
        };

        const res = submit ? submit(payload, opts) : null;
        if (res && typeof res.finally === "function") {
            res.finally(() => {
                setUploading(false);
                setUploadProgress(null);
                abortRef.current = null;
            });
        } else {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const handleCancelUpload = () => {
        try { abortRef.current && abortRef.current(); } catch {}
        setUploading(false);
        setUploadProgress(null);
    };

    useEffect(() => {
        if (show) {
            const generateUuid = () => Math.random().toString(36).substring(2, 8).toUpperCase();
            setFormData({ name: `Новый проект ${generateUuid()}` });
            setErrors({});
            setUploading(false);
            setUploadProgress(null);
            abortRef.current = null;
        }
    }, [show, setFormData]);

    return (
        <Modal
            show={show}
            onHide={() => { if (!loading && !uploading) setShow(false); }}
            centered
            keyboard={false}
            backdrop="static"
            dialogClassName="my-project-modal"
            contentClassName="my-project-modal-content"
            backdropClassName="my-project-modal-backdrop"
        >
            <Modal.Header>
                <h1 className="project-header">
                    {headerText}
                </h1>
            </Modal.Header>
            <Modal.Body className="my-modal-body-side-padding">
                <ProjectForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    disabled={loading || uploading}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    onCancelUpload={handleCancelUpload}
                />
            </Modal.Body>
            <Modal.Footer className="modal-2-btn-footer">
                <AnsamblesServerButton
                    onClick={() => setShow(false)}
                    text="Отмена"
                    disabled={loading || uploading}
                />
                <AnsamblesServerButton
                    loading={loading || uploading}
                    disabled={loading || uploading}
                    onClick={handleSubmit}
                    text="Добавить"
                />
            </Modal.Footer>
        </Modal>
    );
};

export default ProjectModal;
